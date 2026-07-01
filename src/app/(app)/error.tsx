"use client";

import { OctagonAlert } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <OctagonAlert size={28} className="text-brand-500" />
      <p className="text-sm text-ink-400">Something went wrong.</p>
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
