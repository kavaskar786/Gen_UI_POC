# Generative AI POC

Next.js App Router starter for the [Vercel AI SDK](https://ai-sdk.dev). It covers the two patterns most proofs of concept need: a streaming chat with tools, and structured extraction validated by Zod.

## Stack

- Next.js 16 App Router
- AI SDK 7 (`ai`, `@ai-sdk/react`)
- Vercel AI Gateway by default, with a direct OpenAI switch
- Zod 4 for tool inputs and structured output

## Layout

```text
app/api/chat/route.ts       streaming chat + tool loop
app/api/generate/route.ts   structured brief extraction
app/api/health/route.ts     provider/model status, no secrets
lib/ai/model.ts             provider and model selection
lib/ai/tools.ts             server-side tools
lib/ai/schemas.ts           Zod schema for structured output
lib/ai/prompts.ts           instructions
components/                 chat and extract UI
```

API keys stay on the server. The browser only talks to these route handlers.

## Setup

Requires Node.js 22+.

```bash
cd genai-poc
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Pick one provider in `.env.local`.

**Vercel AI Gateway** (default). Create a key in the [Vercel AI Gateway](https://vercel.com/ai-gateway) dashboard.

```dotenv
AI_PROVIDER=gateway
AI_MODEL=openai/gpt-5.4-mini
AI_GATEWAY_API_KEY=your_key
```

**OpenAI directly**

```dotenv
AI_PROVIDER=openai
AI_MODEL=gpt-5.4-mini
OPENAI_API_KEY=your_key
```

Other providers are the same shape: install `@ai-sdk/<provider>` and return that provider from `getLanguageModel()` in `lib/ai/model.ts`.

## Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Chat** streams from `/api/chat`. Ask for the weather in a city, then Celsius, to see the multi-step tool loop.
- **Extract** posts notes to `/api/generate` and renders the validated brief.

The weather tool is simulated. Swap its `execute` function for a real API when the POC needs live data.

## Model notes

Gateway model ids are `provider/model`, for example `anthropic/claude-sonnet-5.5`. Direct provider ids omit that prefix. Change `AI_MODEL` and restart `pnpm dev` after editing `.env.local`.
