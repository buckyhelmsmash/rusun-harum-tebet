import { AdminGuard } from "@/components/admin-guard";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <Sidebar />
        <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white dark:bg-slate-950">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </SidebarProvider>
    </AdminGuard>
  );
}
