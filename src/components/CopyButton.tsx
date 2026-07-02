"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex shrink-0 items-center gap-1 rounded-lg border border-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-50"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-600" /> Copied
        </>
      ) : (
        <>
          <Copy size={13} /> Copy link
        </>
      )}
    </button>
  );
}
