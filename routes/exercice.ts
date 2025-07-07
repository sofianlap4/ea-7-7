import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { EXERCICE_RESPONSE_MESSAGES } from "../utils/responseMessages";

const exerciceRoutes = (): Router => {
  const router = express.Router();

  // Create Exercise
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description } = req.body;
        const { Exercise } = req.app.get("models");
        const exercise = await Exercise.create({ title, description });
        sendSuccess(res, exercise, 201);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get all Exercises (with PDFs and Videos)
  router.get(
    "/",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercise, PDF, Video } = req.app.get("models");
        const exercises = await Exercise.findAll({
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
          ],
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, exercises, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get Exercise by ID (with PDFs and Videos)
  router.get(
    "/id/:id",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercise, PDF, Video } = req.app.get("models");
        const exercise = await Exercise.findByPk(req.params.id, {
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
          ],
        });
        if (!exercise)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCISE_NOT_FOUND, 404);
        sendSuccess(res, exercise, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Update Exercise
  router.put(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description } = req.body;
        const { Exercise } = req.app.get("models");
        const exercise = await Exercise.findByPk(req.params.id);
        if (!exercise)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCISE_NOT_FOUND, 404);

        exercise.title = title ?? exercise.title;
        exercise.description = description ?? exercise.description;
        await exercise.save();

        sendSuccess(res, exercise, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Delete Exercise
  router.delete(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercise } = req.app.get("models");
        const deleted = await Exercise.destroy({ where: { id: req.params.id } });
        if (!deleted)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCISE_NOT_FOUND, 404);
        sendSuccess(res, { message: "Exercise deleted" }, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  return router;
};

export default exerciceRoutes;
