"use client";

import { Clock } from "lucide-react";
import { DetailCard, DetailCardHeader } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetActivity } from "@/hooks/api/use-activity";

type BadgeVariant = "success" | "info" | "destructive" | "default" | "warning";

const ACTION_LABELS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    "vehicle.create": { label: "Ditambahkan", variant: "success" },
    "vehicle.update": { label: "Diperbarui", variant: "info" },
    "vehicle.delete": { label: "Dihapus", variant: "destructive" },
    "unit.update": { label: "Diperbarui", variant: "info" },
    "owner.create": { label: "Dibuat", variant: "success" },
    "owner.update": { label: "Diperbarui", variant: "info" },
    "owner.delete": { label: "Dihapus", variant: "destructive" },
    "owner.assign": { label: "Ditetapkan", variant: "success" },
    "owner.remove": { label: "Dihapus", variant: "destructive" },
    "tenant.create": { label: "Dibuat", variant: "success" },
    "tenant.update": { label: "Diperbarui", variant: "info" },
    "tenant.delete": { label: "Dihapus", variant: "destructive" },
    "tenant.assign": { label: "Ditetapkan", variant: "success" },
    "tenant.remove": { label: "Dihapus", variant: "destructive" },
    "invoice.create": { label: "Dibuat", variant: "success" },
    "invoice.update": { label: "Diperbarui", variant: "info" },
    "invoice.generate": { label: "Dihasilkan", variant: "warning" },
    "water_usage.update": { label: "Diperbarui", variant: "info" },
    "water_usage.import": { label: "Diimpor", variant: "success" },
    "settings.update": { label: "Diperbarui", variant: "info" },
    "news.create": { label: "Dibuat", variant: "success" },
    "news.update": { label: "Diperbarui", variant: "info" },
    "news.delete": { label: "Dihapus", variant: "destructive" },
  };

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  waterFee: "Biaya Air",
  waterRate: "Tarif Air",
  publicFacilityFee: "Sarana Umum",
  guardFee: "Penjagaan Fasilitas",
  vehicleFee: "Biaya Kendaraan",
  iplFee: "IPL",
  arrears: "Tunggakan",
  totalDue: "Total Tagihan",
  previousMeter: "Meteran Awal",
  currentMeter: "Meteran Akhir",
  usage: "Pemakaian",
  amount: "Jumlah",
  period: "Periode",
  isBilled: "Tertagih",
  paymentDate: "Tanggal Bayar",
  billRecipient: "Penerima Tagihan",
  uniqueCode: "Kode Unik",
  fullName: "Nama Lengkap",
  phone: "Telepon",
  email: "Email",
  plateNumber: "Plat Nomor",
  brand: "Merek",
  color: "Warna",
  vehicleType: "Jenis",
  publicFacilityRate: "Tarif Sarana Umum",
  guardRate: "Tarif Penjagaan",
  meetingNumber: "Nomor Rapat",
  invoiceNumber: "No. Tagihan",
};

const VALUE_LABELS: Record<string, string> = {
  paid: "Lunas",
  unpaid: "Belum Lunas",
  true: "Ya",
  false: "Tidak",
  owner: "Pemilik",
  tenant: "Penyewa",
  car: "Mobil",
  motorcycle: "Motor",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}h yang lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

interface ActivitySectionProps {
  unitId: string;
}

export function ActivitySection({ unitId }: ActivitySectionProps) {
  const { data, isLoading } = useGetActivity({
    unitId,
    limit: 5,
  });

  const logs = data?.items ?? [];

  return (
    <DetailCard>
      <DetailCardHeader
        title="Aktivitas Terbaru"
        icon={<Clock className="h-5 w-5" />}
      />

      {isLoading ? (
        <div className="p-6 text-center text-sm text-slate-400">
          Memuat aktivitas...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-400 italic">
          Belum ada aktivitas yang dicatat
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => {
            const actionInfo = ACTION_LABELS[log.action] ?? {
              label: log.action,
              variant: "default",
            };

            let changes: Array<{ field: string; old: unknown; new: unknown }> =
              [];
            if (log.metadata) {
              try {
                // Handle both pre-parsed and JSON string formats
                const parsedMetadata =
                  typeof log.metadata === "string"
                    ? JSON.parse(log.metadata)
                    : log.metadata;

                if (Array.isArray(parsedMetadata?.changes)) {
                  changes = parsedMetadata.changes;
                }
              } catch (e) {
                console.error("Failed to parse activity metadata:", e);
              }
            }

            return (
              <div
                key={log.$id}
                className="px-6 py-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {log.description}
                  </p>

                  {changes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {changes.map((change) => (
                        <div
                          key={change.field}
                          className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">
                            {FIELD_LABELS[change.field] ?? change.field}:
                          </span>
                          <span className="line-through opacity-70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1 rounded mr-1">
                            {VALUE_LABELS[String(change.old ?? "null")] ??
                              String(change.old ?? "—")}
                          </span>
                          <span className="opacity-90 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1 rounded">
                            {VALUE_LABELS[String(change.new ?? "null")] ??
                              String(change.new ?? "—")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-1">
                    oleh {log.actorName} · {formatRelativeTime(log.$createdAt)}
                  </p>
                </div>
                <StatusBadge variant={actionInfo.variant}>
                  {actionInfo.label}
                </StatusBadge>
              </div>
            );
          })}
        </div>
      )}
    </DetailCard>
  );
}
