"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-gray-500">Something went wrong.</p>
      <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
