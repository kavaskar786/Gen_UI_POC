"use client";

import { useChat } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { useEffect, useState } from "react";

const suggestions = [
  "What's the weather in Berlin, and what is that in Celsius?",
  "Explain generative AI in three sentences.",
];

export function ChatPanel() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <ChatPlaceholder />;
  }

  return <ChatSession />;
}

function ChatPlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-sm text-zinc-500">
      Loading chat…
    </div>
  );
}

function ChatSession() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, clearError } = useChat();
  const busy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const next = text.trim();
    if (!next || busy) return;

    clearError();
    void sendMessage({ text: next });
    setInput("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              Streaming chat
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Messages go to <code className="font-mono">/api/chat</code>, which
              streams a response and can call the weather tools.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        {busy ? (
          <p className="text-sm text-zinc-500">Generating…</p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error.message}
          </p>
        ) : null}
      </div>

      <form
        className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask something…"
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:focus:border-zinc-200"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => void stop()}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={input.trim().length === 0}
              className="rounded-xl bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-950"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`mx-auto max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 ${
        isUser
          ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
          : "border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      }`}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-60">
        {isUser ? "You" : "Assistant"}
      </p>
      <div className="space-y-3">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }

          if (part.type === "reasoning" && part.text) {
            return (
              <p
                key={`${message.id}-${index}`}
                className="whitespace-pre-wrap text-xs opacity-70"
              >
                {part.text}
              </p>
            );
          }

          if (isToolUIPart(part)) {
            return (
              <ToolCard key={`${message.id}-${index}`} part={part} />
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}

function ToolCard({
  part,
}: {
  part: Extract<UIMessage["parts"][number], { type: `tool-${string}` } | { type: "dynamic-tool" }>;
}) {
  const name = getToolName(part);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
      <p className="font-mono text-xs">
        {name} · {part.state}
      </p>
      {part.input ? (
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(part.input, null, 2)}
        </pre>
      ) : null}
      {part.state === "output-available" ? (
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(part.output, null, 2)}
        </pre>
      ) : null}
      {part.state === "output-error" ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-300">
          {part.errorText}
        </p>
      ) : null}
    </div>
  );
}
