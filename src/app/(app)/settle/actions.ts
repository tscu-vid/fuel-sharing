"use server";

import { revalidatePath } from "next/cache";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";

export async function recordSettlement(formData: FormData) {
  await ensureCurrentAppUser();
  const fromUserId = String(formData.get("fromUserId"));
  const toUserId = String(formData.get("toUserId"));
  const amount = Number(formData.get("amount"));

  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    throw new Error("Invalid users for settlement");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid amount");
  }

  const { error } = await supabase
    .from("settlements")
    .insert({ from_user_id: fromUserId, to_user_id: toUserId, amount });
  if (error) throw error;

  revalidatePath("/settle");
  revalidatePath("/dashboard");
}
