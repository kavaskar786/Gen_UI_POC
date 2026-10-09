import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/model";
import { pocTools } from "@/lib/ai/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const messages =
    body && typeof body === "object" && "messages" in body
      ? body.messages
      : undefined;

  if (!Array.isArray(messages)) {
    return Response.json(
      { error: "Expected a messages array." },
      { status: 400 },
    );
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

  const result = streamText({
    model,
    instructions: CHAT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages as UIMessage[]),
    tools: pocTools,
    stopWhen: isStepCount(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: true,
    }),
  });
}
