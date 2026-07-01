import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { getAppUsers } from "@/lib/data";
import { inviteUser } from "./actions";
import { SubmitButton } from "@/components/ui";

export default async function AdminUsersPage() {
  const me = await ensureCurrentAppUser();
  if (me.role !== "manager") redirect("/dashboard");

  const [users, client] = await Promise.all([getAppUsers(), clerkClient()]);
  const { data: invitations } = await client.invitations.getInvitationList({
    status: "pending",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Manage users</h1>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Invite a friend</h2>
        <form action={inviteUser} className="space-y-3 rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium">
            Name
            <input
              type="text"
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-3"
            />
          </label>
          <SubmitButton className="w-full">Send invitation</SubmitButton>
        </form>
      </section>

      {invitations.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-gray-500">Pending invitations</h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {invitations.map((inv) => (
              <li key={inv.id} className="p-3 text-sm text-gray-600">
                {inv.emailAddress}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-500">Users</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-gray-500">{u.email}</p>
              </div>
              {u.role === "manager" && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  manager
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
