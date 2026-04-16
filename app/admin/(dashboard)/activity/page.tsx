import { Suspense } from "react";
import { ActivityClient } from "@/components/activity/activity-client";

export const metadata = {
  title: "Aktivitas — Rusun Harum Tebet",
  description: "Riwayat aktivitas dan perubahan data oleh admin.",
};

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityClient />
    </Suspense>
  );
}
