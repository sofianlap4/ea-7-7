import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { EXERCICE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { checkPackAccess } from "../middleware/checkAccess"; // <-- Import the middleware

const exerciceRoutes = (): Router => {
  const router = express.Router();

  // Create Exercise (admin only)
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, themeIds, packIds } = req.body;
        const { Exercise, Theme, Pack } = req.app.get("models");
        const exercise = await Exercise.create({ title, description });
        // Associate themes if provided
        if (Array.isArray(themeIds) && themeIds.length > 0) {
          await exercise.setThemes(themeIds);
        }
        // Associate packs if provided
        if (Array.isArray(packIds) && packIds.length > 0) {
          await exercise.setPacks(packIds);
        }
        sendSuccess(res, exercise, 201);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get all Exercises (with PDFs and Videos) -- PROTECTED BY PACK ACCESS
  router.get(
    "/admin",
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

  // Get Exercise by ID (with PDFs and Videos) -- PROTECTED BY PACK ACCESS
  router.get(
    "/id/:id",
    authenticateToken,
    checkPackAccess, // <-- Add here
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercise, PDF, Video, Pack, Theme } = req.app.get("models");
        const exercise = await Exercise.findByPk(req.params.id, {
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
            { model: Pack, as: "packs" },
            { model: Theme, as: "themes" },
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

  // Update Exercise (admin only)
  router.put(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, themeIds, packIds } = req.body;
        const { Exercise, Theme, Pack } = req.app.get("models");
        const exercise = await Exercise.findByPk(req.params.id);
        if (!exercise)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCISE_NOT_FOUND, 404);

        exercise.title = title ?? exercise.title;
        exercise.description = description ?? exercise.description;
        await exercise.save();

        // Update themes if provided
        if (Array.isArray(themeIds)) {
          await exercise.setThemes(themeIds);
        }
        // Update packs if provided
        if (Array.isArray(packIds)) {
          await exercise.setPacks(packIds);
        }

        sendSuccess(res, exercise, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Delete Exercise (admin only)
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

  // Get all exercises related to the current student's pack
  router.get(
    "/student/pack",
    authenticateToken,
    checkPackAccess,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercise, Pack } = req.app.get("models");
        const packId = (req as any).userPack?.packId || (req as any).pack?.id || req.query.packId;
        if (!packId) return sendError(res, "Pack not found", 404);
        const { Theme } = req.app.get("models");
        const pack = await Pack.findByPk(packId, {
          include: [
            {
              model: Exercise,
              as: "exercises",
              include: [
                { model: Theme, as: "themes" }
              ]
            }
          ],
        });
        if (!pack) return sendError(res, "Pack not found", 404);
        sendSuccess(res, pack.exercises || [], 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get exercise by id (only PDFs and Videos)
  router.get(
    "/student/exercice/id/:id",
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
        if (!exercise) return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCISE_NOT_FOUND, 404);
        sendSuccess(res, exercise, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  return router;
};

export default exerciceRoutes;
