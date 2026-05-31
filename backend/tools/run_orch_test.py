import asyncio
from app.services.agent_orchestrator import AgentOrchestrator

async def main():
    orch = AgentOrchestrator()
    sid = await orch.start_session("http://127.0.0.1:9000", [
        {"name": "Agent 1: The Data Analyst", "goal": "Extract data and summarize."},
        {"name": "Agent 2: The Supervisor", "goal": "Validate outputs and format final result."},
    ])
    # wait for the demo to complete
    await asyncio.sleep(4)
    events = orch.get_events(sid)
    print("SESSION", sid)
    for e in events:
        print("--- EVENT ---")
        print(e)

if __name__ == '__main__':
    asyncio.run(main())
