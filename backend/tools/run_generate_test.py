import sys
from pathlib import Path
import json

# Ensure backend root is on sys.path so `import app` resolves when run from tools/
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.generate_service import generate_mcp_server


if __name__ == '__main__':
    res = generate_mcp_server('Create a minimal FastAPI app with /hello endpoint')
    print(json.dumps(res, indent=2))
