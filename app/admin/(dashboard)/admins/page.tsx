import type { Metadata } from "next";
import { AdminsClient } from "@/components/admins/admins-client";

export const metadata: Metadata = {
  title: "Kelola Admin | Rusun Harum Tebet",
  description: "Manajemen akses admin dan superadmin",
};

export default function AdminsPage() {
  return <AdminsClient />;
}
