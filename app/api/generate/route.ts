import { generateText, NoObjectGeneratedError, Output } from "ai";
import { getLanguageModel } from "@/lib/ai/model";
import { EXTRACT_INSTRUCTIONS } from "@/lib/ai/prompts";
import { briefSchema } from "@/lib/ai/schemas";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const prompt =
    body && typeof body === "object" && "prompt" in body ? body.prompt : undefined;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return Response.json({ error: "A prompt is required." }, { status: 400 });
  }

  let model;

  try {
    model = getLanguageModel();
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The AI provider is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const result = await generateText({
      model,
      instructions: EXTRACT_INSTRUCTIONS,
      prompt,
      output: Output.object({
        name: "Brief",
        description: "A structured brief extracted from unstructured notes.",
        schema: briefSchema,
      }),
    });

    return Response.json({ output: result.output });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return Response.json(
        {
          error: "The model did not return valid structured data.",
          details: error.message,
        },
        { status: 502 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Generation failed.",
      },
      { status: 500 },
    );
  }
}
