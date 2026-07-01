"use client";

import { useTransition } from "react";

export function SubmitButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatusCompat();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50 ${className}`}
    >
      {pending ? "..." : children}
    </button>
  );
}

// react-dom's useFormStatus must be called from inside a <form>; this file
// only ever renders as a form's direct child, so the wrapper keeps the
// import isolated in one place.
import { useFormStatus } from "react-dom";
function useFormStatusCompat() {
  return useFormStatus();
}

export function ActionButton({
  action,
  children,
  className = "",
  confirmMessage,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
          } catch (err) {
            alert(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className={`rounded-xl px-4 py-3 font-medium disabled:opacity-50 ${className}`}
    >
      {isPending ? "..." : children}
    </button>
  );
}
