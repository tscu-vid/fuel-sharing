import Link from "next/link";
import { Car, Fuel, HandCoins, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import {
  getAppUsers,
  getDrives,
  getRefuels,
  getSettlements,
  getOpenDrive,
} from "@/lib/data";
import { computeBalances } from "@/lib/balances";
import { cardClass } from "@/components/ui";

export default async function DashboardPage() {
  const user = await ensureCurrentAppUser();
  const [users, drives, refuels, settlements, openDrive] = await Promise.all([
    getAppUsers(),
    getDrives(),
    getRefuels(),
    getSettlements(),
    getOpenDrive(),
  ]);

  const { net, suggestedPayments } = computeBalances(users, drives, refuels, settlements);
  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));
  const myNet = net[user.id] ?? 0;
  const isOwed = myNet >= 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Hi {user.name.split(" ")[0]}</h1>

      <section className="relative overflow-hidden rounded-2xl bg-ink-900 p-5 text-white shadow-lg shadow-ink-900/10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-gold-400 to-brand-500" />
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-white/70">
              {isOwed ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isOwed ? "You're owed" : "You owe"}
            </p>
            <p
              className={`text-4xl font-extrabold ${isOwed ? "text-white" : "text-brand-400"}`}
            >
              €{Math.abs(myNet).toFixed(2)}
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Car size={24} className="text-gold-400" />
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {openDrive ? (
          openDrive.user_id === user.id ? (
            <Link
              href="/drives"
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-brand-500 p-4 text-center font-semibold text-white shadow-sm shadow-brand-700/20"
            >
              <Car size={18} /> End your drive
            </Link>
          ) : (
            <div className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-ink-50 p-4 text-center text-sm text-ink-400">
              <Car size={16} /> Drive in progress ({nameById[openDrive.user_id] ?? "someone"})
            </div>
          )
        ) : (
          <Link
            href="/drives"
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-brand-500 p-4 text-center font-semibold text-white shadow-sm shadow-brand-700/20"
          >
            <Car size={18} /> Start a drive
          </Link>
        )}
        <Link
          href="/refuels"
          className="flex items-center justify-center gap-2 rounded-xl bg-ink-900 p-4 text-center text-sm font-semibold text-white"
        >
          <Fuel size={16} /> Log refuel
        </Link>
        <Link
          href="/settle"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-100 bg-white p-4 text-center text-sm font-semibold text-ink-900"
        >
          <HandCoins size={16} /> Settle up
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-400">Balances</h2>
        <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-medium text-ink-900">
                {u.name}
                {u.id === user.id && <span className="text-ink-400"> (you)</span>}
              </span>
              <span
                className={`font-semibold ${net[u.id] >= 0 ? "text-emerald-600" : "text-brand-500"}`}
              >
                {net[u.id] >= 0 ? "+" : ""}€{net[u.id].toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {suggestedPayments.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink-400">Suggested settlements</h2>
          <ul className="space-y-2">
            {suggestedPayments.map((p, i) => (
              <li
                key={i}
                className={`flex items-center justify-between text-sm ${cardClass}`}
              >
                <span className="flex items-center gap-1.5 font-medium text-ink-900">
                  {nameById[p.fromUserId]}
                  <ArrowRight size={14} className="text-ink-400" />
                  {nameById[p.toUserId]}
                </span>
                <strong className="text-brand-500">€{p.amount.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
