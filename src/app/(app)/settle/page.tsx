import { HandCoins, ArrowRight, CheckCircle2, History } from "lucide-react";
import {
  getAppUsers,
  getDrives,
  getRefuels,
  getSettlements,
} from "@/lib/data";
import { computeBalances } from "@/lib/balances";
import { recordSettlement } from "./actions";
import { SubmitButton, Field, inputClass, cardClass } from "@/components/ui";

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
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <HandCoins size={22} className="text-brand-500" /> Settle up
      </h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-400">Suggested settlements</h2>
        {suggestedPayments.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={16} /> Everyone is settled up.
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestedPayments.map((p, i) => (
              <li
                key={i}
                className={`flex items-center justify-between gap-3 text-sm ${cardClass}`}
              >
                <span>
                  <span className="flex items-center gap-1.5 font-medium text-ink-900">
                    {nameById[p.fromUserId]}
                    <ArrowRight size={14} className="text-ink-400" />
                    {nameById[p.toUserId]}
                  </span>
                  <strong className="text-brand-500">€{p.amount.toFixed(2)}</strong>
                </span>
                <form action={recordSettlement}>
                  <input type="hidden" name="fromUserId" value={p.fromUserId} />
                  <input type="hidden" name="toUserId" value={p.toUserId} />
                  <input type="hidden" name="amount" value={p.amount} />
                  <SubmitButton className="!px-3 !py-2 text-xs" variant="dark">
                    Mark as settled
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-400">Record a custom settlement</h2>
        <form action={recordSettlement} className={`space-y-3 ${cardClass}`}>
          <Field label="From">
            <select name="fromUserId" required className={inputClass}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="To">
            <select name="toUserId" required className={inputClass}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount (€)">
            <input type="number" name="amount" required min={0.01} step="0.01" className={inputClass} />
          </Field>
          <SubmitButton className="w-full">Record settlement</SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-400">
          <History size={15} /> History
        </h2>
        <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
          {settlements.length === 0 && (
            <li className="p-3.5 text-sm text-ink-400">No settlements recorded yet.</li>
          )}
          {settlements.map((s) => (
            <li key={s.id} className="flex items-center justify-between p-3.5 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-ink-900">
                {nameById[s.from_user_id]}
                <ArrowRight size={14} className="text-ink-400" />
                {nameById[s.to_user_id]}
              </span>
              <strong className="text-brand-500">€{s.amount.toFixed(2)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
