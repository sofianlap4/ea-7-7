import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { COURSE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { Op } from "sequelize";
import { checkPackAccess } from "../middleware/checkAccess";

const courseRoutes = (): Router => {
  const router = express.Router();

  // Get courses for the logged-in student (included in their packs)
  router.get(
    "/my",
    authenticateToken,
    authorizeRoles("student"),
    checkPackAccess, // <-- Add here
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPack, Pack, Course, UserCourseProgress } = req.app.get("models");

        // Find active UserPack for the user
        const userPack = await UserPack.findOne({
          where: {
            userId: req.user.id,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
          include: [
            {
              model: Pack,
              as: "pack",
              include: [{ model: Course, as: "courses" }],
            },
          ],
        });

        if (!userPack || !userPack.pack) return sendSuccess(res, [], 200);

        // Return all courses in the pack
        let courses = userPack.pack.courses || [];

        // Fetch all UserCourseProgress for the current user
        const userCourseProgress = await UserCourseProgress.findAll({
          where: { userId: (req as any).user.id },
          attributes: ["courseId", "isOpened"],
        });

        // Map courseId to isOpened for quick lookup
        const progressMap: Record<string, boolean> = {};
        userCourseProgress.forEach((progress: any) => {
          progressMap[progress.courseId] = progress.isOpened;
        });

        // Add isOpened to each course
        const coursesWithOpened = courses.map((course: any) => ({
          ...course.toJSON(),
          isOpened: progressMap[course.id] || false,
        }));

        sendSuccess(res, coursesWithOpened, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Create a new course (only admins and superadmins)
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, packIds } = req.body; // packIds is now an array

        let videos: { title: string; url: string }[] = [];
        if (req.body.videos) {
          try {
            videos = JSON.parse(req.body.videos);
          } catch {
            return sendError(res, COURSE_RESPONSE_MESSAGES.INVALID_VIDEOS_FORMAT, 400);
          }
        }

        const course = await req.app.get("models").Course.create({
          title,
          description,
          creatorId: req.user.id,
        });

        // Associate with multiple packs
        if (Array.isArray(packIds) && packIds.length > 0) {
          await course.setPacks(packIds);
        }

        if (videos.length > 0) {
          for (const video of videos) {
            await req.app.get("models").Video.create({
              title: video.title,
              url: video.url,
              courseId: course.id,
            });
          }
        }

        const createdCourse = await req.app.get("models").Course.findByPk(course.id, {
          include: [{ model: req.app.get("models").Video, as: "videos" }],
        });

        sendSuccess(res, createdCourse, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all courses
  router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await req.app.get("models").Course.findAll({
        include: [{ model: req.app.get("models").Pack, as: "packs", attributes: ["id", "name"] }],
      });
      sendSuccess(res, courses, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get a course by ID
  router.get(
    "/id/:id",
    authenticateToken,
    checkPackAccess, // <-- Add here
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Course } = req.app.get("models");
        const course = await Course.findByPk(req.params.id);
        if (!course) return sendError(res, COURSE_RESPONSE_MESSAGES.COURSE_NOT_FOUND, 404);

        // Set isOpened to true if not already true
        // In your course GET route
        const { UserCourseProgress } = req.app.get("models");
        await UserCourseProgress.findOrCreate({
          where: { userId: req.user.id, courseId: req.params.id },
          defaults: { isOpened: true, openedAt: new Date() },
        });

        sendSuccess(res, course, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Update a course by ID
  router.put(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { title, description, packIds } = req.body;
        let { videos, quizz, questions } = req.body;
        const { Course, Video, Quizz, QuizzQuestion } = req.app.get("models");

        if (typeof videos === "string") {
          try {
            videos = JSON.parse(videos);
          } catch {
            videos = [];
          }
        }
        if (typeof quizz === "string") {
          try {
            quizz = JSON.parse(quizz);
          } catch {
            quizz = null;
          }
        }
        if (typeof questions === "string") {
          try {
            questions = JSON.parse(questions);
          } catch {
            questions = [];
          }
        }

        const course = await Course.findByPk(id);
        if (!course) return sendError(res, COURSE_RESPONSE_MESSAGES.COURSE_NOT_FOUND, 404);

        // Update basic fields
        course.title = title ?? course.title;
        course.description = description ?? course.description;
        await course.save();

        // Update packs association
        if (Array.isArray(packIds)) {
          await course.setPacks(packIds);
        }

        // --- VIDEOS ---
        if (Array.isArray(videos)) {
          // Fetch all existing videos for this course
          const existingVideos = await Video.findAll({ where: { courseId: id } });
          const existingVideoIds = existingVideos.map((v: any) => v.id);

          // Update or create videos
          for (const video of videos) {
            if (video.id && existingVideoIds.includes(video.id)) {
              // Update existing video
              const dbVideo = existingVideos.find((v: any) => v.id === video.id);
              if (dbVideo) {
                dbVideo.title = video.title;
                dbVideo.url = video.url;
                await dbVideo.save();
              }
            } else {
              // Create new video
              await Video.create({
                title: video.title,
                url: video.url,
                courseId: id,
              });
            }
          }
          // Delete removed videos
          const incomingIds = videos.filter((v) => v.id).map((v) => v.id);
          for (const dbVideo of existingVideos) {
            if (!incomingIds.includes(dbVideo.id)) {
              await dbVideo.destroy();
            }
          }
        }

        // --- QUIZZ & QUESTIONS ---
        if (quizz) {
          // Update or create quizz
          let courseQuizz = await Quizz.findOne({ where: { courseId: id } });
          if (courseQuizz) {
            courseQuizz.title = quizz.title ?? courseQuizz.title;
            await courseQuizz.save();
          } else {
            courseQuizz = await Quizz.create({ courseId: id, title: quizz.title });
          }

          // Update questions if provided
          if (Array.isArray(questions)) {
            // Fetch all existing questions for this quizz
            const existingQuestions = await QuizzQuestion.findAll({
              where: { quizzId: courseQuizz.id },
            });
            const existingQuestionIds = existingQuestions.map((q: any) => q.id);

            // Update or create questions
            for (const q of questions) {
              if (q.id && existingQuestionIds.includes(q.id)) {
                // Update existing question
                const dbQ = existingQuestions.find((qq: any) => qq.id === q.id);
                if (dbQ) {
                  dbQ.question = q.question;
                  dbQ.correctAnswer = q.correctAnswer;
                  dbQ.choices = q.choices;
                  await dbQ.save();
                }
              } else {
                // Create new question
                await QuizzQuestion.create({
                  quizzId: courseQuizz.id,
                  question: q.question,
                  correctAnswer: q.correctAnswer,
                  choices: q.choices,
                });
              }
            }
            // Delete removed questions
            const incomingQuestionIds = questions.filter((q) => q.id).map((q) => q.id);
            for (const dbQ of existingQuestions) {
              if (!incomingQuestionIds.includes(dbQ.id)) {
                await dbQ.destroy();
              }
            }
          }
        }

        // Return the updated course with videos and quizz
        const updatedCourse = await Course.findByPk(id, {
          include: [
            { model: Video, as: "videos" },
            { model: Quizz, as: "quizz", include: [{ model: QuizzQuestion, as: "questions" }] },
          ],
        });

        sendSuccess(res, updatedCourse, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a course by ID
  router.delete(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { Course } = req.app.get("models");

        const deleted = await Course.destroy({ where: { id } });
        if (!deleted) return sendError(res, COURSE_RESPONSE_MESSAGES.COURSE_NOT_FOUND, 404);

        sendSuccess(res, deleted, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};

export default courseRoutes;
