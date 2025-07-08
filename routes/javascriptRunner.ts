import { authenticateToken } from "../middleware/auth";
import express from "express";
import { sendSuccess, sendError } from "../utils/response";
import { RUNCODE_RESPONSE_MESSAGES } from "../utils/responseMessages";
import { checkPackAccess } from "../middleware/checkAccess";

const router = express.Router();

const JS_WHITELIST = [
  "console.log",
  "Math.abs",
  "Math.max",
  "Math.min",
  "parseInt",
  "parseFloat",
  "Array.isArray",
  "input",
  "split",
  "map",
  // Add more allowed functions as needed
];

function isCodeSafe(code: string): boolean {
  // Very basic check: ensure only whitelisted functions are used
  // For production, use a JS parser like acorn or esprima for AST-based checks!
  const forbidden = code.match(/\b([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/g);
  if (!forbidden) return true;
  return forbidden.every(
    (fnCall) =>
      JS_WHITELIST.some((allowed) => fnCall.startsWith(allowed)) || fnCall.startsWith("function") // allow function definitions
  );
}

function getUserDefinedFunctions(code: string): string[] {
  // Matches: function myFunc(
  const matches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/function\s+/, "").replace(/\s*\($/, ""));
}

function getForbiddenFunctions(code: string): string[] {
  const userFunctions = getUserDefinedFunctions(code);
  const forbidden = code.match(/\b([a-zA-Z_][a-zA-Z0-9_.]*)\s*\(/g);
  if (!forbidden) return [];
  return forbidden
    .map((fnCall) => fnCall.replace(/\s*\($/, ""))
    .filter(
      (fnName) =>
        !JS_WHITELIST.some((allowed) => fnName.startsWith(allowed)) &&
        !userFunctions.includes(fnName)
    );
}

router.post("/run-code", authenticateToken, checkPackAccess, async (req: any, res: any) => {
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
      404
    );
  }

  const forbiddenFunctions = getForbiddenFunctions(code);
  if (forbiddenFunctions.length > 0) {
    return sendError(
      res,
      {
        message: RUNCODE_RESPONSE_MESSAGES.NOT_ALLOWED,
        status: false,
        forbiddenFunctions,
        results: [],
        outputs: [],
      },
      400
    );
  }

  const vm = require("vm");
  let results: boolean[] = [];
  let outputs: { testCase: any; actualOutput: string; expectedOutput: string }[] = [];

  for (const testCase of testCases) {
    try {
      let output = "";
      const sandbox = {
        console: {
          log: (msg: any) => {
            if (typeof msg === "object") {
              output += JSON.stringify(msg) + "\n";
            } else {
              output += String(msg) + "\n";
            }
          },
        },
        Math,
        parseInt,
        parseFloat,
        Array,
      };
      vm.createContext(sandbox);
      const input = testCase.input;
      const wrappedCode = `
        let input = () => "${input}";
        ${code}
      `;
      vm.runInContext(wrappedCode, sandbox, { timeout: 1000 });
      const actualOutput = output.trim();
      const passed = actualOutput === testCase.expectedOutput.trim();
      results.push(passed);
      outputs.push({
        testCase,
        actualOutput,
        expectedOutput: testCase.expectedOutput.trim(),
      });
    } catch (err: any) {
      results.push(false);
      outputs.push({
        testCase,
        actualOutput: err && err.message ? "Error: " + err.message : "Unknown error",
        expectedOutput: testCase.expectedOutput.trim(),
      });
    }
  }

  const passedCount = results.filter(Boolean).length;
  const status = results.every((r) => r);
  const message = status
    ? "Perfect, all tests were successfully passed"
    : `Some tests failed: ${results.length - passedCount} of ${results.length} tests did not pass`;

  return sendSuccess(
    res,
    {
      message,
      status,
      results,
      outputs,
    },
    200
  );
});

export default router;
