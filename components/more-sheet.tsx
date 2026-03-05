"use client";

import { Car, Droplet, LogOut, Newspaper, Settings } from "lucide-react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/auth-context";

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    onOpenChange(false);
    await logout();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>More</DrawerTitle>
        </DrawerHeader>
        <nav className="px-2 pb-6">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin/vehicles"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                <Car className="h-5 w-5 text-muted-foreground" />
                Vehicles
              </Link>
            </li>
            <li>
              <Link
                href="/admin/water-usages"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                <Droplet className="h-5 w-5 text-muted-foreground" />
                Water Usages
              </Link>
            </li>
            <li>
              <Link
                href="/admin/news"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                <Newspaper className="h-5 w-5 text-muted-foreground" />
                News & Announcements
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                Settings
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
