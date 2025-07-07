import express, { NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

export default () => {
  const router = express.Router();

  // GET /api/user-pack-reductions (admin only)
  router.get(
    "/reductions-sells",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPackReduction, User, UserPack, Pack, PackOffer, ReductionCode } =
          req.app.get("models");

        const reductions = await UserPackReduction.findAll({
          include: [
            {
              model: UserPack,
              as: "userPack",
              include: [
                { model: User, as: "user", attributes: ["id", "email", "firstName", "lastName"] },
                { model: Pack, as: "pack", attributes: ["id", "name"] },
                { model: PackOffer, as: "offer", attributes: ["id", "durationMonths", "price"] },
              ],
            },
            { model: ReductionCode, as: "reductionCode", attributes: ["id", "code", "percentage"] },
          ],
          order: [["createdAt", "DESC"]],
        });

        // Always return success, even if empty
        sendSuccess(res, reductions || [], 200);
      } catch (err: any) {
        console.error("Error fetching user pack reductions:", err);
        sendError(res, "Failed to fetch user pack reductions.", 500);
      }
    }
  );

  // CRUD for Reduction Codes

  // GET all reduction codes (admin)
  // GET all reduction codes (admin)
  router.get(
    "/reduction-codes",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { ReductionCode, PackOffer, Pack } = req.app.get("models");
        const codes = await ReductionCode.findAll({
          include: [
            {
              model: PackOffer,
              as: "offers",
              include: [
                {
                  model: Pack,
                  as: "pack",
                  attributes: ["id", "name"],
                },
              ],
              attributes: ["id", "durationMonths", "price"],
              through: { attributes: [] },
            },
          ],
          order: [["createdAt", "DESC"]],
        });
        sendSuccess(res, codes, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // CREATE a reduction code (admin)
  router.post(
    "/reduction-codes",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { code, description, percentage, isActive, packOfferIds } = req.body;
        if (!code || typeof percentage !== "number")
          return sendError(res, "Code and percentage are required", 400);

        const { ReductionCode, Pack } = req.app.get("models");
        const reduction = await ReductionCode.create({
          code,
          description,
          percentage,
          isActive: isActive !== false,
        });

        // Associate with packs (only freeVersion: false)
        // Associate with offers
        if (Array.isArray(packOfferIds) && packOfferIds.length > 0) {
          const offers = await req.app
            .get("models")
            .PackOffer.findAll({ where: { id: packOfferIds } });
          await reduction.setOffers(offers);
        }

        sendSuccess(res, reduction, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // UPDATE a reduction code (admin)
  router.put(
    "/reduction-codes/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { code, description, percentage, isActive, packOfferIds } = req.body;
        const { ReductionCode } = req.app.get("models");
        const reduction = await ReductionCode.findByPk(req.params.id);
        if (!reduction) return sendError(res, "Reduction code not found", 404);

        await reduction.update({
          code,
          description,
          percentage,
          isActive,
        });

        // Associate with offers
        if (Array.isArray(packOfferIds) && packOfferIds.length > 0) {
          const offers = await req.app
            .get("models")
            .PackOffer.findAll({ where: { id: packOfferIds } });
          await reduction.setOffers(offers);
        }

        sendSuccess(res, reduction, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // DELETE a reduction code (admin)
  router.delete(
    "/reduction-codes/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { ReductionCode } = req.app.get("models");
        const reduction = await ReductionCode.findByPk(req.params.id);
        if (!reduction) return sendError(res, "Reduction code not found", 404);
        await reduction.destroy();
        sendSuccess(res, { message: "Reduction code deleted" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};
