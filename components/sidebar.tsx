"use client";

import {
  BarChart3,
  Building2,
  Car,
  FileText,
  LogOut,
  Newspaper,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/residents", label: "Residents", icon: Users },
  { href: "/admin/news", label: "News", icon: Newspaper },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-base sm:text-lg leading-tight truncate">
              Rusun Harum
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 truncate">
              Property Management
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "transition-colors group py-5",
                        active &&
                          "border-l-4 border-primary rounded-l-none relative overflow-hidden",
                      )}
                    >
                      <Link href={item.href}>
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-50 pointer-events-none" />
                        )}
                        <item.icon
                          className={cn(
                            "relative z-10",
                            active
                              ? "text-blue-400"
                              : "text-slate-400 group-hover:text-white",
                          )}
                        />
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-800/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="text-slate-400 hover:text-white group transition-colors mb-2 py-5"
            >
              <Link href="/admin/settings">
                <Settings className="text-slate-400 group-hover:text-white" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-14 hover:bg-white/5 border-0"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold flex-shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden text-left">
                        <span className="text-sm font-medium text-white truncate">
                          {user.name || "Admin"}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || "Admin"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center px-4 py-2">
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
