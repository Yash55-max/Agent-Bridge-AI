import ast
from typing import Tuple, List

BLOCKLIST = [
    "os.system",
    "subprocess",
    "eval",
    "exec",
    "__import__",
    "open",
    "socket",
    "ctypes",
]


def is_safe_code(code: str) -> Tuple[bool, List[str]]:
    """Perform a light AST-based scan for banned patterns. Returns (is_safe, issues)."""
    issues: List[str] = []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        issues.append(f"syntax_error: {e}")
        return False, issues

    for node in ast.walk(tree):
        # detect function calls like eval(...)
        if isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name) and func.id in ("eval", "exec", "open", "__import__"):
                issues.append(f"disallowed_call: {func.id}")
            if isinstance(func, ast.Attribute):
                full = []
                cur = func
                # attribute chain
                while isinstance(cur, ast.Attribute):
                    full.append(cur.attr)
                    cur = cur.value
                if isinstance(cur, ast.Name):
                    full.append(cur.id)
                fullname = ".".join(reversed(full))
                for bad in BLOCKLIST:
                    if fullname.startswith(bad):
                        issues.append(f"disallowed_attribute: {fullname}")

        # detect imports of disallowed modules
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = []
            if isinstance(node, ast.Import):
                for n in node.names:
                    names.append(n.name)
            else:
                if node.module:
                    names.append(node.module)
            for name in names:
                for bad in ("ctypes", "socket"):
                    if name and name.startswith(bad):
                        issues.append(f"disallowed_import: {name}")

    is_safe = len(issues) == 0
    return is_safe, issues
