import { gateway } from "ai";
import { openai } from "@ai-sdk/openai";

export type AiProviderName = "gateway" | "openai";

const DEFAULT_MODELS: Record<AiProviderName, string> = {
  gateway: "openai/gpt-5.4-mini",
  openai: "gpt-5.4-mini",
};

export function getProviderName(): AiProviderName {
  const value = (process.env.AI_PROVIDER ?? "gateway").trim().toLowerCase();

  if (value === "gateway" || value === "openai") {
    return value;
  }

  throw new Error(
    `Unsupported AI_PROVIDER "${value}". Use "gateway" or "openai".`,
  );
}

export function getModelId() {
  const provider = getProviderName();
  return process.env.AI_MODEL?.trim() || DEFAULT_MODELS[provider];
}

export function isProviderConfigured() {
  const provider = getProviderName();

  if (provider === "openai") {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

export function getAiStatus() {
  const provider = getProviderName();

  return {
    provider,
    model: getModelId(),
    configured: isProviderConfigured(),
  };
}

export function getLanguageModel() {
  const provider = getProviderName();
  const modelId = getModelId();

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "Missing OPENAI_API_KEY. Add it to .env.local, or switch AI_PROVIDER to gateway.",
      );
    }

    const id = modelId.startsWith("openai/")
      ? modelId.slice("openai/".length)
      : modelId;

    return openai(id);
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      "Missing AI_GATEWAY_API_KEY. Add it to .env.local, or set AI_PROVIDER=openai and OPENAI_API_KEY.",
    );
  }

  return gateway(modelId);
}
