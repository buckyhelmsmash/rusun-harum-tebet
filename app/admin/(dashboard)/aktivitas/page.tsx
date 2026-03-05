import { Suspense } from "react";
import { AktivitasClient } from "@/components/aktivitas/aktivitas-client";

export const metadata = {
  title: "Aktivitas — Rusun Harum Tebet",
  description: "Riwayat aktivitas dan perubahan data oleh admin.",
};

export default function AktivitasPage() {
  return (
    <Suspense>
      <AktivitasClient />
    </Suspense>
  );
}
