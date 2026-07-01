import { SignIn } from "@clerk/nextjs";
import { Gauge } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-900 px-4">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
      <div className="flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500">
          <Gauge size={24} className="text-white" strokeWidth={2.5} />
        </span>
        <p className="text-sm font-bold tracking-wide text-white">FUEL SHARING</p>
      </div>
      <SignIn />
    </div>
  );
}
