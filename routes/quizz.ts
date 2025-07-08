import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';
import { QUIZZ_RESPONSE_MESSAGES } from "../utils/responseMessages";

const quizzRoutes = (): Router => {
  const router = express.Router();

  // Get quizz by courseId
  router.get(
    "/id/:courseId/quizz",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Quizz } = req.app.get("models");
        const quizz = await Quizz.findOne({ where: { courseId: req.params.courseId } });
        if (!quizz) return sendError(res, QUIZZ_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);
        sendSuccess(res, quizz, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get questions by quizzId
  router.get(
    "/quizz/id/:quizzId/questions",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { QuizzQuestion } = req.app.get("models");
        const questions = await QuizzQuestion.findAll({ where: { quizzId: req.params.quizzId } });
        sendSuccess(res, questions, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Submit answers to a quizz
  router.post(
    "/id/:courseId/quizz/submit",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        // Implement your quizz submission logic here
        // Example: check answers, calculate score, save result, etc.
        sendSuccess(res, { message: "Quizz submitted (implement logic)" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Create a quizz for a course
  router.post(
    "/id/:courseId/quizz",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title } = req.body;
        const { Quizz } = req.app.get("models");
        const quizz = await Quizz.create({ courseId: req.params.courseId, title });
        sendSuccess(res, quizz, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Edit a quizz
  router.put(
    "/quizz/id/:quizzId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title } = req.body;
        const { Quizz } = req.app.get("models");
        const quizz = await Quizz.findByPk(req.params.quizzId);
        if (!quizz) return sendError(res, QUIZZ_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);
        quizz.title = title ?? quizz.title;
        await quizz.save();
        sendSuccess(res, quizz, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a quizz
  router.delete(
    "/quizz/id/:quizzId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Quizz } = req.app.get("models");
        const deleted = await Quizz.destroy({ where: { id: req.params.quizzId } });
        if (!deleted) return sendError(res, QUIZZ_RESPONSE_MESSAGES.QUIZZ_NOT_FOUND, 404);
        sendSuccess(res, { message: "Quizz deleted" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Add a question to a quizz
  router.post(
    "/quizz/id/:quizzId/question",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { question, correctAnswer, choices } = req.body;
        const { QuizzQuestion } = req.app.get("models");
        const quizzQuestion = await QuizzQuestion.create({
          quizzId: req.params.quizzId,
          question,
          correctAnswer,
          choices,
        });
        sendSuccess(res, quizzQuestion, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Edit a question
  router.put(
    "/quizz/question/id/:questionId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { question, correctAnswer, choices } = req.body;
        const { QuizzQuestion } = req.app.get("models");
        const quizzQuestion = await QuizzQuestion.findByPk(req.params.questionId);
        if (!quizzQuestion) return sendError(res, QUIZZ_RESPONSE_MESSAGES.QUESTION_NOT_FOUND, 404);
        quizzQuestion.question = question ?? quizzQuestion.question;
        quizzQuestion.correctAnswer = correctAnswer ?? quizzQuestion.correctAnswer;
        quizzQuestion.choices = choices ?? quizzQuestion.choices;
        await quizzQuestion.save();
        sendSuccess(res, quizzQuestion, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a question
  router.delete(
    "/quizz/question/id/:questionId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { QuizzQuestion } = req.app.get("models");
        const deleted = await QuizzQuestion.destroy({ where: { id: req.params.questionId } });
        if (!deleted) return sendError(res, QUIZZ_RESPONSE_MESSAGES.QUESTION_NOT_FOUND, 404);
        sendSuccess(res, { message: "Question deleted" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};

export default quizzRoutes;