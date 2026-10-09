"use client";

import { useState } from "react";
import type { Brief } from "@/lib/ai/schemas";

const sampleNotes = `Product sync, 9 Oct.
Priya said the chat POC is the priority for Friday's demo.
We still need a structured extraction example so stakeholders can see JSON, not just chat.
Alex will add the gateway key to the shared vault today.
Sentiment in the room was positive, but the timeline is tight.`;

export function GeneratePanel() {
  const [prompt, setPrompt] = useState(sampleNotes);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data: { output?: Brief; error?: string } = await response.json();

      if (!response.ok || !data.output) {
        throw new Error(data.error ?? "Generation failed.");
      }

      setBrief(data.output);
    } catch (caught) {
      setBrief(null);
      setError(caught instanceof Error ? caught.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-2 sm:px-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Structured extraction</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <code className="font-mono">/api/generate</code> asks the model for
            a typed brief and validates it with Zod before it reaches the UI.
          </p>
        </div>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          rows={14}
          className="min-h-64 w-full rounded-2xl border border-zinc-300 bg-white p-4 text-sm leading-6 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-200"
        />
        <button
          type="submit"
          disabled={loading || prompt.trim().length === 0}
          className="self-start rounded-xl bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-950"
        >
          {loading ? "Extracting…" : "Extract brief"}
        </button>
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </form>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {brief ? <BriefView brief={brief} /> : (
          <p className="text-sm text-zinc-500">
            The validated object will show up here.
          </p>
        )}
      </section>
    </div>
  );
}

function BriefView({ brief }: { brief: Brief }) {
  return (
    <div className="space-y-5 text-sm leading-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {brief.sentiment}
        </p>
        <h3 className="mt-1 text-lg font-medium">{brief.title}</h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">{brief.summary}</p>
      </div>
      <div>
        <h4 className="font-medium">Key points</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
          {brief.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium">Action items</h4>
        {brief.actionItems.length === 0 ? (
          <p className="mt-2 text-zinc-500">None found.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {brief.actionItems.map((item) => (
              <li
                key={`${item.owner}-${item.task}`}
                className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="font-medium">{item.owner}</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {" "}
                  — {item.task}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
