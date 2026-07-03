import { notFound, redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";
import { updateRefuel, deleteRefuel } from "../../actions";
import { SubmitButton, ActionButton, Field, inputClass, cardClass } from "@/components/ui";

export default async function EditRefuelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await ensureCurrentAppUser();

  const { data: refuel } = await supabase.from("refuels").select("*").eq("id", id).maybeSingle();
  if (!refuel) notFound();
  if (refuel.user_id !== user.id && user.role !== "manager") redirect("/refuels");

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <Pencil size={20} className="text-brand-500" /> Edit refuel
      </h1>
      <form action={updateRefuel} className={`space-y-3 ${cardClass}`}>
        <input type="hidden" name="refuelId" value={refuel.id} />
        <Field label="Odometer at refuel (km)">
          <input
            type="number"
            name="km"
            required
            min={0}
            step="0.1"
            defaultValue={refuel.km}
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
            defaultValue={refuel.cost}
            className={inputClass}
          />
        </Field>
        <Field label="Liters (optional)">
          <input
            type="number"
            name="liters"
            min={0.01}
            step="0.01"
            defaultValue={refuel.liters ?? undefined}
            className={inputClass}
          />
        </Field>
        <SubmitButton className="w-full">Save changes</SubmitButton>
      </form>
      <ActionButton
        action={deleteRefuel.bind(null, refuel.id)}
        variant="outline"
        className="w-full !text-red-600"
        confirmMessage="Delete this refuel? This can't be undone."
        redirectTo="/refuels"
      >
        Delete refuel
      </ActionButton>
    </div>
  );
}
