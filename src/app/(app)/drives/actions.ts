"use server";

import { revalidatePath } from "next/cache";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";

export async function startDrive(formData: FormData) {
  const user = await ensureCurrentAppUser();
  const startKm = Number(formData.get("startKm"));
  if (!Number.isFinite(startKm) || startKm < 0) {
    throw new Error("Enter a valid odometer reading");
  }

  const { data: openDrive } = await supabase
    .from("drives")
    .select("id")
    .is("ended_at", null)
    .maybeSingle();
  if (openDrive) throw new Error("A drive is already in progress");

  const { error } = await supabase
    .from("drives")
    .insert({ user_id: user.id, start_km: startKm });
  if (error) throw error;

  revalidatePath("/drives");
  revalidatePath("/dashboard");
}

export async function endDrive(formData: FormData) {
  const user = await ensureCurrentAppUser();
  const driveId = String(formData.get("driveId"));
  const endKm = Number(formData.get("endKm"));
  if (!Number.isFinite(endKm)) throw new Error("Enter a valid odometer reading");

  const { data: drive, error: fetchError } = await supabase
    .from("drives")
    .select("*")
    .eq("id", driveId)
    .single();
  if (fetchError) throw fetchError;
  if (drive.user_id !== user.id) throw new Error("Only the driver who started this drive can end it");
  if (endKm < drive.start_km) throw new Error("End km can't be less than start km");

  const { error } = await supabase
    .from("drives")
    .update({ end_km: endKm, ended_at: new Date().toISOString() })
    .eq("id", driveId);
  if (error) throw error;

  revalidatePath("/drives");
  revalidatePath("/dashboard");
}
