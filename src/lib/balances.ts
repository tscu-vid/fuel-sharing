export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "manager" | "member";
};

export type Drive = {
  id: string;
  user_id: string;
  start_km: number;
  end_km: number | null;
  started_at: string;
  ended_at: string | null;
};

export type Refuel = {
  id: string;
  user_id: string;
  km: number;
  cost: number;
  liters: number | null;
  refueled_at: string;
};

export type Settlement = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
};

export type Balances = {
  /** paid - owed, per user. Positive = is owed money, negative = owes money. */
  net: Record<string, number>;
  /** Minimal list of suggested payments to zero out all balances. */
  suggestedPayments: { fromUserId: string; toUserId: string; amount: number }[];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Splits each refuel's cost across users proportional to the km they drove
 * in the window since the previous refuel (by odometer reading, not time).
 * A refuel with no driving recorded in its window is split equally across
 * all users so the cost is never silently dropped.
 */
export function computeBalances(
  users: AppUser[],
  drives: Drive[],
  refuels: Refuel[],
  settlements: Settlement[]
): Balances {
  const owed: Record<string, number> = {};
  const paid: Record<string, number> = {};
  for (const u of users) {
    owed[u.id] = 0;
    paid[u.id] = 0;
  }

  const endedDrives = drives.filter(
    (d): d is Drive & { end_km: number } => d.end_km != null
  );
  const sortedRefuels = [...refuels].sort((a, b) => a.km - b.km);

  let windowStart = sortedRefuels.length > 0 ? -Infinity : 0;
  // Use 0 as the floor for the very first window instead of -Infinity so a
  // drive's start_km isn't clamped to a nonsensical value.
  windowStart = 0;

  for (const refuel of sortedRefuels) {
    const windowEnd = refuel.km;
    const kmByUser: Record<string, number> = {};
    let totalKm = 0;

    for (const drive of endedDrives) {
      const overlap =
        Math.min(drive.end_km, windowEnd) - Math.max(drive.start_km, windowStart);
      if (overlap > 0) {
        kmByUser[drive.user_id] = (kmByUser[drive.user_id] ?? 0) + overlap;
        totalKm += overlap;
      }
    }

    paid[refuel.user_id] = (paid[refuel.user_id] ?? 0) + refuel.cost;

    if (totalKm > 0) {
      for (const [userId, km] of Object.entries(kmByUser)) {
        owed[userId] = (owed[userId] ?? 0) + (refuel.cost * km) / totalKm;
      }
    } else {
      const share = refuel.cost / users.length;
      for (const u of users) {
        owed[u.id] += share;
      }
    }

    windowStart = windowEnd;
  }

  const net: Record<string, number> = {};
  for (const u of users) {
    net[u.id] = round2(paid[u.id] - owed[u.id]);
  }
  for (const s of settlements) {
    net[s.from_user_id] = round2((net[s.from_user_id] ?? 0) + s.amount);
    net[s.to_user_id] = round2((net[s.to_user_id] ?? 0) - s.amount);
  }

  return { net, suggestedPayments: simplifyDebts(net) };
}

/** Classic greedy largest-creditor/largest-debtor matching (Splitwise-style). */
function simplifyDebts(
  net: Record<string, number>
): { fromUserId: string; toUserId: string; amount: number }[] {
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.005)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.005)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const payments: { fromUserId: string; toUserId: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = round2(Math.min(debtor.amount, creditor.amount));
    if (amount > 0) {
      payments.push({ fromUserId: debtor.id, toUserId: creditor.id, amount });
    }
    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);
    if (debtor.amount <= 0.005) i++;
    if (creditor.amount <= 0.005) j++;
  }
  return payments;
}
