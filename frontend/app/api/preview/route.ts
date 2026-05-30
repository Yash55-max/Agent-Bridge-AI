import { defaultPreview } from "@/lib/preview";

export async function GET() {
  return Response.json(defaultPreview);
}
