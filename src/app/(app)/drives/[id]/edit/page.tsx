import { notFound, redirect } from "next/navigation";
import { ensureCurrentAppUser } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";
import { updateDrive } from "../../actions";
import { SubmitButton } from "@/components/ui";

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
      <h1 className="text-xl font-semibold">Edit drive</h1>
      <form action={updateDrive} className="space-y-3 rounded-xl border border-gray-200 p-4">
        <input type="hidden" name="driveId" value={drive.id} />
        <label className="block text-sm font-medium">
          Start km
          <input
            type="number"
            name="startKm"
            required
            min={0}
            step="0.1"
            defaultValue={drive.start_km}
            className="mt-1 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        <label className="block text-sm font-medium">
          End km
          <input
            type="number"
            name="endKm"
            required
            min={0}
            step="0.1"
            defaultValue={drive.end_km}
            className="mt-1 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        <SubmitButton className="w-full">Save changes</SubmitButton>
      </form>
    </div>
  );
}
