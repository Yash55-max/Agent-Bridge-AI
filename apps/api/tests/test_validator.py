from apps.api.app.services.validator import is_safe_code


def test_validator_allows_simple_code():
    code = """
def add(a,b):
    return a+b
"""
    ok, issues = is_safe_code(code)
    assert ok
    assert issues == []


def test_validator_blocks_eval_and_subprocess():
    code = """
import subprocess
subprocess.run(['ls'])
"""
    ok, issues = is_safe_code(code)
    assert not ok
    assert any('subprocess' in s or 'disallowed_import' in s for s in issues)
