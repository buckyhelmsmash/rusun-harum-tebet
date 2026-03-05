import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda | Rusun Harum Tebet",
  description: "Sistem Manajemen Rusun Harum Tebet",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ringkasan Beranda</h1>
      <p className="text-muted-foreground">
        Selamat datang di sistem manajemen Rusun Harum Tebet.
      </p>
    </div>
  );
}
