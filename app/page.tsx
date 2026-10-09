import { Suspense } from "react";
import { Studio } from "@/components/studio";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-black">
          Loading…
        </div>
      }
    >
      <Studio />
    </Suspense>
  );
}
