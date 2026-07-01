"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";
import { getLatestKnownKm } from "@/lib/data";

export async function startDrive(formData: FormData) {
  const user = await ensureCurrentAppUser();
  const startKm = Number(formData.get("startKm"));
  if (!Number.isFinite(startKm) || startKm < 0) {
    throw new Error("Enter a valid odometer reading");
  }

  const latestKm = await getLatestKnownKm();
  if (startKm < latestKm) {
    throw new Error(`Odometer can't be lower than the last recorded reading (${latestKm} km)`);
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

export async function updateDrive(formData: FormData) {
  const user = await ensureCurrentAppUser();
  const driveId = String(formData.get("driveId"));
  const startKm = Number(formData.get("startKm"));
  const endKm = Number(formData.get("endKm"));

  if (!Number.isFinite(startKm) || startKm < 0) {
    throw new Error("Enter a valid start odometer reading");
  }
  if (!Number.isFinite(endKm) || endKm < startKm) {
    throw new Error("End km can't be less than start km");
  }

  const { data: drive, error: fetchError } = await supabase
    .from("drives")
    .select("*")
    .eq("id", driveId)
    .single();
  if (fetchError) throw fetchError;
  if (drive.end_km == null) throw new Error("Only completed drives can be edited here");
  if (drive.user_id !== user.id && user.role !== "manager") {
    throw new Error("Only the driver or the manager can edit this drive");
  }

  const { error } = await supabase
    .from("drives")
    .update({ start_km: startKm, end_km: endKm })
    .eq("id", driveId);
  if (error) throw error;

  revalidatePath("/drives");
  revalidatePath("/dashboard");
  redirect("/drives");
}
