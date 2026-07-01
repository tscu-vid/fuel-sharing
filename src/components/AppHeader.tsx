import { Gauge } from "lucide-react";

export default function AppHeader({ isManager }: { isManager: boolean }) {
  return (
    <header className="sticky top-0 z-10 bg-ink-900">
      <div className="h-1 bg-gradient-to-r from-brand-500 via-gold-400 to-ink-900" />
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500">
          <Gauge size={16} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="text-sm font-bold tracking-wide text-white">
          FUEL SHARING
        </span>
        {isManager && (
          <span className="ml-auto rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gold-400 uppercase">
            Manager
          </span>
        )}
      </div>
    </header>
  );
}
