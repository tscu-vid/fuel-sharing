"use client";

import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white shadow-sm shadow-brand-700/20 hover:bg-brand-600 active:bg-brand-700",
  dark: "bg-ink-900 text-white shadow-sm hover:bg-ink-600",
  outline: "border border-ink-100 bg-white text-ink-900 hover:bg-ink-50",
} as const;

type Variant = keyof typeof VARIANTS;

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function SubmitButton({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${VARIANTS[variant]} ${className}`}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function ActionButton({
  action,
  children,
  className = "",
  variant = "primary",
  confirmMessage,
  redirectTo,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  confirmMessage?: string;
  /** Path to navigate to after the action succeeds. */
  redirectTo?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
            if (redirectTo) router.push(redirectTo);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className={`${base} ${VARIANTS[variant]} ${className}`}
    >
      {isPending ? "…" : children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink-600">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1 w-full rounded-lg border border-ink-100 bg-white p-3 text-ink-900 outline-none transition-shadow focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export const cardClass = "rounded-2xl border border-ink-100 bg-white p-4 shadow-sm";
