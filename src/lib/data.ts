import "server-only";
import { supabase } from "./supabase";
import type { AppUser, Drive, Refuel, Settlement } from "./balances";

export async function getAppUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase.from("app_users").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getDrives(): Promise<Drive[]> {
  const { data, error } = await supabase
    .from("drives")
    .select("*")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOpenDrive(): Promise<Drive | null> {
  const { data, error } = await supabase
    .from("drives")
    .select("*")
    .is("ended_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRefuels(): Promise<Refuel[]> {
  const { data, error } = await supabase
    .from("refuels")
    .select("*")
    .order("refueled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSettlements(): Promise<Settlement[]> {
  const { data, error } = await supabase
    .from("settlements")
    .select("*")
    .order("settled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLatestKnownKm(): Promise<number> {
  const [{ data: lastDrive }, { data: lastRefuel }] = await Promise.all([
    supabase
      .from("drives")
      .select("end_km, start_km")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("refuels")
      .select("km")
      .order("refueled_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const fromDrive = lastDrive ? lastDrive.end_km ?? lastDrive.start_km : 0;
  const fromRefuel = lastRefuel?.km ?? 0;
  return Math.max(fromDrive ?? 0, fromRefuel ?? 0, 0);
}
