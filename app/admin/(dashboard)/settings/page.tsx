import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = {
  title: "Pengaturan | Rusun Harum Tebet",
  description: "Kelola parameter biaya tagihan",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
