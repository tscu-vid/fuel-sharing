// One-off schema migration runner: `node --env-file=.env.local scripts/migrate.mjs`
import { readFileSync } from "node:fs";
import { Client } from "pg";

const ref = process.env.SUPABASE_PROJECT_REF;
const password = process.env.SUPABASE_DATABASE_PW;
if (!ref || !password) {
  throw new Error("Missing SUPABASE_PROJECT_REF or SUPABASE_DATABASE_PW");
}

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

// Try the direct connection first, then fall back to the pgbouncer pooler
// (session mode) in case the direct host isn't reachable from this network.
// TLS certs are verified normally (Supabase uses publicly trusted certs).
const candidates = [
  {
    label: "direct",
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
  },
  {
    label: "pooler (aws-0-eu-central-1)",
    connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  },
  {
    label: "pooler (aws-1-eu-central-1)",
    connectionString: `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`,
  },
];

let lastError;
for (const candidate of candidates) {
  const client = new Client({
    connectionString: candidate.connectionString,
    ssl: true,
    connectionTimeoutMillis: 8000,
  });
  try {
    console.log(`Trying ${candidate.label}...`);
    await client.connect();
    await client.query(sql);
    console.log(`Schema applied successfully via ${candidate.label}.`);
    await client.end();
    process.exit(0);
  } catch (err) {
    lastError = err;
    console.error(`Failed via ${candidate.label}: ${err.message}`);
    try {
      await client.end();
    } catch {}
  }
}

console.error("All connection attempts failed.");
throw lastError;
