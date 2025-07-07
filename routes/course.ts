import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { COURSE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { Op } from "sequelize";

const courseRoutes = (): Router => {
  const router = express.Router();

  // Get courses for the logged-in student (included in their packs)
  router.get(
    "/my",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPack, Pack, Course } = req.app.get("models");

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
        sendSuccess(res, courses, 200);
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
  router.get("/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const course = await req.app.get("models").Course.findByPk(req.params.id);
      if (!course) return sendError(res, COURSE_RESPONSE_MESSAGES.COURSE_NOT_FOUND, 404);
      sendSuccess(res, course, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Update a course by ID
  router.put(
    "/:id",
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

        // Update videos
        if (videos) {
          const parsedVideos = typeof videos === "string" ? JSON.parse(videos) : videos;
          await Video.destroy({ where: { courseId: id } });
          for (const video of parsedVideos) {
            await Video.create({
              title: video.title,
              url: video.url,
              courseId: id,
            });
          }
        }

        // Update quizz and questions
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
          if (questions && Array.isArray(questions)) {
            await QuizzQuestion.destroy({ where: { quizzId: courseQuizz.id } });
            for (const q of questions) {
              await QuizzQuestion.create({
                quizzId: courseQuizz.id,
                question: q.question,
                correctAnswer: q.correctAnswer,
                choices: q.choices,
              });
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
    "/:id",
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
