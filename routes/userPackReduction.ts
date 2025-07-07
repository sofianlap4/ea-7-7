import express, { NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

export default () => {
  const router = express.Router();

  // GET /api/user-pack-reductions (admin only)
  router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPackReduction, User, UserPack, Pack, PackOffer, ReductionCode } = req.app.get("models");

        const reductions = await UserPackReduction.findAll({
          include: [
            { model: User, as: "user", attributes: ["id", "email", "firstName", "lastName"] },
            { 
              model: UserPack, 
              as: "userPack", 
              include: [
                { model: Pack, as: "pack", attributes: ["id", "name"] },
                { model: PackOffer, as: "offer", attributes: ["id", "durationMonths", "price"] }
              ] 
            },
            { model: ReductionCode, as: "reductionCode", attributes: ["id", "code", "percentage"] }
          ],
          order: [["createdAt", "DESC"]]
        });

        // Always return success, even if empty
        sendSuccess(res, reductions || [], 200);
      } catch (err: any) {
        console.error("Error fetching user pack reductions:", err);
        sendError(res, "Failed to fetch user pack reductions.", 500);
      }
    }
  );

  return router;
};