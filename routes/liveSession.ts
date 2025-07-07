import express, { NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { Op } from "sequelize";
import { sendError, sendSuccess } from '../utils/response';
import { LIVE_SESSION_RESPONSE_MESSAGES } from "../utils/responseMessages";

const router = express.Router();

export default () => {
  // Get student's live sessions
  router.get(
    "/my-live-sessions",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPack, LiveSession } = req.app.get("models");

        // Find the user's active UserPack (subscription)
        const userPack = await UserPack.findOne({
          where: {
            userId: req.user.id,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
        });

        if (!userPack) {
          return sendSuccess(res, [], 200);
        }

        // Get all live sessions for the user's active pack
        const sessions = await LiveSession.findAll({
          where: { packId: userPack.packId },
          order: [["date", "ASC"]],
        });

        sendSuccess(res, sessions, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get join log for a live session (/admin/superadmin)
  router.get("/:id/log", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const logs = await req.app.get("models").LiveSessionLog.findAll({
        where: { liveSessionId: req.params.id },
        include: [{ model: req.app.get("models").User, attributes: ["id", "firstName"] }],
        order: [["createdAt", "ASC"]],
      });
      if (!logs || logs.length === 0) {
        return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.NO_JOIN_LOGS, 404);
      }
      sendSuccess(
        res,
        logs.map((log: any) => ({
          userId: log.userId,
          firstName: log.User?.firstName || LIVE_SESSION_RESPONSE_MESSAGES.UNKNOWN_USER,
          joinedAt: log.createdAt,
        })),
        200
      );
    } catch (err: any) {
      next(err);
    }
  });

  // Student joins a session
  router.post(
    "/:id/join",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { UserPack, Pack, LiveSession } = req.app.get("models");
        const userPack = (await UserPack.findOne({
          where: {
            userId: req.user.id,
            isActive: true,
            endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null as any }] },
          },
          include: [{ model: Pack, as: "pack" }],
        })) as any;

        if (!userPack || !userPack.pack) {
          return res.status(403).json({ error: LIVE_SESSION_RESPONSE_MESSAGES.PACK_NOT_FOUND });
        }

        const session = await LiveSession.findByPk(req.params.id);
        if (!session) return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.SESSION_NOT_FOUND, 404);

        // Check if the session belongs to the user's active pack
        if (session.packId !== userPack.packId) {
          return res.status(403).json({ error: LIVE_SESSION_RESPONSE_MESSAGES.SESSION_NOT_IN_PACK });
        }

        const user = await req.app.get("models").User.findByPk(req.user.id);
        if (!user) return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.USER_NOT_FOUND, 404);

        await req.app.get("models").LiveSessionLog.create({
          userId: user.id,
          liveSessionId: session.id,
          createdAt: new Date(),
        });

        sendSuccess(res, {
          meetLink: session.meetLink,
          message: req.liveSessionIsUnlimited
            ? LIVE_SESSION_RESPONSE_MESSAGES.JOINED_UNLIMITED
            : LIVE_SESSION_RESPONSE_MESSAGES.JOINED_DEDUCTED,
        }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // Create a new live session (/admin)
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, date, meetLink, packId } = req.body;
        if (!packId) {
          return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.PACK_ID_REQUIRED, 400);
        }
        const session = await req.app.get("models").LiveSession.create({
          title,
          description,
          date,
          meetLink,
          createdBy: req.user.id,
          packId,
        });
        sendSuccess(res, session, 201);
      } catch (err) {
        next(err);
      }
    }
  );

  // Update a live session (admin)
  router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { title, description, date, meetLink, packId } = req.body;
        const session = await req.app.get("models").LiveSession.findByPk(req.params.id);
        if (!session) return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.SESSION_NOT_FOUND, 404);

        session.title = title ?? session.title;
        session.description = description ?? session.description;
        session.date = date ?? session.date;
        session.meetLink = meetLink ?? session.meetLink;
        if (packId) session.packId = packId;

        await session.save();

        sendSuccess(res, session, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // Delete a live session (admin)
  router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles( "admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const session = await req.app.get("models").LiveSession.findByPk(req.params.id);
        if (!session) return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.SESSION_NOT_FOUND, 404);

        await session.destroy();
        sendSuccess(res, { message: LIVE_SESSION_RESPONSE_MESSAGES.SESSION_DELETED }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // Get session detail
  router.get("/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const session = await req.app.get("models").LiveSession.findByPk(req.params.id);
      if (!session) return sendError(res, LIVE_SESSION_RESPONSE_MESSAGES.SESSION_NOT_FOUND, 404);
      sendSuccess(res, session, 200);
    } catch (err) {
      next(err);
    }
  });

  // Get all upcoming live sessions (for calendar)
  router.get("/", authenticateToken, authorizeRoles("admin", "superadmin"), async (req: any, res: any, next: NextFunction) => {
    try {
      const sessions = await req.app.get("models").LiveSession.findAll({
        where: { date: { [Op.gte]: new Date() } },
        order: [["date", "ASC"]],
      });
      sendSuccess(res, sessions, 200);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
