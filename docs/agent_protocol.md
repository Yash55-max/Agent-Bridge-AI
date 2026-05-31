# Agent Protocol

This document describes the runtime protocol used by the sandbox orchestrator and agents, and the JSON event shapes emitted over the websocket to clients.

Event transport: WebSocket messages are JSON objects. Each message has a `type` field describing the event.

Event types

- `agent:analysis`
  - Emitted when an agent completes an analysis step (either via calling an MCP server or via LLM fallback).
  - Schema:
    - `type`: `agent:analysis`
    - `agent`: string — agent human-readable name
    - `result`: object
      - `summary`: string — short, one-paragraph summary suitable for UI headlines
      - `detail`: string — full textual analysis (may be multi-paragraph)

- `mcp:tool_result`
  - Emitted when a call to a deployed MCP tool endpoint returns structured data.
  - Schema:
    - `type`: `mcp:tool_result`
    - `agent`: string
    - `result`: any — the JSON-decoded response from the tool endpoint

- `final`
  - Emitted when the orchestrator collects all agent analyses and asks the LLM to produce a compact, machine-friendly summary.
  - Schema:
    - `type`: `final`
    - `result`: object
      - `summary`: string — one-paragraph summary (UI headline)
      - `paragraphs`: string[] — the final analysis split into paragraphs (preserves structure)
      - `raw`: any — the raw parsed object the LLM returned (kept for debugging)

Design notes

- Clients should render `agent:analysis` using `result.summary` for headlines and `result.detail` for the full text. `detail` may contain multiple paragraphs.
- Clients should render `final.paragraphs` as separate paragraphs (<p> elements) — this avoids single-line concatenation and preserves readability.
- The orchestrator will attempt to parse JSON from LLM replies. If parsing fails, the raw text is included under `result.raw` and `paragraphs` is built by splitting on double newlines.

Example `final` event:

```json
{
  "type": "final",
  "result": {
    "summary": "Agents agree the MCP exposes add() and multiply() with correct validation.",
    "paragraphs": [
      "The generated MCP server exposes two tools: add and multiply. Each endpoint validates numeric inputs and returns structured JSON.",
      "Recommendations: add unit tests for edge cases (very large numbers, non-numeric input).",
      "Action: deploy the MCP server and run the integrator test suite against /api/v1/tools/list."
    ],
    "raw": {"summary":"...","findings":["..."],"recommendations":["..."]}
  }
}
```

Keep this file in sync with `backend/app/services/agent_orchestrator.py` when making changes to event shapes.
