import express, { Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";
import { LEADERBOARD_RESPONSE_MESSAGES } from "../utils/responseMessages";

const leaderBoardRoutes = (): Router => {
  const router = express.Router();

  // GET /api/leaderboard/division/:rank
  router.get("/division/id/:rank", authenticateToken, authorizeRoles("student"), async (req, res, next: NextFunction) => {
    try {
      const { Ranking, User } = req.app.get("models");
      const { rank } = req.params;
      const top = await Ranking.findAll({
        where: { currentRank: rank },
        include: [{ model: User, as: "user", attributes: ["firstName", "lastName"] }],
        order: [["points", "DESC"]],
        limit: 10,
      });
      sendSuccess(res, top, 200);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/leaderboard/global
  router.get("/global", authenticateToken, authorizeRoles("student"), async (req, res, next: NextFunction) => {
    try {
      const { Ranking, User } = req.app.get("models");
      const top = await Ranking.findAll({
        include: [{ model: User, as: "user", attributes: ["firstName", "lastName"] }],
        order: [["points", "DESC"]],
        limit: 10,
      });
      sendSuccess(res, top, 200);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/leaderboard/me/division
  router.get(
    "/me/division",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Ranking, User } = req.app.get("models");
        const userId = req.user.id;
        const userRanking = await Ranking.findOne({ where: { userId } });
        if (!userRanking) return sendError(res, LEADERBOARD_RESPONSE_MESSAGES.RANKING_NOT_FOUND, 404);

        // Get all users in the same division, ordered by points
        const divisionRankings = await Ranking.findAll({
          where: { currentRank: userRanking.currentRank },
          order: [["points", "DESC"]],
          include: [{ model: User, as: "user", attributes: ["firstName", "lastName"] }],
        });

        // Find the user's position (1-based)
        const position = divisionRankings.findIndex((r: any) => r.userId === userId) + 1;

        sendSuccess(res, {
          currentRank: userRanking.currentRank,
          points: userRanking.points,
          position,
          total: divisionRankings.length,
        }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/leaderboard/me/global
  router.get(
    "/me/global",
    authenticateToken,
    authorizeRoles("student"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { Ranking, User } = req.app.get("models");
        const userId = req.user.id;

        // Get all users, ordered by points
        const globalRankings = await Ranking.findAll({
          order: [["points", "DESC"]],
          include: [{ model: User, as: "user", attributes: ["firstName", "lastName"] }],
        });

        // Find the user's position (1-based)
        const position = globalRankings.findIndex((r: any) => r.userId === userId) + 1;

        const userRanking = globalRankings.find((r: any) => r.userId === userId);

        sendSuccess(res, {
          currentRank: userRanking?.currentRank,
          points: userRanking?.points,
          position,
          total: globalRankings.length,
        }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/leaderboard/all
  router.get("/all", authenticateToken, authorizeRoles("admin", "superadmin"), async (req, res, next: NextFunction) => {
    try {
      const { Ranking, User } = req.app.get("models");
      const rankings = await Ranking.findAll({
        include: [{ model: User, as: "user", attributes: ["firstName", "lastName", "email"] }],
      });
      sendSuccess(res, rankings, 200);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/leaderboard/studentRank/:userId
  router.put(
    "/studentRank/id/:userId",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const { userId } = req.params;
        const { points } = req.body;
        const { Ranking } = req.app.get("models");
        const ranking = await Ranking.findOne({ where: { userId } });
        if (!ranking) return sendError(res, LEADERBOARD_RESPONSE_MESSAGES.RANKING_NOT_FOUND, 404);
        ranking.points = points;
        await ranking.save();
        sendSuccess(res, { success: true }, 200);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
};

export default leaderBoardRoutes;
