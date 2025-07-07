import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';
import { THEME_RESPONSE_MESSAGES } from "../utils/responseMessages";

const themeRoutes = (): Router => {
  const router = express.Router();

  // Create a new theme
  router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, packIds } = req.body;
        const theme = await req.app.get("models").Theme.create({ title });

        // Associate packs if provided
        if (Array.isArray(packIds) && packIds.length > 0) {
          await theme.setPacks(packIds);
        }

        // Return theme with packs
        const createdTheme = await req.app.get("models").Theme.findByPk(theme.id, {
          include: [{ model: req.app.get("models").Pack, as: "packs", attributes: ["id", "name"] }]
        });

        sendSuccess(res, createdTheme, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get a theme by ID
  router.get('/id/:themeId', authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { themeId } = req.params;
      const theme = await req.app.get("models").Theme.findByPk(themeId, {
        include: [{ model: req.app.get("models").Pack, as: "packs", attributes: ["id", "name"] }]
      });
      if (!theme) return sendError(res, THEME_RESPONSE_MESSAGES.THEME_NOT_FOUND, 404);
      sendSuccess(res, theme);
    } catch (err: any) {
      next(err);
    }
  });

  // Get all themes
  router.get(
    '/',
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const themes = await req.app.get("models").Theme.findAll({
          include: [{ model: req.app.get("models").Pack, as: "packs", attributes: ["id", "name"] }]
        });
        sendSuccess(res, themes);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Update a theme by ID
  router.put(
    '/id/:themeId',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { themeId } = req.params;
        const { title, packIds } = req.body;
        const { Theme } = req.app.get("models");

        const theme = await Theme.findByPk(themeId);
        if (!theme) return sendError(res, THEME_RESPONSE_MESSAGES.THEME_NOT_FOUND, 404);

        if (title) theme.title = title;
        await theme.save();

        // Update packs association if provided
        if (Array.isArray(packIds)) {
          await theme.setPacks(packIds);
        }

        // Return updated theme with packs
        const updatedTheme = await Theme.findByPk(themeId, {
          include: [{ model: req.app.get("models").Pack, as: "packs", attributes: ["id", "name"] }]
        });

        sendSuccess(res, updatedTheme);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Delete a theme by ID
  router.delete(
    '/id/:themeId',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { themeId } = req.params;
        const { Theme } = req.app.get("models");
        const deleted = await Theme.destroy({ where: { id: themeId } });
        if (!deleted) return sendError(res, THEME_RESPONSE_MESSAGES.THEME_NOT_FOUND, 404);
        sendSuccess(res, deleted, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all themes associated to a specific pack
  router.get(
    '/by-pack/:packId',
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { packId } = req.params;
        const themes = await req.app.get("models").Theme.findAll({
          include: [
            {
              model: req.app.get("models").Pack,
              as: "packs",
              attributes: ["id", "name"],
              where: { id: packId },
              required: true
            }
          ]
        });
        sendSuccess(res, themes);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};

export default themeRoutes;