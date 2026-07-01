import Link from "next/link";
import { ensureCurrentAppUser } from "@/lib/current-user";
import {
  getAppUsers,
  getDrives,
  getRefuels,
  getSettlements,
  getOpenDrive,
} from "@/lib/data";
import { computeBalances } from "@/lib/balances";

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hi {user.name.split(" ")[0]}</h1>

      <section
        className={`rounded-2xl p-5 text-white ${
          myNet >= 0 ? "bg-emerald-600" : "bg-rose-600"
        }`}
      >
        <p className="text-sm opacity-90">
          {myNet >= 0 ? "You're owed" : "You owe"}
        </p>
        <p className="text-3xl font-bold">€{Math.abs(myNet).toFixed(2)}</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {openDrive ? (
          openDrive.user_id === user.id ? (
            <Link
              href="/drives"
              className="col-span-2 rounded-xl bg-blue-600 p-4 text-center font-medium text-white"
            >
              End your drive
            </Link>
          ) : (
            <div className="col-span-2 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-600">
              Drive in progress ({nameById[openDrive.user_id] ?? "someone"})
            </div>
          )
        ) : (
          <Link
            href="/drives"
            className="col-span-2 rounded-xl bg-blue-600 p-4 text-center font-medium text-white"
          >
            Start a drive
          </Link>
        )}
        <Link
          href="/refuels"
          className="rounded-xl bg-gray-900 p-4 text-center text-sm font-medium text-white"
        >
          Log refuel
        </Link>
        <Link
          href="/settle"
          className="rounded-xl border border-gray-300 p-4 text-center text-sm font-medium"
        >
          Settle up
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Balances</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between p-3 text-sm">
              <span>
                {u.name}
                {u.id === user.id ? " (you)" : ""}
              </span>
              <span className={net[u.id] >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {net[u.id] >= 0 ? "+" : ""}€{net[u.id].toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {suggestedPayments.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Suggested settlements</h2>
          <ul className="space-y-2">
            {suggestedPayments.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm"
              >
                <span>
                  {nameById[p.fromUserId]} → {nameById[p.toUserId]}
                </span>
                <strong>€{p.amount.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
