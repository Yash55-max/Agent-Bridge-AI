import asyncio
import httpx
from typing import List, Dict, Any
from uuid import uuid4

from app.services.generation_state import get_latest_generated_code
from app.services.generate_service import call_groq
from app.services.event_broadcaster import manager
import json


def _extract_summary(text: str, max_chars: int = 300) -> str:
    if not text:
        return ""
    # prefer first paragraph
    parts = text.split("\n\n")
    first = parts[0].strip()
    if len(first) > max_chars:
        # try first sentence
        m = first.split(". ")
        if m:
            s = (m[0] + ("." if not m[0].endswith(".") else "")).strip()
            return s[:max_chars] + ("..." if len(s) > max_chars else "")
        return first[:max_chars] + "..."
    return first


class AgentOrchestrator:
    """A minimal orchestrator that simulates agents by making HTTP calls to MCP servers.
    Falls back to LLM-based analysis using the latest generated MCP code when the MCP server
    is not reachable.
    """

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    async def start_session(self, mcp_base_url: str, agents: List[Dict[str, Any]]) -> str:
        session_id = str(uuid4())
        self.sessions[session_id] = {"mcp": mcp_base_url, "agents": agents, "events": []}
        # run an example simulation loop in background
        asyncio.create_task(self._run_demo(session_id))
        return session_id

    async def _run_demo(self, session_id: str):
        session = self.sessions[session_id]
        mcp = session["mcp"].rstrip("/")
        agents = session["agents"]
        async with httpx.AsyncClient(timeout=10.0) as client:
            for turn in range(3):
                for agent in agents:
                    # Try calling a tools endpoint on the generated/remote MCP server first
                    try:
                        # Try common MCP tool endpoints (root and /api/v1 prefix)
                        endpoints = [f"{mcp}/tools/list", f"{mcp}/api/v1/tools/list"]
                        r = None
                        for ep in endpoints:
                            try:
                                r = await client.get(ep)
                                if r.status_code == 200:
                                    break
                            except Exception:
                                r = None
                        if r is not None and r.status_code == 200:
                            result = r.json()
                            event = {"type": "mcp:tool_result", "agent": agent.get("name"), "result": result}
                            session["events"].append(event)
                            await asyncio.sleep(0.1)
                            continue
                        else:
                            raise Exception(f"status {r.status_code if r is not None else 'no-response'}")
                    except Exception:
                        # Fallback: use latest generated code and LLM to produce an analysis for this agent
                        generated = get_latest_generated_code()
                        prompt = (
                            f"You are agent '{agent.get('name')}'. Goal: {agent.get('goal')}.\n"
                            "Analyze the following MCP server code and provide a concise result describing what the agent should report:\n\n"
                            f"{generated}"
                        )
                        analysis = call_groq(prompt)
                        summary = _extract_summary(analysis)
                        event = {
                            "type": "agent:analysis",
                            "agent": agent.get("name"),
                            "result": {"summary": summary, "detail": analysis},
                        }
                        session["events"].append(event)
                        # broadcast to any connected websocket clients for this session
                        try:
                            await manager.broadcast(session_id, event)
                        except Exception:
                            pass
                    # small delay to simulate runtime
                    await asyncio.sleep(0.3)
        # build a final aggregated summary using the collected agent analyses
        analyses = [e for e in session.get("events", []) if e.get("type") == "agent:analysis"]
        aggregated_prompt = "Given the following agent analyses, produce a compact JSON summary with keys: summary (one-paragraph), findings (array of short points), and recommendations (array):\n\n"
        for a in analyses:
            res = a.get("result")
            if isinstance(res, dict):
                detail = res.get("detail") or res.get("summary") or ""
            else:
                detail = str(res)
            aggregated_prompt += f"Agent: {a.get('agent')}\n{detail}\n\n"

        final_text = call_groq(aggregated_prompt)
        final_obj = None
        try:
            # try parse JSON out of the LLM response
            final_obj = json.loads(final_text)
        except Exception:
            # attempt to extract a JSON block from the response
            try:
                import re

                m = re.search(r"\{[\s\S]*\}", final_text)
                if m:
                    final_obj = json.loads(m.group(0))
                else:
                    final_obj = {"text": final_text}
            except Exception:
                final_obj = {"text": final_text}

        # Normalize final result into a stable shape: summary + paragraphs + raw
        final_result: Dict[str, Any] = {"summary": "", "paragraphs": [], "raw": final_obj}

        if isinstance(final_obj, dict):
            if "summary" in final_obj and isinstance(final_obj.get("summary"), str):
                summary_text = final_obj.get("summary") or ""
                paragraphs = [p.strip() for p in summary_text.split("\n\n") if p.strip()]
                final_result["summary"] = summary_text
                final_result["paragraphs"] = paragraphs if paragraphs else [summary_text]
            elif "text" in final_obj and isinstance(final_obj.get("text"), str):
                text = final_obj.get("text") or ""
                paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
                final_result["summary"] = paragraphs[0] if paragraphs else text
                final_result["paragraphs"] = paragraphs if paragraphs else [text]
            else:
                s = json.dumps(final_obj, indent=2)
                paragraphs = [p for p in s.split("\n\n") if p.strip()]
                final_result["summary"] = paragraphs[0] if paragraphs else s
                final_result["paragraphs"] = paragraphs if paragraphs else [s]
        elif isinstance(final_obj, str):
            paragraphs = [p.strip() for p in final_obj.split("\n\n") if p.strip()]
            final_result["summary"] = paragraphs[0] if paragraphs else final_obj
            final_result["paragraphs"] = paragraphs if paragraphs else [final_obj]
        else:
            final_result["summary"] = str(final_obj)
            final_result["paragraphs"] = [str(final_obj)]

        done = {"type": "final", "result": final_result}
        session["events"].append(done)
        try:
            await manager.broadcast(session_id, done)
        except Exception:
            pass

    def get_events(self, session_id: str):
        return self.sessions.get(session_id, {}).get("events", [])
