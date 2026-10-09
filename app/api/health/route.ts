import { getAiStatus } from "@/lib/ai/model";

export async function GET() {
  try {
    return Response.json(getAiStatus());
  } catch (error) {
    return Response.json(
      {
        provider: "unknown",
        model: null,
        configured: false,
        error:
          error instanceof Error ? error.message : "Invalid AI configuration.",
      },
      { status: 500 },
    );
  }
}
