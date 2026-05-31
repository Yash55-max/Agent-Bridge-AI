export async function POST(request: Request) {
  const body = await request.text();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/v1/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json({
      error: "backend_unreachable",
      message: "Failed to reach backend generate endpoint.",
    }, {
      status: 502,
    });
  }
}
