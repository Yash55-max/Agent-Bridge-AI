import subprocess
import os
from typing import Optional

DOCKERFILE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "docker", "sandbox-base")


class DockerManager:
    """Simple Docker manager wrapper that uses the docker CLI. Intended for local dev only."""

    def build_image(self, tag: str, context: Optional[str] = None) -> bool:
        """Build an image from the given context directory (defaults to sandbox base).
        Returns True on success.
        """
        ctx = context or DOCKERFILE_DIR
        cmd = ["docker", "build", "-t", tag, ctx]
        print("Running:", cmd)
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(res.stderr)
            return False
        return True

    def run_container(self, tag: str, name: str, port_map: Optional[str] = None, memory: Optional[str] = None, cpus: Optional[float] = None, restart_policy: str = "unless-stopped") -> Optional[str]:
        """Run a container from image `tag` with optional port mapping and resource limits.
        - `memory`: e.g. '256m'
        - `cpus`: float number of CPUs
        - `restart_policy`: docker restart policy
        Returns container id on success.
        """
        cmd = ["docker", "run", "-d", "--name", name, "--restart", restart_policy]
        if port_map:
            cmd += ["-p", port_map]
        if memory:
            cmd += ["--memory", memory]
        if cpus:
            cmd += ["--cpus", str(cpus)]
        cmd += [tag]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(res.stderr)
            return None
        return res.stdout.strip()

    def stop_container(self, name: str) -> bool:
        res = subprocess.run(["docker", "stop", name], capture_output=True, text=True)
        return res.returncode == 0

    def remove_container(self, name: str) -> bool:
        res = subprocess.run(["docker", "rm", name], capture_output=True, text=True)
        return res.returncode == 0

    def health_check(self, name: str) -> bool:
        """Return True if the container is running and healthy (if healthcheck present).
        Falls back to checking that the container is in the "running" state.
        """
        # prefer `docker inspect --format '{{.State.Health.Status}}' name` but handle missing health
        try:
            res = subprocess.run(["docker", "inspect", "--format", "{{.State.Health.Status}}", name], capture_output=True, text=True)
            if res.returncode == 0:
                status = res.stdout.strip()
                # possible values: "healthy", "unhealthy", "starting"
                return status == "healthy" or status == "starting"
        except Exception:
            pass
        # fallback: check running
        res = subprocess.run(["docker", "inspect", "--format", "{{.State.Running}}", name], capture_output=True, text=True)
        if res.returncode != 0:
            return False
        return res.stdout.strip().lower() == "true"

    def build_from_code(self, server_id: str, code: str, tag: str) -> bool:
        """Write `code` into a temporary build context based on sandbox base and build an image tagged `tag`.
        Returns True on success.
        """
        import tempfile
        import shutil

        base = DOCKERFILE_DIR
        if not os.path.exists(base):
            return False
        with tempfile.TemporaryDirectory() as tmpdir:
            # copy base context
            shutil.copytree(base, os.path.join(tmpdir, "ctx"), dirs_exist_ok=True)
            app_dir = os.path.join(tmpdir, "ctx", "app")
            os.makedirs(app_dir, exist_ok=True)
            # write code as app/main.py
            with open(os.path.join(app_dir, "main.py"), "w", encoding="utf-8") as f:
                f.write(code)
            # ensure Dockerfile uses app/main.py or app.main:app
            return self.build_image(tag, context=os.path.join(tmpdir, "ctx"))

    def get_logs(self, name: str, tail: Optional[int] = 200) -> str:
        """Return the last `tail` lines of logs for the given container name/id."""
        try:
            cmd = ["docker", "logs", "--tail", str(tail), name]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode != 0:
                # return stderr for debug
                return res.stderr or ""
            return res.stdout
        except Exception as e:
            return f"error fetching logs: {e}"

    def stream_logs(self, name: str):
        """Stream logs for the given container name/id as a generator of lines.

        This uses `docker logs -f` and yields lines as they arrive. The caller
        is responsible for formatting (e.g., SSE `data:` lines).
        """
        try:
            proc = subprocess.Popen(["docker", "logs", "-f", name], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if proc.stdout is None:
                yield ""
                return
            for line in iter(proc.stdout.readline, ""):
                if not line:
                    break
                yield line
            proc.stdout.close()
            proc.wait()
        except Exception as e:
            yield f"error streaming logs: {e}\n"
