import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { EXERCICE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { checkPackAccess } from "../middleware/checkAccess"; // <-- Import the middleware
import { Op } from "sequelize";

const exerciceRoutes = (): Router => {
  const router = express.Router();

  // Create exercice (admin only)
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, themeIds, packIds } = req.body;
        const { Exercice, Theme, Pack } = req.app.get("models");
        const exercice = await Exercice.create({ title, description });
        // Associate themes if provided
        if (Array.isArray(themeIds) && themeIds.length > 0) {
          await exercice.setThemes(themeIds);
        }
        // Associate packs if provided
        if (Array.isArray(packIds) && packIds.length > 0) {
          await exercice.setPacks(packIds);
        }
        sendSuccess(res, exercice, 201);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get all exercices (with PDFs and Videos) -- PROTECTED BY PACK ACCESS
  router.get(
    "/admin",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice, PDF, Video } = req.app.get("models");
        const exercices = await Exercice.findAll({
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
          ],
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, exercices, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get exercice by ID (with PDFs and Videos) -- PROTECTED BY PACK ACCESS
  router.get(
    "/id/:id",
    authenticateToken,
    checkPackAccess, // <-- Add here
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice, PDF, Video, Pack, Theme } = req.app.get("models");
        const exercice = await Exercice.findByPk(req.params.id, {
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
            { model: Pack, as: "packs" },
            { model: Theme, as: "themes" },
          ],
        });
        if (!exercice)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCICE_NOT_FOUND, 404);
        sendSuccess(res, exercice, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Update exercice (admin only)
  router.put(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, themeIds, packIds } = req.body;
        const { Exercice, Theme, Pack } = req.app.get("models");
        const exercice = await Exercice.findByPk(req.params.id);
        if (!exercice)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCICE_NOT_FOUND, 404);

        exercice.title = title ?? exercice.title;
        exercice.description = description ?? exercice.description;
        await exercice.save();

        // Update themes if provided
        if (Array.isArray(themeIds)) {
          await exercice.setThemes(themeIds);
        }
        // Update packs if provided
        if (Array.isArray(packIds)) {
          await exercice.setPacks(packIds);
        }

        sendSuccess(res, exercice, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Delete exercice (admin only)
  router.delete(
    "/id/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice } = req.app.get("models");
        const deleted = await Exercice.destroy({ where: { id: req.params.id } });
        if (!deleted)
          return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCICE_NOT_FOUND, 404);
        sendSuccess(res, { message: "exercice deleted" }, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get all exercices related to the current student's pack
  router.get(
    "/student/pack",
    authenticateToken,
    checkPackAccess,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice, Pack } = req.app.get("models");
        const packId = (req as any).userPack?.packId || (req as any).pack?.id || req.query.packId;
        if (!packId) return sendError(res, "Pack not found", 404);
        const { Theme } = req.app.get("models");
        const pack = await Pack.findByPk(packId, {
          include: [
            {
              model: Exercice,
              as: "exercices",
              include: [
                { model: Theme, as: "themes" }
              ]
            }
          ],
        });
        if (!pack) return sendError(res, "Pack not found", 404);
        sendSuccess(res, pack.exercices || [], 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get exercice by id (only PDFs and Videos)
  router.get(
    "/student/exercice/id/:id",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice, PDF, Video } = req.app.get("models");
        const exercice = await Exercice.findByPk(req.params.id, {
          include: [
            { model: PDF, as: "pdfs" },
            { model: Video, as: "videos" },
          ],
        });
        if (!exercice) return sendError(res, EXERCICE_RESPONSE_MESSAGES.EXERCICE_NOT_FOUND, 404);
        sendSuccess(res, exercice, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  // Get preview of paid exercices for students with a freeVersion pack
  router.get(
    "/student/preview-paid-exercices",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Exercice, Pack, UserPack } = req.app.get("models");

        // Fetch the user's pack from their user data
        const userId = req.user.id;
        const userPack = await UserPack.findOne({ where: { userId } });

        if (!userPack) return sendError(res, "User pack not found", 404);

        const packId = userPack.packId;

        // Fetch the current pack
        const pack = await Pack.findByPk(packId);
        if (!pack || !pack.freeVersion) {
          return sendError(res, "This route is only for freeVersion packs", 403);
        }

        // Fetch the paid version pack ID
        const paidVersionId = pack.paidVersionId;
        if (!paidVersionId) {
          return sendError(res, "No paid version associated with this pack", 404);
        }

        // Fetch free exercises for the user's pack
        const freeExercices = await Exercice.findAll({
          attributes: ["id"],
          include: [
            {
              model: Pack,
              as: "packs",
              where: { id: packId },
            },
          ],
        });

        const freeExerciceIds = freeExercices.map((ex: { id: string }) => ex.id);

        // Fetch paid exercises excluding those already in the free list
        const paidExercices = await Exercice.findAll({
          attributes: ["title", "description"],
          include: [
            {
              model: Pack,
              as: "packs",
              where: { id: paidVersionId },
            },
          ],
          where: {
            id: {
              [Op.notIn]: freeExerciceIds,
            },
          },
        });

        sendSuccess(res, paidExercices, 200);
      } catch (err: any) {
        sendError(res, err.message, 400);
      }
    }
  );

  return router;
};

export default exerciceRoutes;
