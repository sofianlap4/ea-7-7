import express, { Router, NextFunction } from "express";
import { authenticateToken } from "../../middleware/auth";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "../../utils/response";
import { PROFILE_RESPONSE_MESSAGES } from "../../utils/responseMessages";

const profileRoutes = (): Router => {
  const router = express.Router();

  // Get current user's profile
  router.get("/me", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const user = await req.app.get("models").User.findByPk(req.user?.id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) return sendError(res, PROFILE_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

      const userObj = user.toJSON();
      userObj.className = userObj.class ? userObj.class.name : null;
      delete userObj.classId;
      delete userObj.class;

      sendSuccess(res, userObj, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Change password
  router.post("/change-password", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await req.app.get("models").User.findByPk(req.user.id);
      if (!user) return sendError(res, PROFILE_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return sendError(res, PROFILE_RESPONSE_MESSAGES.OLD_PASSWORD_INCORRECT, 400);
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      sendSuccess(res, { message: PROFILE_RESPONSE_MESSAGES.PASSWORD_CHANGED }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Change email
  router.post("/change-email", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { newEmail, password } = req.body;
      const user = await req.app.get("models").User.findByPk(req.user.id);
      if (!user) return sendError(res, PROFILE_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return sendError(res, PROFILE_RESPONSE_MESSAGES.PASSWORD_INCORRECT, 400);
      user.email = newEmail;
      await user.save();
      sendSuccess(res, { message: PROFILE_RESPONSE_MESSAGES.EMAIL_CHANGED }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get user's credit
  router.get("/me/credit", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const user = await req.app.get("models").User.findByPk(req.user.id);
      if (!user) return sendError(res, PROFILE_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);
      sendSuccess(res, { credit: user.credit }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Add credit to user
  router.post("/add-credit", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { amount } = req.body;
      const user = await req.app.get("models").User.findByPk(req.user.id);
      if (!user) return sendError(res, PROFILE_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);
      user.credit += Number(amount);
      await user.save();
      sendSuccess(res, { credit: user.credit }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get user's pack transactions
  router.get("/my-pack-transactions", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const transactions = await req.app.get("models").CreditTransaction.findAll({
        where: {
          userId: req.user.id,
          type: "purchase_pack",
        },
        order: [["createdAt", "DESC"]],
        include: [{ model: req.app.get("models").Pack, as: "pack", attributes: ["name"] }],
      });
      sendSuccess(res, transactions, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get user rank
  router.get("/me/rank", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { Ranking } = req.app.get("models");
      const ranking = await Ranking.findOne({ where: { userId: req.user.id } });
      sendSuccess(res, ranking, 200);
    } catch (err: any) {
      next(err);
    }
  });

  return router;
};

export default profileRoutes;
