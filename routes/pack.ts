import express, { NextFunction } from "express";
import { Op } from "sequelize";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { PACK_RESPONSE_MESSAGES } from "../utils/responseMessages";

export default () => {
  const router = express.Router();

  // Student: See their active pack (with courses)
  router.get(
    "/mypack",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPack, Pack, Course, PackOffer } = req.app.get("models");

        // Find the user's active UserPack (subscription)
        const userPack = await UserPack.findOne({
          where: {
            userId: req.user.id,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
          include: [
            {
              model: Pack,
              as: "pack",
              include: [
                { model: Course, as: "courses" },
                { model: PackOffer, as: "offers" },
              ],
            },
          ],
        });

        if (!userPack || !userPack.pack) return sendSuccess(res, null, 200);

        // Combine user subscription info with pack details
        sendSuccess(
          res,
          {
            startDate: userPack.startDate,
            endDate: userPack.endDate,
            durationMonths: userPack.durationMonths,
            price: userPack.price,
            ...userPack.pack.toJSON(),
          },
          200
        );
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Add/remove student to/from pack (accept/reject subscription)
  router.post(
    "/:id/students",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { studentId } = req.body;
        const pack = await req.app.get("models").Pack.findByPk(req.params.id);
        const student = await req.app.get("models").User.findByPk(studentId);
        if (!pack || !student)
          return sendError(res, PACK_RESPONSE_MESSAGES.PACK_OR_STUDENT_NOT_FOUND, 404);
        await pack.addStudent(student); // association as 'students'
        sendSuccess(res, pack, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  router.delete(
    "/:id/students/:studentId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const pack = await req.app.get("models").Pack.findByPk(req.params.id);
        const student = await req.app.get("models").User.findByPk(req.params.studentId);
        if (!pack || !student)
          return sendError(res, PACK_RESPONSE_MESSAGES.PACK_OR_STUDENT_NOT_FOUND, 404);
        await pack.removeStudent(student);
        sendSuccess(res, pack, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Student: List all available packs (with offers)
  router.get(
    "/public/all",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const packs = await req.app.get("models").Pack.findAll({
          where: { hidden: false, freeVersion: false },
          order: [["createdAt", "DESC"]],
          include: [
            { model: req.app.get("models").Course, as: "courses" },
            { model: req.app.get("models").PackOffer, as: "offers" },
          ],
        });
        sendSuccess(res, packs, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Manage offers for a pack
  router.post(
    "/:id/offers",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { durationMonths, price } = req.body;
        const pack = await req.app.get("models").Pack.findByPk(req.params.id);
        if (!pack) return sendError(res, PACK_RESPONSE_MESSAGES.PACK_NOT_FOUND, 404);

        const offer = await req.app.get("models").PackOffer.create({
          packId: pack.id,
          durationMonths,
          price,
        });
        sendSuccess(res, offer, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  router.put(
    "/offers/:offerId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { durationMonths, price } = req.body;
        const offer = await req.app.get("models").PackOffer.findByPk(req.params.offerId);
        if (!offer) return sendError(res, "Offer not found", 404);

        await offer.update({ durationMonths, price });
        sendSuccess(res, offer, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  router.delete(
    "/offers/:offerId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const offer = await req.app.get("models").PackOffer.findByPk(req.params.offerId);
        if (!offer) return sendError(res, "Offer not found", 404);

        await offer.destroy();
        sendSuccess(res, { message: "Offer deleted" }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Student: Request subscription (creates a pending request)
  router.post(
    "/id/:id/subscribe",
    authenticateToken,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const user = await req.app.get("models").User.findByPk(req.user.id);
        const pack = await req.app.get("models").Pack.findByPk(req.params.id);
        const { offerId, reductionCode, force } = req.body;

        if (!user || !pack)
          return sendError(res, PACK_RESPONSE_MESSAGES.USER_OR_PACK_NOT_FOUND, 400);

        // Check for active UserPack
        const activeUserPack = await req.app.get("models").UserPack.findOne({
          where: {
            userId: user.id,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
        });

        if (activeUserPack && activeUserPack.packId !== pack.id && !force) {
          return sendError(res, PACK_RESPONSE_MESSAGES.ALREADY_SUBSCRIBED, 401);
        }

        // Find the selected offer
        const offer = await req.app.get("models").PackOffer.findOne({
          where: { id: offerId, packId: pack.id },
        });
        if (!offer) return sendError(res, "Offer not found", 404);

        let finalPrice = offer.price;

        let reductionCodeInstance = null;
        if (reductionCode) {
          reductionCodeInstance = await req.app.get("models").ReductionCode.findOne({
            where: { code: reductionCode, isActive: true },
          });
          if (!reductionCodeInstance) return sendError(res, "Invalid reduction code", 400);
          finalPrice = Math.round(finalPrice * (1 - reductionCodeInstance.percentage / 100));
        }

        if (user.credit < finalPrice) {
          return sendError(res, PACK_RESPONSE_MESSAGES.NOT_ENOUGH_CREDIT, 404);
        }

        // Deactivate old pack if force
        if (activeUserPack && activeUserPack.packId !== pack.id && force) {
          activeUserPack.isActive = false;
          await activeUserPack.save();
        }

        const now = new Date();
        let endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + offer.durationMonths);

        user.credit -= finalPrice;
        await user.save();

        const userPack = await req.app.get("models").UserPack.create({
          userId: user.id,
          packId: pack.id,
          durationMonths: offer.durationMonths,
          price: finalPrice,
          startDate: now,
          endDate,
          isActive: true,
        });

        // Track reduction code usage
        if (reductionCodeInstance) {
          await req.app.get("models").UserPackReduction.create({
            userPackId: userPack.id,
            reductionCodeId: reductionCodeInstance.id,
          });
        }

        await req.app.get("models").CreditTransaction.create({
          userId: user.id,
          packId: pack.id,
          amount: finalPrice,
          type: "purchase_pack",
          createdAt: new Date(),
        });

        const userObj = user.toJSON();
        delete userObj.password;
        sendSuccess(
          res,
          { message: PACK_RESPONSE_MESSAGES.SUBSCRIBED_SUCCESS, user: userObj },
          200
        );
      } catch (err: any) {
        next(err);
      }
    }
  );
  // Admin: Delete pack
  router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { id } = req.params;
        const pack = await req.app.get("models").Pack.findByPk(id, {
          include: [{ model: req.app.get("models").User, as: "students" }],
        });
        if (!pack) return sendError(res, PACK_RESPONSE_MESSAGES.PACK_NOT_FOUND, 404);

        if (pack.students && pack.students.length > 0) {
          return sendError(res, PACK_RESPONSE_MESSAGES.CANNOT_DELETE_WITH_STUDENTS, 400);
        }

        await req.app.get("models").Pack.destroy({ where: { id } });
        sendSuccess(res, pack, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Get pack details by id
  router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const pack = await req.app.get("models").Pack.findByPk(req.params.id, {
          include: [
            { model: req.app.get("models").Course, as: "courses" },
            { model: req.app.get("models").User, as: "students", attributes: ["id", "email"] },
            { model: req.app.get("models").PackOffer, as: "offers" },
          ],
        });
        if (!pack) return sendError(res, PACK_RESPONSE_MESSAGES.PACK_NOT_FOUND, 404);
        sendSuccess(res, pack, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Get all packs with courses and students
  router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const packs = await req.app.get("models").Pack.findAll({
          where: { hidden: false },
          order: [["createdAt", "DESC"]],
          include: [
            { model: req.app.get("models").Course, as: "courses" },
            { model: req.app.get("models").User, as: "students", attributes: ["id", "email"] },
            { model: req.app.get("models").PackOffer, as: "offers" },
          ],
        });
        sendSuccess(res, packs, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Create a new pack with courses
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { name, description, type, courseIds } = req.body;

        if (typeof name !== "string" || !name.trim()) {
          return sendError(res, PACK_RESPONSE_MESSAGES.NAME_REQUIRED, 400);
        }
        const allowedTypes = [
          "2eme info",
          "3eme info",
          "Bac info",
          "Bac scientifique",
          "2eme info gratuit",
          "3eme info gratuit",
          "Bac info gratuit",
          "Bac scientifique gratuit",
        ];
        if (type && !allowedTypes.includes(type)) {
          return sendError(res, PACK_RESPONSE_MESSAGES.TYPE_INVALID, 400);
        }

        const pack = await req.app.get("models").Pack.create({
          name,
          description,
          type,
        });

        if (Array.isArray(courseIds) && courseIds.length > 0) {
          const courses = await req.app.get("models").Course.findAll({ where: { id: courseIds } });
          await pack.setCourses(courses);
        }

        sendSuccess(res, pack, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Admin: Update pack (name, description, courses)
  router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const {
          name,
          description,
          type,
          courseIds,
          offers, // <-- add offers from body
        } = req.body;

        const pack = await req.app.get("models").Pack.findByPk(req.params.id);
        if (!pack) return sendError(res, PACK_RESPONSE_MESSAGES.PACK_NOT_FOUND, 404);

        await pack.update({
          name,
          description,
          type,
        });

        if (Array.isArray(courseIds)) {
          const courses = await req.app.get("models").Course.findAll({ where: { id: courseIds } });
          await pack.setCourses(courses);
        }

        // --- Handle offers update ---
        const PackOffer = req.app.get("models").PackOffer;
        if (Array.isArray(offers)) {
          // Fetch existing offers for this pack
          const existingOffers = await PackOffer.findAll({ where: { packId: pack.id } });
          const existingOfferIds = existingOffers.map((o: any) => o.id);

          // Update or create offers from the new array
          for (const offer of offers) {
            if (offer.id && existingOfferIds.includes(offer.id)) {
              // Update existing offer
              await PackOffer.update(
                { durationMonths: offer.durationMonths, price: offer.price },
                { where: { id: offer.id } }
              );
            } else {
              // Create new offer
              await PackOffer.create({
                packId: pack.id,
                durationMonths: offer.durationMonths,
                price: offer.price,
              });
            }
          }

          // Delete offers that are not in the new array
          const newOfferIds = offers.filter((o: any) => o.id).map((o: any) => o.id);
          for (const existingOffer of existingOffers) {
            if (!newOfferIds.includes(existingOffer.id)) {
              await existingOffer.destroy();
            }
          }
        }
        // --- End offers update ---

        const updatedPack = await req.app.get("models").Pack.findByPk(pack.id, {
          include: [
            { model: req.app.get("models").Course, as: "courses" },
            { model: req.app.get("models").User, as: "students", attributes: ["id", "email"] },
            { model: req.app.get("models").PackOffer, as: "offers" },
          ],
        });
        sendSuccess(res, updatedPack, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Student: Get usage stats (videos watched, exercises attempted, code runs) and limits for the current month
  router.get(
    "/me/usage",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const userId = req.user.id;
        const userPack = await req.app.get("models").UserPack.findOne({
          where: {
            userId,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
          include: [{ model: req.app.get("models").Pack, as: "pack" }],
        });
        const startDate = userPack?.startDate || new Date(0);
        const pack = userPack?.pack;

        if (!pack || pack.hidden) {
          return sendSuccess(res, { showUsage: false }, 200);
        }

        // You can still show usage stats if needed, but no limits
        const exercisesSubmited = await req.app.get("models").RankedExerciseLog.count({
          where: {
            userId,
            createdAt: { [Op.gte]: startDate },
          },
        });

        const codeRuns = await req.app.get("models").CodeRunLog.count({
          where: {
            userId,
            createdAt: { [Op.gte]: startDate },
          },
        });

        const liveSessionsJoined = await req.app.get("models").LiveSessionLog.count({
          where: {
            userId,
            createdAt: { [Op.gte]: startDate },
          },
        });

        sendSuccess(
          res,
          {
            showUsage: true,
            exercisesSubmited,
            codeRuns,
            liveSessionsJoined,
          },
          200
        );
      } catch (err: any) {
        next(err);
      }
    }
  );

  return router;
};
