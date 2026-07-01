import {
  getAppUsers,
  getDrives,
  getRefuels,
  getSettlements,
} from "@/lib/data";
import { computeBalances } from "@/lib/balances";
import { recordSettlement } from "./actions";
import { SubmitButton } from "@/components/ui";

export default async function SettlePage() {
  const [users, drives, refuels, settlements] = await Promise.all([
    getAppUsers(),
    getDrives(),
    getRefuels(),
    getSettlements(),
  ]);
  const { suggestedPayments } = computeBalances(users, drives, refuels, settlements);
  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settle up</h1>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Suggested settlements</h2>
        {suggestedPayments.length === 0 ? (
          <p className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
            Everyone is settled up.
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestedPayments.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-sm"
              >
                <span>
                  {nameById[p.fromUserId]} → {nameById[p.toUserId]}
                  <br />
                  <strong>€{p.amount.toFixed(2)}</strong>
                </span>
                <form action={recordSettlement}>
                  <input type="hidden" name="fromUserId" value={p.fromUserId} />
                  <input type="hidden" name="toUserId" value={p.toUserId} />
                  <input type="hidden" name="amount" value={p.amount} />
                  <SubmitButton className="!px-3 !py-2 text-xs">
                    Mark as settled
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Record a custom settlement</h2>
        <form action={recordSettlement} className="space-y-3 rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium">
            From
            <select
              name="fromUserId"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            To
            <select
              name="toUserId"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Amount (€)
            <input
              type="number"
              name="amount"
              required
              min={0.01}
              step="0.01"
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>
          <SubmitButton className="w-full">Record settlement</SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">History</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {settlements.length === 0 && (
            <li className="p-3 text-sm text-gray-400">No settlements recorded yet.</li>
          )}
          {settlements.map((s) => (
            <li key={s.id} className="flex items-center justify-between p-3 text-sm">
              <span>
                {nameById[s.from_user_id]} → {nameById[s.to_user_id]}
              </span>
              <strong>€{s.amount.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
