"use client";

import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <h1 className="text-lg font-semibold tracking-tight md:hidden">
          Rusun Harum Tebet
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white relative"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
