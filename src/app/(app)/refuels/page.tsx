import Link from "next/link";
import { Fuel, Receipt } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { getAppUsers, getRefuels, getLatestKnownKm } from "@/lib/data";
import { logRefuel } from "./actions";
import { SubmitButton, Field, inputClass, cardClass } from "@/components/ui";

export default async function RefuelsPage() {
  const [user, users, refuels, latestKm] = await Promise.all([
    ensureCurrentAppUser(),
    getAppUsers(),
    getRefuels(),
    getLatestKnownKm(),
  ]);
  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <Fuel size={22} className="text-brand-500" /> Refuels
      </h1>

      <form action={logRefuel} className={`space-y-3 ${cardClass}`}>
        <Field label="Odometer at refuel (km)">
          <input
            type="number"
            name="km"
            required
            min={0}
            step="0.1"
            defaultValue={latestKm}
            className={inputClass}
          />
        </Field>
        <Field label="Cost (€)">
          <input
            type="number"
            name="cost"
            required
            min={0.01}
            step="0.01"
            placeholder="45.30"
            className={inputClass}
          />
        </Field>
        <Field label="Liters (optional)">
          <input
            type="number"
            name="liters"
            min={0.01}
            step="0.01"
            placeholder="35"
            className={inputClass}
          />
        </Field>
        <SubmitButton className="w-full">Log refuel</SubmitButton>
      </form>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-400">
          <Receipt size={15} /> History
        </h2>
        <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
          {refuels.length === 0 && (
            <li className="p-3.5 text-sm text-ink-400">No refuels logged yet.</li>
          )}
          {refuels.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-3.5 text-sm">
              <div>
                <p className="font-semibold text-ink-900">{nameById[r.user_id] ?? "?"}</p>
                <p className="text-ink-400">
                  {r.km} km · {new Date(r.refueled_at).toLocaleDateString()}
                  {r.liters ? ` · ${r.liters} L` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <strong className="text-brand-500">€{r.cost.toFixed(2)}</strong>
                {(r.user_id === user.id || user.role === "manager") && (
                  <Link href={`/refuels/${r.id}/edit`} className="text-xs font-semibold text-brand-500">
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
