import { getAppUsers, getRefuels, getLatestKnownKm } from "@/lib/data";
import { logRefuel } from "./actions";
import { SubmitButton } from "@/components/ui";

export default async function RefuelsPage() {
  const [users, refuels, latestKm] = await Promise.all([
    getAppUsers(),
    getRefuels(),
    getLatestKnownKm(),
  ]);
  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Refuels</h1>

      <form action={logRefuel} className="space-y-3 rounded-xl border border-gray-200 p-4">
        <label className="block text-sm font-medium">
          Odometer at refuel (km)
          <input
            type="number"
            name="km"
            required
            min={0}
            step="0.1"
            defaultValue={latestKm}
            className="mt-1 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Cost (€)
          <input
            type="number"
            name="cost"
            required
            min={0.01}
            step="0.01"
            placeholder="45.30"
            className="mt-1 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Liters (optional)
          <input
            type="number"
            name="liters"
            min={0.01}
            step="0.01"
            placeholder="35"
            className="mt-1 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        <SubmitButton className="w-full">Log refuel</SubmitButton>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">History</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {refuels.length === 0 && (
            <li className="p-3 text-sm text-gray-400">No refuels logged yet.</li>
          )}
          {refuels.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{nameById[r.user_id] ?? "?"}</p>
                <p className="text-gray-500">
                  {r.km} km · {new Date(r.refueled_at).toLocaleDateString()}
                  {r.liters ? ` · ${r.liters} L` : ""}
                </p>
              </div>
              <strong>€{r.cost.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
