import express, { Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { QUIZZ_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { rankingPoints } from "../utils/rankUtils";

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
        const { QuizzQuestion, UserQuizzProgress } = req.app.get("models");
        const userId = req.user.id;
        const quizzId = req.params.quizzId;

        // Get all questions for this quizz
        const questions = await QuizzQuestion.findAll({ where: { quizzId } });

        // Get user's progress for this quizz
        const userProgress = await UserQuizzProgress.findOne({
          where: { userId, quizzId },
        });

        let alreadyCorrect: string[] = [];
        if (userProgress && Array.isArray(userProgress.correctQuestions)) {
          alreadyCorrect = userProgress.correctQuestions;
        }

        // Separate questions
        const answeredCorrectly = questions.filter((q: any) => alreadyCorrect.includes(q.id));
        const toAnswer = questions.filter((q: any) => !alreadyCorrect.includes(q.id));

        sendSuccess(res, { answeredCorrectly, toAnswer }, 200);
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
        const userId = req.user.id;
        const { answers } = req.body; // { [questionId]: answer }
        const { Quizz, QuizzQuestion, User, UserQuizzProgress } = req.app.get("models");

        // Find the quizz for this course
        const quizz = await Quizz.findOne({ where: { courseId: req.params.courseId } });
        if (!quizz) return sendError(res, "Quizz not found", 404);

        // Get all questions for this quizz
        const questions = await QuizzQuestion.findAll({ where: { quizzId: quizz.id } });
        // Get user's previous correct answers for this quizz
        let userProgress = await UserQuizzProgress.findOne({
          where: { userId, quizzId: quizz.id },
        });
        let alreadyCorrect: string[] = [];
        if (userProgress && Array.isArray(userProgress.correctQuestions)) {
          alreadyCorrect = userProgress.correctQuestions;
        }

        let pointsEarned = 0;
        let newlyCorrect: string[] = [];
        let incorrectAnswers: any[] = [];

        for (const questionId of Object.keys(answers)) {
          if (alreadyCorrect.includes(questionId)) {
            // Optionally: ignore or throw error if user tries to answer already-correct question
            continue;
          }

          const question = questions.find((q: any) => q.id === questionId);
          if (!question) continue; // Question not found, skip

          const userAnswer = answers[questionId];
          if (userAnswer === question.correctAnswer) {
            if (!alreadyCorrect.includes(questionId)) {
              pointsEarned += rankingPoints.QuizzQuestionPassed;
              newlyCorrect.push(questionId);
            }
          } else {
            incorrectAnswers.push({
              question: question.question,
              correctAnswer: question.correctAnswer,
              userAnswer,
            });
          }
        }

        // Update user progress
        if (newlyCorrect.length > 0) {
          if (!userProgress) {
            userProgress = await UserQuizzProgress.create({
              userId,
              quizzId: quizz.id,
              correctQuestions: newlyCorrect,
            });
          } else {
            userProgress.correctQuestions = [...new Set([...alreadyCorrect, ...newlyCorrect])];
            await userProgress.save();
          }
          // Add points to user ranking
          const { Ranking, RankingPointLog } = req.app.get("models");
          const [ranking, created] = await Ranking.findOrCreate({
            where: { userId },
            defaults: { points: 0 },
          });
          ranking.points += pointsEarned;
          await ranking.save();

          // Log the point addition with reason and context
          await RankingPointLog.create({
            userId,
            rankingId: ranking.id,
            points: pointsEarned,
            reason: "QuizzQuestionPassed",
            context: `Quizz: ${quizz.title} (${quizz.id}) - Course: ${req.params.courseId}`,
          });
        }

        sendSuccess(
          res,
          {
            success: incorrectAnswers.length === 0,
            pointsEarned,
            incorrectAnswers,
            message:
              incorrectAnswers.length === 0
                ? `Bravo ! Vous avez gagné ${pointsEarned} points.`
                : "Certaines réponses sont incorrectes.",
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
