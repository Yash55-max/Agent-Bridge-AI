import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${backend}/api/v1/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    // Fallback stub when backend is unreachable or errors
    const stub = {
      server_name: "generated_server_stub",
      generated_code: "# Stubbed generated code\nprint('hello from stub')",
      note: "Returned stub because backend call failed",
    };
    return NextResponse.json(stub, { status: 200 });
  }
}
