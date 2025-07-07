import express, { Router, NextFunction } from "express";
import { authenticateToken } from "../middleware/auth";
import { sendError, sendSuccess } from '../utils/response';
import { PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES } from "../utils/responseMessages";


const practicalExerciseSolutionsRoutes = (): Router => {
  const router = express.Router();

  // Helper to get models
  const getModels = (req: any) => req.app.get("models");

  // GET /ranked-exercises/:exerciseId/solutions
  router.get("/ranked-exercises/:exerciseId/solutions", async (req: any, res: any, next: NextFunction) => {
    try {
      const { exerciseId } = req.params;
      const { RankedExerciseSolution, SolutionComment, User, SolutionLike } = getModels(req);

      const solutions = await RankedExerciseSolution.findAll({
        where: { exerciseId },
        include: [
          {
            model: SolutionComment,
            as: "comments",
            include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName"] }],
          },
          {
            model: SolutionLike,
            as: "likesList",
            attributes: ["id", "userId"],
            include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName"] }]
          },
          { model: User, as: "user", attributes: ["id", "firstName", "lastName"] },
        ],
        order: [["likes", "DESC"], ["createdAt", "ASC"]],
      });
      sendSuccess(res, solutions, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // POST /solutions/:solutionId/like
  router.post("/:solutionId/like", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { solutionId } = req.params;
      const userId = req.user.id;
      const { SolutionLike, RankedExerciseSolution } = getModels(req);

      const solution = await RankedExerciseSolution.findByPk(solutionId);
      if (!solution) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.SOLUTION_NOT_FOUND, 404);

      if (solution.userId === userId) {
        return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.CANNOT_LIKE_OWN, 403);
      }

      const alreadyLiked = await SolutionLike.findOne({ where: { solutionId, userId } });
      if (alreadyLiked) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.ALREADY_LIKED, 400);

      await SolutionLike.create({ solutionId, userId });
      await RankedExerciseSolution.increment("likes", { by: 1, where: { id: solutionId } });
      sendSuccess(res, { success: true }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // DELETE /solutions/:solutionId/like
  router.delete("/:solutionId/like", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { solutionId } = req.params;
      const userId = req.user.id;
      const { SolutionLike, RankedExerciseSolution } = getModels(req);

      const like = await SolutionLike.findOne({ where: { solutionId, userId } });
      if (!like) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.LIKE_NOT_FOUND, 404);

      await like.destroy();
      await RankedExerciseSolution.decrement("likes", { by: 1, where: { id: solutionId } });
      sendSuccess(res, { success: true }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // POST /solutions/:solutionId/comment
  router.post("/:solutionId/comment", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { solutionId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;
      const { SolutionComment } = getModels(req);

      if (!text || !text.trim()) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.COMMENT_REQUIRED, 400);

      const comment = await SolutionComment.create({
        solutionId,
        userId,
        text,
        createdAt: new Date(),
      });
      sendSuccess(res, comment, 201);
    } catch (err: any) {
      next(err);
    }
  });

  // DELETE /solutions/:solutionId/comment/:commentId
  router.delete("/:solutionId/comment/:commentId", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      const { SolutionComment } = getModels(req);

      const comment = await SolutionComment.findByPk(commentId);
      if (!comment) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.COMMENT_NOT_FOUND, 404);
      if (comment.userId !== userId) return sendError(res, PRACTICAL_EXERCICE_SOLUTION_RESPONSE_MESSAGES.NOT_YOUR_COMMENT, 403);

      await comment.destroy();
      sendSuccess(res, { success: true }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // GET /users/:userId/solutions
  router.get("/users/:userId/solutions", async (req: any, res: any, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { RankedExerciseSolution, RankedExercise } = getModels(req);

      const solutions = await RankedExerciseSolution.findAll({
        where: { userId },
        include: [
          { model: RankedExercise, as: "exercise" }
        ],
        order: [["createdAt", "DESC"]],
      });
      sendSuccess(res, solutions, 200);
    } catch (err: any) {
      next(err);
    }
  });

  return router;
};

export default practicalExerciseSolutionsRoutes;