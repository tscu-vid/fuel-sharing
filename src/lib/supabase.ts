import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the Supabase secret key. Never import this from
// a Client Component — the secret key must never reach the browser. Auth is
// handled entirely by Clerk, so RLS is enabled with no policies on every
// table; only this secret-key client can read/write.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
);
