import { SidebarNav } from "@/components/shell/SidebarNav";
import { Topbar } from "@/components/shell/Topbar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr]">
        <SidebarNav />
        <main className="min-h-[calc(100vh-3.5rem)] p-2 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
