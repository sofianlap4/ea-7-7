import express, { Router, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { sendError, sendSuccess } from '../utils/response';

const usersRoutes = (): Router => {
  const router = express.Router();

  // Get all users (optionally filter by role)
  router.get('/', authenticateToken, authorizeRoles('admin', 'superadmin'), async (req: any, res: any, next: NextFunction) => {
    try {
      const { User } = req.app.get("models");
      const where: any = {};
      if (req.query.role) where.role = req.query.role;
      const users = await User.findAll({ where });
      sendSuccess(res, users);
    } catch (err: any) {
      next(err);
    }
  });

  // Get user by ID
  router.get('/id/:userId', authenticateToken, authorizeRoles('admin', 'superadmin'), async (req: any, res: any, next: NextFunction) => {
    try {
      const { User } = req.app.get("models");
      const user = await User.findByPk(req.params.userId);
      if (!user) return sendError(res, "User not found", 404);
      sendSuccess(res, user);
    } catch (err: any) {
      next(err);
    }
  });

  // Update user by ID
  router.put('/id/:userId', authenticateToken, authorizeRoles('admin', 'superadmin'), async (req: any, res: any, next: NextFunction) => {
    try {
      const { User } = req.app.get("models");
      const user = await User.findByPk(req.params.userId);
      if (!user) return sendError(res, "User not found", 404);
      const updatable = ["firstName", "lastName", "email", "phone", "dateOfBirth", "gouvernorat"];
      updatable.forEach((field) => {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      });
      await user.save();
      sendSuccess(res, user);
    } catch (err: any) {
      next(err);
    }
  });

  // Revoke all refresh tokens for a user
  router.post('/id/:userId/revoke-refresh-tokens', authenticateToken, authorizeRoles('admin', 'superadmin'), async (req: any, res: any, next: NextFunction) => {
    try {
      const { RefreshToken } = req.app.get("models");
      await RefreshToken.update({ revoked: true }, { where: { userId: req.params.userId, revoked: false } });
      sendSuccess(res, { success: true });
    } catch (err: any) {
      next(err);
    }
  });

  // Archive (soft delete) a user
  router.post('/id/:userId/archive', authenticateToken, authorizeRoles('admin', 'superadmin'), async (req: any, res: any, next: NextFunction) => {
    try {
      const { User } = req.app.get("models");
      const user = await User.findByPk(req.params.userId);
      if (!user) return sendError(res, "User not found", 404);
      user.archived = true;
      await user.save();
      sendSuccess(res, { success: true });
    } catch (err: any) {
      next(err);
    }
  });

  return router;
};

export default usersRoutes;
