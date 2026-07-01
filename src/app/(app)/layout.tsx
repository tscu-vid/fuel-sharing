import { ensureCurrentAppUser } from "@/lib/current-user";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await ensureCurrentAppUser();
  const isManager = user.role === "manager";
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader isManager={isManager} />
      <main className="flex-1 p-4 pb-20">{children}</main>
      <BottomNav isManager={isManager} />
    </div>
  );
}
