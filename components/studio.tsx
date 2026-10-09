"use client";

import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat-panel";
import { GeneratePanel } from "@/components/generate-panel";

type Tab = "chat" | "extract";

type Health = {
  provider: string;
  model: string | null;
  configured: boolean;
  error?: string;
};

export function Studio() {
  const [tab, setTab] = useState<Tab>("chat");
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/health")
      .then((response) => response.json())
      .then((data: Health) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({
            provider: "unknown",
            model: null,
            configured: false,
            error: "Could not read the AI configuration.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Generative AI POC
              </p>
              <h1 className="text-lg font-medium">Vercel AI SDK</h1>
            </div>
            <p className="font-mono text-xs text-zinc-500">
              {health
                ? `${health.provider} · ${health.model ?? "unset"}`
                : "checking config…"}
            </p>
          </div>
          <div className="flex gap-2">
            <TabButton active={tab === "chat"} onClick={() => setTab("chat")}>
              Chat
            </TabButton>
            <TabButton
              active={tab === "extract"}
              onClick={() => setTab("extract")}
            >
              Extract
            </TabButton>
          </div>
        </div>
      </header>

      {health && !health.configured ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {health.error ??
            "No API key yet. Copy .env.example to .env.local and add a key, then restart the dev server."}
        </div>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">
        {tab === "chat" ? <ChatPanel /> : <GeneratePanel />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active
          ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}
