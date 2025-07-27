import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { createPracticalexerciceAttempt, submitPracticalexercice, practicalexerciceRun } from "../api/practicalExercices";
import { PRACTICAL_RUNNER_RESPONSE_MESSAGES } from "../utils/responseMessages";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Props {
  starterCode?: string;
  language: "python" | "javascript" | "sql";
  testCases?: TestCase[];
}

const RankedexerciceRunner: React.FC<Props> = ({ starterCode = "", language, testCases = [] }) => {
  const navigate = useNavigate();
  const { exerciceId } = useParams(); // Make sure your route provides this param
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Run Tests handler
  const runTests = async () => {
    setLoading(true);
    setOutput(PRACTICAL_RUNNER_RESPONSE_MESSAGES.RUNNING_TESTS);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOutput(PRACTICAL_RUNNER_RESPONSE_MESSAGES.NOT_AUTHORIZED);
        navigate("/login");
        return;
      }

      if (!code.trim()) {
        setOutput(PRACTICAL_RUNNER_RESPONSE_MESSAGES.EMPTY_CODE);
        return;
      }

      const response = await practicalexerciceRun(code, language, testCases, token);
      if (response?.success && response?.data) {
        setOutput(response?.data?.message);
        setTestResults(response?.data?.results || []);
      } else if (Array.isArray(response?.data?.outputs) && response?.data?.outputs.length > 0) {
        const failedDetails = response?.data?.outputs
          .filter((o: any, idx: number) => !response?.data?.results[idx])
          .map(
            (fail: any, idx: number) =>
              `Test ${idx + 1}:\nInput: ${fail.testCase.input}\nExpected: ${
                fail.expectedOutput
              }\nActual: ${
                typeof fail.actualOutput === "object"
                  ? JSON.stringify(fail.actualOutput)
                  : fail.actualOutput
              }\n`
          )
          .slice(0, 3)
          .join("\n");
        setOutput(`${response?.data?.message}\n\n${failedDetails}`);
        setTestResults(response?.data?.results);
      } else {
        setOutput( response?.error || PRACTICAL_RUNNER_RESPONSE_MESSAGES.NO_TEST_CASES);
      }

      // Log the attempt (regardless of pass/fail)
      if (exerciceId) {
        await createPracticalexerciceAttempt(exerciceId, token);
      }
    } catch (error) {
      setOutput("Error running tests.");
    } finally {
      setLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!exerciceId) return;
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await submitPracticalexercice(exerciceId, code, token);
      if (response?.data.passed) {
        setOutput(`${response?.data.message || ""}`);
        // Redirect to the solutions page
        navigate(`/practical-exercices/${exerciceId}/solutions`);
      } else {
        setOutput(response.data.error || response?.data.message || "Submission failed.");
      }
    } catch (err) {
      setOutput("Error submitting solution.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const allPassed = testResults.length > 0 && testResults.every(Boolean);

  return (
    <div className='exercice-runner'>
      <MonacoEditor
        height='400px'
        defaultLanguage={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme='vs-dark'
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />

      <div className='controls'>
        <button onClick={runTests} disabled={loading} className='run-button'>
          {loading ? "Running..." : "Run Tests"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allPassed || submitLoading}
          className='submit-button'
          style={{ marginLeft: 12 }}
        >
          {submitLoading ? "Submitting..." : "Submit"}
        </button>
      </div>

      <div className='output'>
        <h4>Output:</h4>
        <pre>{output}</pre>
      </div>

      {testResults.length > 0 && (
        <div className='test-results'>
          <h4>Test Results:</h4>
          {testResults.map((passed, index) => (
            <div key={index} className={`test-case ${passed ? "passed" : "failed"}`}>
              Test {index + 1}: {passed ? "✅ Passed" : "❌ Failed"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RankedexerciceRunner;
