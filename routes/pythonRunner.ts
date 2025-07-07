import express, { Router } from "express";
import { PythonShell } from "python-shell";
import path from "path";
import { authenticateToken } from "../middleware/auth";
import fs from "fs";
import { checkPackUsageLimits } from "../middleware/packs";
import { sendSuccess, sendError } from "../utils/response";
import { RUNCODE_RESPONSE_MESSAGES } from "../utils/responseMessages";

const router: Router = express.Router();

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface CodeRunRequest {
  code: string;
  testCases: TestCase[];
  language: string;
}

interface CodeRunResponse {
  results: boolean[];
  outputs: string[];
  error?: string;
}

router.post("/run-code", authenticateToken, checkPackUsageLimits, async (req: any, res: any) => {
  let pyShell: PythonShell | null = null;
  const TIMEOUT_MS = 20000;

  try {
    if (!req.body?.code || !Array.isArray(req.body?.testCases)) {
      return sendError(
        res,
        {
          message: RUNCODE_RESPONSE_MESSAGES.CODE_TEST_CASES,
          results: [],
          outputs: [],
        },
        500
      );
    }
    const { code, testCases } = req.body as CodeRunRequest;
    const scriptPath = path.join(__dirname, "..", "python", "restricted_runner.py");

    if (!fs.existsSync(scriptPath)) {
      return sendError(
        res,
        {
          message: RUNCODE_RESPONSE_MESSAGES.PYTHON_CODE,
          results: [],
          outputs: [],
        },
        500
      );
    }

    const options = {
      mode: "json" as const,
      pythonOptions: ["-u", "-Xutf8"],
      scriptPath: path.dirname(scriptPath),
      pythonPath: "python",
      stderrParser: (line: string) => {
        if (line.includes("[DEBUG]")) console.log("Python Debug:", line);
        return line;
      },
    };

    pyShell = new PythonShell("restricted_runner.py", options);
    let isResolved = false;

    await Promise.race([
      new Promise<void>(async (resolve, reject) => {
        let resultData = "";
        let errorData = "";

        pyShell?.on("message", (message: string) => {
          console.log("Received message:", message);
          resultData += JSON.stringify(message) + "\n"; // Add newline to separate multiple messages
          console.log("Current result data:", resultData);
        });

        pyShell?.on("stderr", (stderr: string) => {
          errorData += stderr;
          console.error("Python stderr:", stderr);
        });

        pyShell?.on("error", (err: Error) => {
          if (!isResolved) {
            console.error("Python error:", err);
            isResolved = true;
            reject(err);
          }
        });

        pyShell?.on("close", async () => {
          try {
            const trimmedData = resultData.trim();
            if (!trimmedData) {
              isResolved = true;
              reject(new Error("No output received from Python"));
              return;
            }

            const result = JSON.parse(trimmedData);
            const { results, outputs } = result;
            const testCases: TestCase[] = req.body?.testCases || [];
            const failedOutputs = [];
            for (let i = 0; i < results.length; i++) {
              if (!results[i]) {
                failedOutputs.push({
                  testCase: testCases[i],
                  actualOutput: outputs[i],
                  expectedOutput: testCases[i]?.expectedOutput,
                });
              }
            }

            const status = results.every((r: boolean) => r);
            const message = status
              ? "Perfect, all tests were successfully passed"
              : `Some tests failed: ${results.length - failedOutputs.length} of ${
                  results.length
                } tests did not pass`;

            isResolved = true;

            return sendSuccess(
              res,
              {
                message,
                status,
                results,
                outputs: status ? [] : failedOutputs,
              },
              200
            );
            resolve();
          } catch (e: any) {
            console.error("Parse error:", e);
            console.error("Raw result data:", resultData);
            isResolved = true;
            reject(new Error(`Failed to parse Python output: ${e.message}`));
          }
        });

        // Send input to Python process
        const input = JSON.stringify({ code, testCases });
        console.log("Sending input to Python:", input);
        pyShell?.send(input);

        pyShell?.end((err) => {
          if (err) {
            console.error("Error ending Python shell:", err);
            if (!isResolved) {
              isResolved = true;
              reject(err);
            }
          }
        });
      }),
      new Promise((_, reject) =>
        setTimeout(() => {
          if (!isResolved) {
            console.log("Timeout reached after", TIMEOUT_MS, "ms");
            isResolved = true;
            reject(new Error("Execution timeout"));
          }
        }, TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    console.error("Code execution error:", error);
    sendError(
      res,
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        results: [],
        outputs: [],
      },
      500
    );
  } finally {
    if (pyShell) {
      try {
        pyShell.terminate();
      } catch (err) {
        console.error("Error terminating Python shell:", err);
      }
    }
  }
});

export default router;
