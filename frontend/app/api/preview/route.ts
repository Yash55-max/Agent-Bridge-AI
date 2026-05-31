export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/v1/preview`, { cache: "no-store" });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      {
        name: "No generation yet",
        status: "idle",
        tools: [],
        sandbox: { agents: 0, events: 0, latencyMs: 0 },
      },
      { status: 200 },
    );
  }
}
