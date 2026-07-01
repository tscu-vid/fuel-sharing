import { ensureCurrentAppUser } from "@/lib/current-user";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await ensureCurrentAppUser();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <main className="flex-1 p-4 pb-20">{children}</main>
      <BottomNav isManager={user.role === "manager"} />
    </div>
  );
}
