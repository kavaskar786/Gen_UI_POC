import { z } from "zod";

export const briefSchema = z.object({
  title: z.string().describe("Short title for the notes"),
  summary: z.string().describe("Two or three sentence summary of the notes"),
  sentiment: z
    .enum(["positive", "neutral", "negative", "mixed"])
    .describe("Overall tone of the notes"),
  keyPoints: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe("The main points, in the order they matter"),
  actionItems: z
    .array(
      z.object({
        owner: z.string().describe('Person responsible, or "unassigned"'),
        task: z.string().describe("The concrete next step"),
      }),
    )
    .describe("Follow-ups mentioned in the notes. Empty if there are none."),
});

export type Brief = z.infer<typeof briefSchema>;
