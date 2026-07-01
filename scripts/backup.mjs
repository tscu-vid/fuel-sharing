// Snapshots all app tables to backups/<date>.json via the Supabase REST API.
// Run by .github/workflows/backup.yml on a daily schedule.
import { writeFileSync, mkdirSync } from "node:fs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
}

const TABLES = ["app_users", "drives", "refuels", "settlements"];

async function fetchTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${table}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const snapshot = { takenAt: new Date().toISOString() };
for (const table of TABLES) {
  snapshot[table] = await fetchTable(table);
}

mkdirSync("backups", { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const path = `backups/${date}.json`;
writeFileSync(path, JSON.stringify(snapshot, null, 2));
console.log(`Backup written to ${path}`);
