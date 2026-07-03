import { notFound, redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";
import { updateDrive, deleteDrive } from "../../actions";
import { SubmitButton, ActionButton, Field, inputClass, cardClass } from "@/components/ui";

export default async function EditDrivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await ensureCurrentAppUser();

  const { data: drive } = await supabase.from("drives").select("*").eq("id", id).maybeSingle();
  if (!drive) notFound();
  if (drive.end_km == null) redirect("/drives");
  if (drive.user_id !== user.id && user.role !== "manager") redirect("/drives");

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <Pencil size={20} className="text-brand-500" /> Edit drive
      </h1>
      <form action={updateDrive} className={`space-y-3 ${cardClass}`}>
        <input type="hidden" name="driveId" value={drive.id} />
        <Field label="Start km">
          <input
            type="number"
            name="startKm"
            required
            min={0}
            step="0.1"
            defaultValue={drive.start_km}
            className={inputClass}
          />
        </Field>
        <Field label="End km">
          <input
            type="number"
            name="endKm"
            required
            min={0}
            step="0.1"
            defaultValue={drive.end_km}
            className={inputClass}
          />
        </Field>
        <SubmitButton className="w-full">Save changes</SubmitButton>
      </form>
      <ActionButton
        action={deleteDrive.bind(null, drive.id)}
        variant="outline"
        className="w-full !text-red-600"
        confirmMessage="Delete this drive? This can't be undone."
        redirectTo="/drives"
      >
        Delete drive
      </ActionButton>
    </div>
  );
}
