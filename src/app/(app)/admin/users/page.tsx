import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { ShieldUser, Mail, Users } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { getAppUsers } from "@/lib/data";
import { inviteUser } from "./actions";
import { SubmitButton, Field, inputClass, cardClass } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";

export default async function AdminUsersPage() {
  const me = await ensureCurrentAppUser();
  if (me.role !== "manager") redirect("/dashboard");

  const [users, client] = await Promise.all([getAppUsers(), clerkClient()]);
  const { data: invitations } = await client.invitations.getInvitationList({
    status: "pending",
  });

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <ShieldUser size={22} className="text-brand-500" /> Manage users
      </h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-400">Invite a friend</h2>
        <form action={inviteUser} className={`space-y-3 ${cardClass}`}>
          <Field label="Name">
            <input type="text" name="name" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" required className={inputClass} />
          </Field>
          <SubmitButton className="w-full">Send invitation</SubmitButton>
        </form>
      </section>

      {invitations.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-400">
            <Mail size={15} /> Pending invitations
          </h2>
          <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 p-3.5 text-sm text-ink-400">
                {inv.emailAddress}
                {inv.url && <CopyButton text={inv.url} />}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">
            If the invite email doesn&apos;t arrive, copy the link above and send it directly.
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-400">
          <Users size={15} /> Users
        </h2>
        <ul className={`divide-y divide-ink-50 ${cardClass} !p-0`}>
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between p-3.5 text-sm">
              <div>
                <p className="font-semibold text-ink-900">{u.name}</p>
                <p className="text-ink-400">{u.email}</p>
              </div>
              {u.role === "manager" && (
                <span className="rounded-full bg-gold-100 px-2 py-1 text-xs font-semibold text-gold-600">
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
