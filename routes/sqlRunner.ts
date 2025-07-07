import express from "express";
import Database from "better-sqlite3";
import { authenticateToken } from "../middleware/auth";
import { checkPackUsageLimits } from "../middleware/packs";
import { sendSuccess, sendError } from "../utils/response";
import { RUNCODE_RESPONSE_MESSAGES } from "../utils/responseMessages";

const router = express.Router();

router.post("/run-code", authenticateToken, checkPackUsageLimits, (req: any, res: any) => {
  const { code, testCases } = req.body;

  if (!code || !Array.isArray(testCases)) {
    return sendError(
      res,
      {
        message: RUNCODE_RESPONSE_MESSAGES.CODE_TEST_CASES,
        status: false,
        results: [],
        outputs: [],
      },
      400
    );
  }

  const results: boolean[] = [];
  const outputs: {
    testCase: any;
    actualOutput: any;
    expectedOutput: any;
  }[] = [];

  const db = new Database(":memory:"); // Create an in-memory SQLite database

  try {
    for (const testCase of testCases) {
      const inputSetup = testCase.input;
      const expectedOutput = testCase.expectedOutput;

      try {
        db.exec(inputSetup); // Setup database schema/data

        const rows = db.prepare(code).all(); // Execute user's SQL
        const actualOutput = JSON.stringify(rows);
        const passed = actualOutput === expectedOutput;

        results.push(passed);
        outputs.push({
          testCase,
          actualOutput: rows,
          expectedOutput,
        });

        // // Reset DB after each test (drop all objects)
        // db.exec(`
        //   PRAGMA writable_schema = 1;
        //   DELETE FROM sqlite_master WHERE type IN ('table', 'index', 'trigger');
        //   PRAGMA writable_schema = 0;
        //   VACUUM;
        // `);
      } catch (err: any) {
        results.push(false);
        outputs.push({
          testCase,
          actualOutput: `Error: ${err.message}`,
          expectedOutput,
        });
      } finally {
        db.close(); // Fermer chaque base après le test
      }
    }

    const passedCount = results.filter(Boolean).length;
    const allPassed = results.every((r) => r);
    const message = allPassed
      ? "Perfect, all tests were successfully passed"
      : `Some tests failed: ${testCases.length - passedCount} of ${
          testCases.length
        } tests did not pass`;

    return sendSuccess(
      res,
      {
        message,
        status: allPassed,
        results,
        outputs,
      },
      200
    );
  } catch (err: any) {
    return sendError(
      res,
      {
        message: err.message || "Unexpected error occurred during SQL execution.",
        status: false,
        results: [],
        outputs: [],
      },
      500
    );
  } finally {
    db.close();
  }
});

export default router;
