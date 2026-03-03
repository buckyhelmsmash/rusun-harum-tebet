"use client";

import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-3" />
        <div className="flex items-center md:hidden">
          <span className="font-bold text-lg tracking-tight">Rusun Harum</span>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 bg-red-500 transform translate-x-1/4 -translate-y-1/4" />
        </button>
      </div>
    </header>
  );
}
