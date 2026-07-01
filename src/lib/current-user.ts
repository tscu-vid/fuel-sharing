import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "./supabase";
import type { AppUser } from "./balances";

/**
 * Ensures the signed-in Clerk user has a matching row in app_users, creating
 * it on first visit. Role is "manager" iff the email matches MANAGER_EMAIL,
 * so there's no separate admin UI needed to promote the first account.
 */
export async function ensureCurrentAppUser(): Promise<AppUser> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not signed in");
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || email || user.id;
  const role = email.toLowerCase() === process.env.MANAGER_EMAIL?.toLowerCase()
    ? "manager"
    : "member";

  const { data, error } = await supabase
    .from("app_users")
    .upsert(
      { id: user.id, name, email, role },
      { onConflict: "id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data as AppUser;
}
