import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { checkPackAccess } from "../middleware/checkAccess";
import axios from "axios";
import { getRank } from "../utils/rankUtils";
import { sendError, sendSuccess } from "../utils/response";
import { PRACTICAL_EXERCICE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { Op } from "sequelize";
import { rankingPoints } from "../utils/rankUtils";

const practicalexerciceRoutes = (): Router => {
  const router = express.Router();
  // Get all theme IDs associated with an exercice
  router.get("/:exerciceId/themes", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const exercice = await req.app.get("models").Practicalexercice.findByPk(req.params.exerciceId);
      if (!exercice) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      const themes = await exercice.getThemes({ attributes: ["id"] });
      const themeIds = themes.map((t: any) => t.id);
      sendSuccess(res, themeIds, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get all pack IDs associated with an exercice
  router.get("/:exerciceId/packs", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const exercice = await req.app.get("models").Practicalexercice.findByPk(req.params.exerciceId);
      if (!exercice) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      const packs = await exercice.getPacks({ attributes: ["id"] });
      const packIds = packs.map((p: any) => p.id);
      sendSuccess(res, packIds, 200);
    } catch (err: any) {
      next(err);
    }
  });


  // Create new exercice
  router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "superadmin"),
    async (req: any, res: any, next: NextFunction) => {
      try {
        const {
          title,
          description,
          difficulty,
          language,
          starterCode,
          solution,
          testCases,
          packIds,
          themeIds,
        } = req.body;

        // Validate test cases
        if (!Array.isArray(testCases) || testCases.length === 0) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.ONE_TEST_CASE);
        }

        const exercice = await req.app.get("models").Practicalexercice.create({
          title,
          description,
          difficulty,
          language,
          starterCode,
          solution,
          testCases,
        });

        // Associate packs if provided
        if (Array.isArray(packIds) && packIds.length > 0) {
          await exercice.setPacks(packIds);
        }

        // Associate themes if provided
        if (Array.isArray(themeIds) && themeIds.length > 0) {
          await exercice.setThemes(themeIds);
        }

        sendSuccess(res, exercice, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all exercices
  router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercices = await req.app.get("models").Practicalexercice.findAll();
      sendSuccess(res, exercices, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get a random exercice by difficulty and language, excluding those already submitted by the user
  router.get("/random", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { difficulty, language, themeIds } = req.query;
      const userId = req.user.id;
      const { Practicalexercice, PracticalexerciceSolution, UserPack, Pack } =
        req.app.get("models");

      // 1. Get all active packs for the user
      const userPack = await UserPack.findOne({
        where: {
          userId,
          isActive: true,
          endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }] },
        },
        include: [{ model: Pack, as: "pack", attributes: ["id"] }],
      });
      const userPackId = userPack?.packId;

      // 2. Build query for exercices
      const where: any = { hidden: false };
      if (difficulty) where.difficulty = difficulty;
      if (language) where.language = language;

      // 3. Build include for packs and themes
      const include: any[] = [
        {
          model: req.app.get("models").Pack,
          as: "packs",
          attributes: ["id"],
          where: userPackId ? { id: userPackId } : undefined,
          required: true,
        },
      ];

      if (themeIds) {
        // themeIds can be a string or array
        let themeIdArr = Array.isArray(themeIds) ? themeIds : String(themeIds).split(",");
        include.push({
          model: req.app.get("models").Theme,
          as: "themes",
          attributes: ["id"],
          where: { id: themeIdArr },
          required: true,
        });
      }

      // 4. Fetch all matching exercices
      const exercices = await Practicalexercice.findAll({ where, include });

      // 5. Fetch all exerciceIds the user has already submitted
      const submitted = await PracticalexerciceSolution.findAll({
        where: { userId },
        attributes: ["exerciceId"],
      });
      const submittedIds = submitted.map((s: any) => s.exerciceId);

      // 6. Filter out already submitted exercices
      const availableexercices = exercices.filter((ex: any) => !submittedIds.includes(ex.id));

      if (!availableexercices.length) {
        return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NO_EXERCICE_FOR_FILTERS, 404);
      }
      const randomIdx = Math.floor(Math.random() * availableexercices.length);
      sendSuccess(res, availableexercices[randomIdx], 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get one ranked exercice
  router.get("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const exercice = await req.app.get("models").Practicalexercice.findByPk(req.params.id);
      if (!exercice) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      sendSuccess(res, exercice, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // DELETE /ranked-exercices/id/:id
  router.delete("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.params.id;
      const exercice = await req.app.get("models").Practicalexercice.findByPk(id);
      if (!exercice) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);

      await req.app.get("models").Practicalexercice.destroy({ where: { id } });
      sendSuccess(res, { success: true }, 200);
    } catch (err) {
      next(err);
    }
  });

  // PUT /ranked-exercices/:id
  router.put("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.params.id;
      const updated = await req.app
        .get("models")
        .Practicalexercice.update(req.body, { where: { id }, returning: true });
      if (updated[0] === 0)
        return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      sendSuccess(res, updated[1][0], 200);
    } catch (err) {
      next(err);
    }
  });

  // Attempt a ranked exercice (enforces pack usage limits and logs the attempt)
  router.post(
    "/id/:exerciceId/attempt",
    authenticateToken,
    checkPackAccess,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const exercice = await req.app
          .get("models")
          .Practicalexercice.findByPk(req.params.exerciceId);
        if (!exercice) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
        }
        await req.app.get("models").PracticalexerciceLog.create({
          userId: req.user.id,
          exerciceId: exercice.id,
        });

        sendSuccess(res, { message: "Attempt logged", exercice }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Submit a solution for a ranked exercice (enforces pack usage limits and logs the attempt)
  router.post(
    "/id/:exerciceId/submit",
    authenticateToken,
    checkPackAccess,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const exercice = await req.app
          .get("models")
          .Practicalexercice.findByPk(req.params.exerciceId);
        if (!exercice) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
        }

        const { code } = req.body;
        if (!code) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.CODE_REQUIRED, 400);
        }

        // Prevent multiple submissions per user per exercice
        const existingSolution = await req.app.get("models").PracticalexerciceSolution.findOne({
          where: {
            exerciceId: exercice.id,
            userId: req.user.id,
          },
        });
        if (existingSolution) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.ALREADY_SUBMITTED, 400);
        }

        await req.app.get("models").PracticalexerciceLog.create({
          userId: req.user.id,
          exerciceId: exercice.id,
        });

        let passed = false;
        let feedback = "Evaluation failed";

        let runEndpoint = "";
        if (exercice.language === "python") {
          runEndpoint = "api/python/run-code";
        } else if (exercice.language === "javascript") {
          runEndpoint = "api/javascript/run-code";
        } else {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.UNSUPPORTED_LANGUAGE, 400);
        }

        try {
          const runRes = await axios.post(
            `${process.env.BACKEND_URL}/${runEndpoint}`,
            {
              code,
              testCases: exercice.testCases,
            },
            {
              headers: {
                Authorization: req.headers.authorization || "",
              },
            }
          );

          passed = runRes.data.status;
          feedback = runRes.data.message;
        } catch (err: any) {
          feedback = "Error during code evaluation: " + (err.response?.data?.error || err.message);
        }

        if (passed) {
          await req.app.get("models").PracticalexerciceSolution.create({
            exerciceId: exercice.id,
            userId: req.user.id,
            code,
            likes: 0,
            createdAt: new Date(),
          });

          const { Ranking } = req.app.get("models");

          let points = rankingPoints.codeSolvedEasy;
          if (exercice.difficulty === "medium") points = rankingPoints.codeSolvedMedium;
          if (exercice.difficulty === "hard") points = rankingPoints.codeSolvedHard;

          let ranking = await Ranking.findOne({ where: { userId: req.user.id } });
          if (!ranking) {
            ranking = await Ranking.create({
              userId: req.user.id,
              points,
              currentRank: getRank(points),
            });
          } else {
            ranking.points += points;
            const newRank = getRank(ranking.points);
            if (newRank !== ranking.currentRank) {
              ranking.currentRank = newRank;
              ranking.lastPromotedAt = new Date();
            }
            await ranking.save();
          }
        }

        sendSuccess(
          res,
          {
            message: passed
              ? PRACTICAL_EXERCICE_RESPONSE_MESSAGES.SUBMISSION_PASSED
              : PRACTICAL_EXERCICE_RESPONSE_MESSAGES.SUBMISSION_FAILED,
            exerciceId: exercice.id,
            passed,
            feedback,
          },
          200
        );
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get the number of practical exercices for the user's active pack (and paidVersionId if freeVersion)
  router.get("/count/for-user-pack", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { UserPack, Pack, Practicalexercice } = req.app.get("models");
      // Find user's active pack
      const userPack = await UserPack.findOne({
        where: {
          userId: req.user.id,
          isActive: true,
          endDate: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.is]: null }] },
        },
        include: [{
          model: Pack,
          as: "pack",
          include: [{ model: Practicalexercice, as: "practicalexercices", attributes: ["id"] }],
        }],
      });
      if (!userPack || !userPack.pack) {
        return sendSuccess(res, { total: 0, paidVersionTotal: 0 }, 200);
      }
      const total = (userPack.pack.practicalexercices || []).length;

      let paidVersionTotal = 0;
      if (userPack.pack.freeVersion && userPack.pack.paidVersionId) {
        // Find paid version pack and count its practical exercices
        const paidPack = await Pack.findByPk(userPack.pack.paidVersionId, {
          include: [{ model: Practicalexercice, as: "practicalexercices", attributes: ["id"] }],
        });
        paidVersionTotal = paidPack && paidPack.practicalexercices ? paidPack.practicalexercices.length : 0;
      }
      return sendSuccess(res, { total, paidVersionTotal }, 200);
    } catch (err: any) {
      next(err);
    }
  });

  return router;
};

export default practicalexerciceRoutes;
