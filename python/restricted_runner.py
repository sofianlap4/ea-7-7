import time
import sys
import json
from typing import List, Dict, Any
from secure_runner import run_code_safely

def debug_log(message: str):
    """Helper function for debug logging"""
    try:
        print(f"[DEBUG] {message}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Error writing to stderr: {e}")


def run_tests(code: str, test_cases: List[Dict[str, str]]) -> Dict[str, Any]:
    #debug_log(f"Running tests with {len(test_cases)} test cases {test_cases}")
    if not code or not isinstance(code, str):
        return {
            'results': [],
            'outputs': [],
            'error': 'Invalid code input'
        }
    if not test_cases or not isinstance(test_cases, list):
        return {
            'results': [],
            'outputs': [],
            'error': 'Invalid test cases'
        }
    results = []
    outputs = []
    try:
        for case in test_cases:
            if not isinstance(case, dict) or 'input' not in case or 'expectedOutput' not in case:
                raise ValueError('Invalid test case format')
            result = run_code_safely(code, case.get('input', ''))
            if result['success']:
                actual_output = result['output'].strip()
                expected_output = case.get('expectedOutput', '').strip()
                results.append(actual_output.strip().lower() == expected_output.strip().lower())
                outputs.append(actual_output)
            else:
                results.append(False)
                outputs.append(f"Error: {result['error']}")
        return {
            'results': results,
            'outputs': outputs
        }
    except Exception as e:
        return {
            'results': [],
            'outputs': [],
            'error': f'Execution error: {str(e)}'
        }

if __name__ == "__main__":
    try:
        #debug_log("Starting input reading process")
        try:
            # Read input with proper escape handling
            input_data = sys.stdin.read()
            #debug_log(f"Raw input received: {repr(input_data)}")  # Use repr() to see exact string
            
            # Clean and parse JSON
            input_data = input_data.strip()  # Remove any whitespace
            #debug_log(f"Cleaned input length: {len(input_data)}")


            try:
                payload = json.loads(input_data)
                #debug_log(f"Type of payload: {type(payload)}")
                #debug_log(f"Payload content: {repr(payload)}")
                if isinstance(payload, str):
                    #debug_log("Payload was a string, attempting second json.loads()")
                    payload = json.loads(payload)
                #debug_log("Payload is a dictionary and ready to be used")

                #debug_log("JSON parsed successfully")
                
            except json.JSONDecodeError as e:
                #debug_log(f"JSON parse error at pos {e.pos}: {e.msg}")
                #debug_log(f"JSON fragment: {input_data[max(0, e.pos-20):min(len(input_data), e.pos+20)]}")
                raise
        except Exception as e:
            #debug_log(f"Input processing error: {str(e)}")
            raise

        # Continue with test execution
        result = run_tests(payload['code'], payload['testCases'])
        results = result['results']
        outputs = []
        for i, test_case in enumerate(payload['testCases']):
            outputs.append({
                "testCase": test_case,
                "actualOutput": result['outputs'][i],
                "expectedOutput": test_case['expectedOutput']
            })
        passed_count = sum(results)
        status = all(results)
        if status:
            message = "Perfect, all tests were successfully passed"
        else:
            message = f"Some tests failed: {len(results) - passed_count} of {len(results)} tests did not pass"

        final_result = {
            "message": message,
            "status": status,
            "results": results,
            "outputs": outputs
        }

        # Write output with proper encoding
        output_json = json.dumps(final_result, ensure_ascii=False)
        sys.stdout.buffer.write(output_json.encode('utf-8'))
        sys.stdout.buffer.write(b'\n')
        sys.stdout.buffer.flush()

        #debug_log("Process completed successfully")
        sys.exit(0)

    except Exception as e:
        #debug_log(f"Fatal error: {str(e)}")
        error_response = {
            'results': [],
            'outputs': [],
            'error': f'System error: {str(e)}'
        }
        sys.stdout.buffer.write(json.dumps(error_response).encode('utf-8'))
        sys.stdout.buffer.write(b'\n')
        sys.stdout.buffer.flush()
        sys.exit(1)