"use server";

import { revalidatePath } from "next/cache";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";

export async function logRefuel(formData: FormData) {
  const user = await ensureCurrentAppUser();
  const km = Number(formData.get("km"));
  const cost = Number(formData.get("cost"));
  const litersRaw = formData.get("liters");
  const liters = litersRaw ? Number(litersRaw) : null;

  if (!Number.isFinite(km) || km < 0) throw new Error("Enter a valid odometer reading");
  if (!Number.isFinite(cost) || cost <= 0) throw new Error("Enter a valid cost");
  if (liters != null && (!Number.isFinite(liters) || liters <= 0)) {
    throw new Error("Enter a valid amount of liters, or leave it blank");
  }

  const { error } = await supabase
    .from("refuels")
    .insert({ user_id: user.id, km, cost, liters });
  if (error) throw error;

  revalidatePath("/refuels");
  revalidatePath("/dashboard");
}
