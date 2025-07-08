import express, { Request, Response, Router, NextFunction } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { checkPackUsageLimits } from "../middleware/packs";
import axios from "axios";
import { getRank } from "../utils/rankUtils";
import { sendError, sendSuccess } from "../utils/response";
import { PRACTICAL_EXERCICE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { Op } from "sequelize";

const practicalExerciseRoutes = (): Router => {
  const router = express.Router();

  // Create new exercise
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

        const exercise = await req.app.get("models").PracticalExercise.create({
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
          await exercise.setPacks(packIds);
        }

        // Associate themes if provided
        if (Array.isArray(themeIds) && themeIds.length > 0) {
          await exercise.setThemes(themeIds);
        }

        sendSuccess(res, exercise, 201);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Get all exercises
  router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercises = await req.app.get("models").PracticalExercise.findAll();
      sendSuccess(res, exercises, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get a random exercise by difficulty and language, excluding those already submitted by the user
  router.get("/random", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const { difficulty, language, themeIds } = req.query;
      const userId = req.user.id;
      const { PracticalExercise, PracticalExerciseSolution, UserPack, Pack } =
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

      // 2. Build query for exercises
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

      // 4. Fetch all matching exercises
      const exercises = await PracticalExercise.findAll({ where, include });

      // 5. Fetch all exerciseIds the user has already submitted
      const submitted = await PracticalExerciseSolution.findAll({
        where: { userId },
        attributes: ["exerciseId"],
      });
      const submittedIds = submitted.map((s: any) => s.exerciseId);

      // 6. Filter out already submitted exercises
      const availableExercises = exercises.filter((ex: any) => !submittedIds.includes(ex.id));

      if (!availableExercises.length) {
        return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NO_EXERCISE_FOR_FILTERS, 404);
      }
      const randomIdx = Math.floor(Math.random() * availableExercises.length);
      sendSuccess(res, availableExercises[randomIdx], 200);
    } catch (err: any) {
      next(err);
    }
  });

  // Get one ranked exercise
  router.get("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const exercise = await req.app.get("models").PracticalExercise.findByPk(req.params.id);
      if (!exercise) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      sendSuccess(res, exercise, 200);
    } catch (err: any) {
      next(err);
    }
  });

  // DELETE /ranked-exercises/id/:id
  router.delete("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.params.id;
      const exercise = await req.app.get("models").PracticalExercise.findByPk(id);
      if (!exercise) return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);

      await req.app.get("models").PracticalExercise.destroy({ where: { id } });
      sendSuccess(res, { success: true }, 200);
    } catch (err) {
      next(err);
    }
  });

  // PUT /ranked-exercises/:id
  router.put("/id/:id", authenticateToken, async (req: any, res: any, next: NextFunction) => {
    try {
      const id = req.params.id;
      const updated = await req.app
        .get("models")
        .PracticalExercise.update(req.body, { where: { id }, returning: true });
      if (updated[0] === 0)
        return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
      sendSuccess(res, updated[1][0], 200);
    } catch (err) {
      next(err);
    }
  });

  // Attempt a ranked exercise (enforces pack usage limits and logs the attempt)
  router.post(
    "/id/:exerciseId/attempt",
    authenticateToken,
    checkPackUsageLimits,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const exercise = await req.app
          .get("models")
          .PracticalExercise.findByPk(req.params.exerciseId);
        if (!exercise) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
        }
        await req.app.get("models").PracticalExerciseLog.create({
          userId: req.user.id,
          exerciseId: exercise.id,
        });

        sendSuccess(res, { message: "Attempt logged", exercise }, 200);
      } catch (err: any) {
        next(err);
      }
    }
  );

  // Submit a solution for a ranked exercise (enforces pack usage limits and logs the attempt)
  router.post(
    "/id/:exerciseId/submit",
    authenticateToken,
    checkPackUsageLimits,
    async (req: any, res: any, next: NextFunction) => {
      try {
        const exercise = await req.app
          .get("models")
          .PracticalExercise.findByPk(req.params.exerciseId);
        if (!exercise) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.NOT_FOUND, 404);
        }

        const { code } = req.body;
        if (!code) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.CODE_REQUIRED, 400);
        }

        // Prevent multiple submissions per user per exercise
        const existingSolution = await req.app.get("models").PracticalExerciseSolution.findOne({
          where: {
            exerciseId: exercise.id,
            userId: req.user.id,
          },
        });
        if (existingSolution) {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.ALREADY_SUBMITTED, 400);
        }

        await req.app.get("models").PracticalExerciseLog.create({
          userId: req.user.id,
          exerciseId: exercise.id,
        });

        let passed = false;
        let feedback = "Evaluation failed";

        let runEndpoint = "";
        if (exercise.language === "python") {
          runEndpoint = "api/python/run-code";
        } else if (exercise.language === "javascript") {
          runEndpoint = "api/javascript/run-code";
        } else {
          return sendError(res, PRACTICAL_EXERCICE_RESPONSE_MESSAGES.UNSUPPORTED_LANGUAGE, 400);
        }

        try {
          const runRes = await axios.post(
            `${process.env.BACKEND_URL}/${runEndpoint}`,
            {
              code,
              testCases: exercise.testCases,
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
          await req.app.get("models").PracticalExerciseSolution.create({
            exerciseId: exercise.id,
            userId: req.user.id,
            code,
            likes: 0,
            createdAt: new Date(),
          });

          const { Ranking } = req.app.get("models");
          let points = 1;
          if (exercise.difficulty === "medium") points = 3;
          if (exercise.difficulty === "hard") points = 5;

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
            exerciseId: exercise.id,
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

  return router;
};

export default practicalExerciseRoutes;
