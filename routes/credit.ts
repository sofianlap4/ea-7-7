import express, { NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { CREDIT_RESPONSE_MESSAGES } from "../utils/responseMessages";

export default () => {
  const router = express.Router();

  // Student: Get their own credit transactions
  router.get(
    "/user/me",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        if (!req.user || !req.user.id) {
          return sendError(res, CREDIT_RESPONSE_MESSAGES.UNAUTHORIZED, 401);
        }
        const transactions = await req.app.get("models").CreditTransaction.findAll({
          where: { userId: req.user.id },
          order: [["createdAt", "DESC"]],
        });
        if (!transactions || transactions.length === 0) {
          return sendError(res, CREDIT_RESPONSE_MESSAGES.NO_TRANSACTIONS, 404);
        }
        sendSuccess(res, transactions, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin adds credit to a student with justification URL
  router.post(
    "/admin/add",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { studentId, amount, attachmentUrl } = req.body;
        if (!studentId || !amount) {
          return sendError(res, CREDIT_RESPONSE_MESSAGES.STUDENT_ID_AMOUNT_REQUIRED, 400);
        }
        const user = await req.app.get("models").User.findByPk(studentId);
        if (!user) return sendError(res, CREDIT_RESPONSE_MESSAGES.STUDENT_NOT_FOUND, 404);

        // Add credit to user
        user.credit = (user.credit || 0) + Number(amount);
        await user.save();

        // Log transaction
        await req.app.get("models").CreditTransaction.create({
          userId: studentId,
          amount,
          type: "admin_add",
          attachmentUrl,
        });

        sendSuccess(res, { newBalance: user.credit }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // Admin: Get all credit transactions for a specific user
  router.get(
    "/user/id/:userId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const transactions = await req.app.get("models").CreditTransaction.findAll({
          where: { userId: req.params.userId },
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, transactions, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // Admin: Get all credit transactions in the system
  router.get(
    "/all",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const transactions = await req.app.get("models").CreditTransaction.findAll({
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, transactions, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
};
