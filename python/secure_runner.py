import ast
import builtins
import contextlib
import io
import threading
import _thread
from typing import List, Set, Dict, Any

class CodeValidator(ast.NodeVisitor):
    ALLOWED_FUNCTIONS = {
        'print', 'input', 'len', 'int', 'str', 'float',
        'list', 'dict', 'set', 'tuple', 'sum', 'min', 'max',
        'sorted', 'range', 'enumerate', 'zip', 'round', 'map'
    }

    def __init__(self):
        self.errors: List[str] = []
        self.used_functions: Set[str] = set()
        self.user_defined_functions: Set[str] = set()

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.user_defined_functions.add(node.name)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            self.used_functions.add(func_name)
            if (
                func_name not in self.ALLOWED_FUNCTIONS
                and func_name not in self.user_defined_functions
            ):
                self.errors.append(f"Function '{func_name}' is not allowed")
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:
        self.errors.append("Import statements are not allowed")

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        self.errors.append("Import statements are not allowed")

def create_safe_globals() -> Dict[str, Any]:
    safe_builtins = {
        name: getattr(builtins, name)
        for name in CodeValidator.ALLOWED_FUNCTIONS
        if hasattr(builtins, name)
    }
    return {'__builtins__': safe_builtins}

def make_input_fn(input_string: str):
    inputs = input_string.splitlines()
    index = -1
    def input_fn():
        nonlocal index
        index += 1
        if index >= len(inputs):
            raise IndexError("Not enough input values provided")
        return inputs[index]
    return input_fn

def run_with_timeout(code: str, globals_dict: dict, timeout: int = 2):
    thread_result = {'output': '', 'error': None}
    output = io.StringIO()

    def target():
        try:
            with contextlib.redirect_stdout(output):
                exec(code, globals_dict)
            thread_result['output'] = output.getvalue()
        except Exception as e:
            thread_result['error'] = str(e)
            thread_result['output'] = output.getvalue()

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(timeout)
    
    if thread.is_alive():
        return False, 'Code execution timed out', output.getvalue()
    
    if thread_result['error']:
        return False, thread_result['error'], thread_result['output']
    
    return True, '', thread_result['output']

def run_code_safely(code: str, test_input: str = "") -> Dict[str, Any]:
    # Validate code statically
    try:
        tree = ast.parse(code)
        validator = CodeValidator()
        validator.visit(tree)
        if validator.errors:
            return {
                'success': False,
                'error': '\n'.join(validator.errors),
                'output': ''
            }
    except SyntaxError as e:
        return {
            'success': False,
            'error': f'Syntax error: {str(e)}',
            'output': ''
        }

    # Prepare execution environment
    safe_globals = create_safe_globals()
    safe_globals['input'] = make_input_fn(test_input)

    # Run code with timeout
    success, error, output = run_with_timeout(code, safe_globals)
    
    return {
        'success': success,
        'error': error,
        'output': output
    }