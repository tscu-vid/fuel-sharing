import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "./supabase";
import type { AppUser } from "./balances";

/**
 * Ensures the signed-in Clerk user has a matching row in app_users, creating
 * it on first visit. Role is "manager" iff the email matches MANAGER_EMAIL,
 * so there's no separate admin UI needed to promote the first account.
 *
 * Wrapped in React's cache() so the layout and page (which both call this)
 * share one call per request instead of racing two concurrent upserts — a
 * race that can otherwise 23505 on the email unique constraint, since
 * ON CONFLICT (id) only arbitrates conflicts on the id column.
 */
export const ensureCurrentAppUser = cache(async (): Promise<AppUser> => {
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

  if (error) {
    // Another concurrent request (e.g. a different tab) won the insert race.
    if (error.code === "23505") {
      const { data: existing, error: fetchError } = await supabase
        .from("app_users")
        .select()
        .eq("id", user.id)
        .single();
      if (fetchError) throw fetchError;
      return existing as AppUser;
    }
    throw error;
  }
  return data as AppUser;
});
