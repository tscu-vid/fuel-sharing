import { ensureCurrentAppUser } from "@/lib/current-user";
import { getAppUsers, getDrives, getOpenDrive, getLatestKnownKm } from "@/lib/data";
import { startDrive, endDrive } from "./actions";
import { SubmitButton } from "@/components/ui";

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
      <h1 className="text-xl font-semibold">Drives</h1>

      {openDrive ? (
        openDrive.user_id === user.id ? (
          <form action={endDrive} className="space-y-3 rounded-xl border border-gray-200 p-4">
            <input type="hidden" name="driveId" value={openDrive.id} />
            <p className="text-sm text-gray-600">
              Started at {openDrive.start_km} km
            </p>
            <label className="block text-sm font-medium">
              Odometer now (km)
              <input
                type="number"
                name="endKm"
                required
                min={openDrive.start_km}
                step="0.1"
                defaultValue={latestKm}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3"
              />
            </label>
            <SubmitButton className="w-full">End drive</SubmitButton>
          </form>
        ) : (
          <div className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
            {nameById[openDrive.user_id] ?? "Someone"} is currently driving
            (started at {openDrive.start_km} km).
          </div>
        )
      ) : (
        <form action={startDrive} className="space-y-3 rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium">
            Odometer now (km)
            <input
              type="number"
              name="startKm"
              required
              min={0}
              step="0.1"
              defaultValue={latestKm}
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>
          <SubmitButton className="w-full">Start drive</SubmitButton>
        </form>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">History</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {drives.length === 0 && (
            <li className="p-3 text-sm text-gray-400">No drives logged yet.</li>
          )}
          {drives.map((d) => (
            <li key={d.id} className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{nameById[d.user_id] ?? "?"}</span>
                <span className="text-gray-500">
                  {new Date(d.started_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600">
                {d.start_km} km → {d.end_km ?? "..."} km
                {d.end_km != null && (
                  <span className="text-gray-400"> ({(d.end_km - d.start_km).toFixed(1)} km)</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
