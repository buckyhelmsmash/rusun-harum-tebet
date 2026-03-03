"use client";

import { BarChart3, Building2, Ellipsis, FileText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MoreSheet } from "./more-sheet";

const navItems = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/residents", label: "Residents", icon: Users },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full transition-colors",
                active ? "text-primary" : "text-slate-500 dark:text-slate-400",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-full transition-colors",
            moreOpen ? "text-primary" : "text-slate-500 dark:text-slate-400",
          )}
        >
          <Ellipsis className="h-5 w-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
