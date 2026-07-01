import Link from "next/link";
import { Car, Gauge } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { getAppUsers, getDrives, getOpenDrive, getLatestKnownKm } from "@/lib/data";
import { startDrive, endDrive } from "./actions";
import { SubmitButton, Field, inputClass, cardClass } from "@/components/ui";

export default async function DrivesPage() {
  const user = await ensureCurrentAppUser();
  const [users, drives, openDrive, latestKm] = await Promise.all([
    getAppUsers(),
    getDrives(),
    getOpenDrive(),
    getLatestKnownKm(),
  ]);
  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <Car size={22} className="text-brand-500" /> Drives
      </h1>

      {openDrive ? (
        openDrive.user_id === user.id ? (
          <form action={endDrive} className={`space-y-3 ${cardClass}`}>
            <input type="hidden" name="driveId" value={openDrive.id} />
            <p className="text-sm text-ink-400">
              Started at <span className="font-semibold text-ink-900">{openDrive.start_km} km</span>
            </p>
            <Field label="Odometer now (km)">
              <input
                type="number"
                name="endKm"
                required
                min={openDrive.start_km}
                step="0.1"
                defaultValue={latestKm}
                className={inputClass}
              />
            </Field>
            <SubmitButton className="w-full">End drive</SubmitButton>
          </form>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-4 text-sm text-ink-400">
            <Car size={16} />
            {nameById[openDrive.user_id] ?? "Someone"} is currently driving
            (started at {openDrive.start_km} km).
          </div>
        )
      ) : (
        <form action={startDrive} className={`space-y-3 ${cardClass}`}>
          <Field label="Odometer now (km)">
            <input
              type="number"
              name="startKm"
              required
              min={0}
              step="0.1"
              defaultValue={latestKm}
              className={inputClass}
            />
          </Field>
          <SubmitButton className="w-full">Start drive</SubmitButton>
        </form>
      )}

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-400">
          <Gauge size={15} /> History
        </h2>
        <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
          {drives.length === 0 && (
            <li className="p-3.5 text-sm text-ink-400">No drives logged yet.</li>
          )}
          {drives.map((d) => (
            <li key={d.id} className="p-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-900">{nameById[d.user_id] ?? "?"}</span>
                <span className="text-ink-400">
                  {new Date(d.started_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-ink-400">
                  {d.start_km} km → {d.end_km ?? "..."} km
                  {d.end_km != null && (
                    <span> ({(d.end_km - d.start_km).toFixed(1)} km)</span>
                  )}
                </p>
                {d.end_km != null && (d.user_id === user.id || user.role === "manager") && (
                  <Link href={`/drives/${d.id}/edit`} className="text-xs font-semibold text-brand-500">
                    Edit
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
