import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendSuccess, sendError } from "../utils/response";
import { COURSE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { Op } from "sequelize";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, basename + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error(COURSE_RESPONSE_MESSAGES.ONLY_PDF));
  },
});

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

        // If the pack is free, only return free courses
        let courses = userPack.pack.courses || [];
        if (userPack.price === 0) {
          courses = courses.filter((c: any) => c.isFree);
        }

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
    upload.single("pdf"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, packIds, isFree } = req.body; // packIds is now an array
        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const pdfOriginalName = req.file ? req.file.originalname : undefined;

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
          pdfUrl,
          pdfOriginalName,
          creatorId: req.user.id,
          isFree,
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

  // POST /api/courses/:courseId/quizz/submit
  router.post(
    "/:courseId/quizz/submit",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { courseId } = req.params;
        const { answers } = req.body;
        const { Quizz, QuizzQuestion, Ranking, QuizzSubmission } = req.app.get("models");
        const userId = req.user.id;

        const quizz = await Quizz.findOne({ where: { courseId } });
        if (!quizz) return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);

        const previous = await QuizzSubmission.findOne({
          where: { userId, quizzId: quizz.id, success: true },
        });
        if (previous) {
          return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_ALREADY_PASSED, 403);
        }

        const questions = await QuizzQuestion.findAll({ where: { quizzId: quizz.id } });

        const incorrectAnswers: any[] = [];
        questions.forEach((q: any) => {
          if (answers[q.id] !== q.correctAnswer) {
            incorrectAnswers.push({
              questionId: q.id,
              correctAnswer: q.correctAnswer,
              question: q.question,
            });
          }
        });

        if (incorrectAnswers.length > 0) {
          await QuizzSubmission.create({ userId, quizzId: quizz.id, success: false });
          return sendSuccess(res, { success: false, incorrectAnswers }, 200);
        }

        let ranking = await Ranking.findOne({ where: { userId } });
        if (!ranking) {
          ranking = await Ranking.create({ userId, points: 5 });
        } else {
          ranking.points += 5;
          await ranking.save();
        }

        await QuizzSubmission.create({ userId, quizzId: quizz.id, success: true });

        return sendSuccess(
          res,
          {
            message: COURSE_RESPONSE_MESSAGES.QUIZZ_SUCCESS,
          },
          200
        );
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Create a quizz for a course
  router.post(
    "/:courseId/quizz",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { courseId } = req.params;
        const { title } = req.body;
        const { Quizz } = req.app.get("models");

        const existing = await Quizz.findOne({ where: { courseId } });
        if (existing) return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_ALREADY_EXISTS, 400);

        const quizz = await Quizz.create({ courseId, title });
        sendSuccess(res, quizz, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Edit a quizz
  router.put(
    "/quizz/:quizzId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { quizzId } = req.params;
        const { title } = req.body;
        const { Quizz } = req.app.get("models");

        const quizz = await Quizz.findByPk(quizzId);
        if (!quizz) return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);

        quizz.title = title ?? quizz.title;
        await quizz.save();
        sendSuccess(res, quizz, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a quizz (and its questions)
  router.delete(
    "/quizz/:quizzId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { quizzId } = req.params;
        const { Quizz, QuizzQuestion } = req.app.get("models");

        await QuizzQuestion.destroy({ where: { quizzId } });
        const deleted = await Quizz.destroy({ where: { id: quizzId } });
        if (!deleted) return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);

        sendSuccess(res, deleted, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Add a question to a quizz
  router.post(
    "/quizz/:quizzId/question",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { quizzId } = req.params;
        const { question, correctAnswer, choices } = req.body;
        const { QuizzQuestion } = req.app.get("models");

        const q = await QuizzQuestion.create({ quizzId, question, correctAnswer, choices });
        sendSuccess(res, q, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Edit a question
  router.put(
    "/quizz/question/:questionId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { questionId } = req.params;
        const { question, correctAnswer, choices } = req.body;
        const { QuizzQuestion } = req.app.get("models");

        const q = await QuizzQuestion.findByPk(questionId);
        if (!q) return sendError(res, COURSE_RESPONSE_MESSAGES.QUESTION_NOT_FOUND, 404);

        q.question = question ?? q.question;
        q.correctAnswer = correctAnswer ?? q.correctAnswer;
        q.choices = choices ?? q.choices;
        await q.save();
        sendSuccess(res, q, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a question
  router.delete(
    "/quizz/question/:questionId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { questionId } = req.params;
        const { QuizzQuestion } = req.app.get("models");

        const deleted = await QuizzQuestion.destroy({ where: { id: questionId } });
        if (!deleted) return sendError(res, COURSE_RESPONSE_MESSAGES.QUESTION_NOT_FOUND, 404);

        sendSuccess(res, deleted, 200);
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

  // Get the quizz for a course
  router.get(
    "/:courseId/quizz",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { courseId } = req.params;
        const { Quizz } = req.app.get("models");
        const quizz = await Quizz.findOne({ where: { courseId } });
        if (!quizz) return sendError(res, COURSE_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);
        sendSuccess(res, quizz, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all questions for a quizz
  router.get(
    "/quizz/:quizzId/questions",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { quizzId } = req.params;
        const { QuizzQuestion } = req.app.get("models");
        const questions = await QuizzQuestion.findAll({ where: { quizzId } });
        sendSuccess(res, questions, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Update a course by ID
  router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    upload.single("pdf"), // Allow PDF upload on update
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { title, description, packIds, isFree } = req.body; // <-- add isFree here
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
        if (typeof isFree !== "undefined") course.isFree = isFree === "true" || isFree === true; // <-- update isFree

        // Update PDF if provided
        if (req.file) {
          // Remove old PDF if exists
          if (course.pdfUrl) {
            const oldPath = path.join(__dirname, "..", "uploads", path.basename(course.pdfUrl));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          course.pdfUrl = `/uploads/${req.file.filename}`;
          course.pdfOriginalName = req.file.originalname;
        }

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
            // Remove old questions and add new ones (or implement smarter diff logic)
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

  // Delete PDF file for a course
  router.delete(
    "/:id/pdf",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { Course } = req.app.get("models");
        const course = await Course.findByPk(id);
        if (!course) return sendError(res, COURSE_RESPONSE_MESSAGES.COURSE_NOT_FOUND, 404);

        if (course.pdfUrl) {
          const filePath = path.join(__dirname, "..", "uploads", path.basename(course.pdfUrl));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        course.pdfUrl = null;
        course.pdfOriginalName = null;
        await course.save();

        sendSuccess(res, course, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};

export default courseRoutes;
