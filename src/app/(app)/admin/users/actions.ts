"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { ensureCurrentAppUser } from "@/lib/current-user";

export async function inviteUser(formData: FormData) {
  const me = await ensureCurrentAppUser();
  if (me.role !== "manager") throw new Error("Only the manager can invite users");

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !name) throw new Error("Name and email are required");

  const client = await clerkClient();
  await client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: { name },
  });

  revalidatePath("/admin/users");
}
