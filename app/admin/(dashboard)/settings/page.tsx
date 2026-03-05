import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = {
  title: "Settings | Rusun Harum Tebet",
  description: "Manage billing fee parameters",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
