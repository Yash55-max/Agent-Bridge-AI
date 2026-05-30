from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
from ...services.mcp_registry import MCPRegistry
from ...services.docker_mgr import DockerManager
from fastapi.responses import StreamingResponse
import io

router = APIRouter()
reg = MCPRegistry()

docker = DockerManager()


class CreateServerReq(BaseModel):
    name: str
    description: str
    code: str


@router.post("/servers")
async def create_server(req: CreateServerReq):
    entry = reg.create(req.name, req.description, req.code)
    return entry


@router.get("/servers")
async def list_servers():
    return reg.list()


@router.get("/servers/{server_id}")
async def get_server(server_id: str):
    try:
        return reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")


class DeployReq(BaseModel):
    server_id: str
    image_tag: str
    port: int
    memory: Optional[str] = None
    cpus: Optional[float] = None


@router.post("/servers/deploy")
async def deploy_server(req: DeployReq):
    try:
        server = reg.get(req.server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")

    # build image from the server's generated code
    tag = req.image_tag
    code = server.get("generated_code", "")
    ok = docker.build_from_code(req.server_id, code, tag)
    if not ok:
        raise HTTPException(status_code=500, detail="build failed")
    name = f"agentbridge_{req.server_id}"
    cid = docker.run_container(tag, name, port_map=f"{req.port}:{req.port}", memory=req.memory, cpus=req.cpus)
    if not cid:
        raise HTTPException(status_code=500, detail="run failed")
    reg.update(req.server_id, {"status": "running", "container_id": cid})
    return {"container_id": cid}


@router.get("/servers/{server_id}/health")
async def server_health(server_id: str):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    cid = server.get("container_id")
    if not cid:
        return {"status": "stopped"}
    ok = docker.health_check(cid)
    return {"container": cid, "healthy": ok}


@router.get("/servers/{server_id}/logs")
async def server_logs(server_id: str, tail: int = 200):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    cid = server.get("container_id")
    if not cid:
        raise HTTPException(status_code=400, detail="not running")
    logs = docker.get_logs(cid, tail=tail)
    buf = io.BytesIO(logs.encode("utf-8"))
    return StreamingResponse(buf, media_type="text/plain")


@router.get("/servers/{server_id}/logs/stream")
async def server_logs_stream(server_id: str):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    cid = server.get("container_id")
    if not cid:
        raise HTTPException(status_code=400, detail="not running")

    def event_iter():
        for line in docker.stream_logs(cid):
            # SSE data frame
            yield f"data: {line.rstrip()}\n\n"

    return StreamingResponse(event_iter(), media_type="text/event-stream")


@router.post("/servers/{server_id}/stop")
async def server_stop(server_id: str):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    cid = server.get("container_id")
    if not cid:
        raise HTTPException(status_code=400, detail="not running")
    ok = docker.stop_container(cid)
    if ok:
        reg.update(server_id, {"status": "stopped"})
    return {"stopped": ok}


@router.post("/servers/{server_id}/remove")
async def server_remove(server_id: str):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    cid = server.get("container_id")
    if not cid:
        raise HTTPException(status_code=400, detail="not running")
    ok = docker.remove_container(cid)
    if ok:
        reg.update(server_id, {"status": "removed", "container_id": None})
    return {"removed": ok}


@router.get("/servers/{server_id}/download")
async def server_download(server_id: str):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    code = server.get("generated_code", "")
    buf = io.BytesIO(code.encode("utf-8"))
    return StreamingResponse(buf, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=server_{server_id}.py"})


@router.post("/servers/{server_id}/test-tool")
async def test_tool(server_id: str, payload: dict):
    try:
        server = reg.get(server_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="not found")
    # attempt to call a tool on the running container via its configured port (assumes port in entry)
    return {"ok": True, "note": "stubbed tool test"}
