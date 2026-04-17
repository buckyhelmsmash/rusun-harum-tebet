import {
  Download,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
  UserMinus,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type BadgeVariant = "success" | "info" | "destructive" | "default" | "warning";

export const TARGET_TYPE_OPTIONS = [
  { value: "all", label: "Semua Modul" },
  { value: "invoice", label: "Tagihan" },
  { value: "water_usage", label: "Penggunaan Air" },
  { value: "settings", label: "Pengaturan" },
  { value: "vehicle", label: "Kendaraan" },
  { value: "owner", label: "Pemilik" },
  { value: "tenant", label: "Penyewa" },
  { value: "unit", label: "Unit" },
  { value: "news", label: "Berita" },
] as const;

export const ACTION_LABELS: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
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
  "invoice.sync": { label: "Disinkronkan", variant: "info" },
  "water_usage.update": { label: "Diperbarui", variant: "info" },
  "water_usage.import": { label: "Diimpor", variant: "success" },
  "settings.update": { label: "Diperbarui", variant: "info" },
  "news.create": { label: "Dibuat", variant: "success" },
  "news.update": { label: "Diperbarui", variant: "info" },
  "news.delete": { label: "Dihapus", variant: "destructive" },
};

const VERB_LABELS: Record<string, string> = {
  create: "Dibuat",
  update: "Diperbarui",
  delete: "Dihapus",
  assign: "Ditugaskan",
  remove: "Dihapus",
  generate: "Dihasilkan",
  sync: "Disinkronkan",
  import: "Diimpor",
};

export const ENTITY_LABEL_MAP: Record<string, string> = {
  invoice: "Tagihan",
  water_usage: "Air",
  unit: "Unit",
  vehicle: "Kendaraan",
  owner: "Pemilik",
  tenant: "Penyewa",
  settings: "Pengaturan",
  news: "Berita",
};

export const FIELD_LABELS: Record<string, string> = {
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
  phoneNumber: "Telepon",
  email: "Email",
  plateNumber: "Plat Nomor",
  brand: "Merek",
  color: "Warna",
  vehicleType: "Jenis",
  publicFacilityRate: "Tarif Sarana Umum",
  guardRate: "Tarif Penjagaan",
  meetingNumber: "Nomor Rapat",
  invoiceNumber: "No. Tagihan",
  title: "Judul",
  isPublished: "Dipublikasi",
  isLeadArticle: "Artikel Utama",
  publishedDate: "Tanggal Terbit",
  labelId: "Label",
};

export const VALUE_LABELS: Record<string, string> = {
  paid: "Lunas",
  unpaid: "Belum Lunas",
  true: "Ya",
  false: "Tidak",
  owner: "Pemilik",
  tenant: "Penyewa",
  car: "Mobil",
  motorcycle: "Motor",
};

export function getActionIcon(action: string): LucideIcon {
  if (action.endsWith(".create")) return Plus;
  if (action.endsWith(".update")) return RefreshCw;
  if (action.endsWith(".delete")) return Trash2;
  if (action.endsWith(".assign")) return UserCheck;
  if (action.endsWith(".remove")) return UserMinus;
  if (action.endsWith(".generate")) return Zap;
  if (action.endsWith(".sync")) return RefreshCw;
  if (action.endsWith(".import")) return Download;
  return FileText;
}

export function getActionBadgeStyle(action: string): string {
  if (action.endsWith(".create"))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (action.endsWith(".update"))
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (action.endsWith(".delete"))
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (action.endsWith(".generate"))
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (action.endsWith(".sync"))
    return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  if (action.endsWith(".import"))
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
  if (action.endsWith(".assign"))
    return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
  if (action.endsWith(".remove"))
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
}

export function getActionIconColor(action: string): string {
  if (action.endsWith(".create"))
    return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
  if (action.endsWith(".update"))
    return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
  if (action.endsWith(".delete"))
    return "text-red-500 bg-red-50 dark:bg-red-900/20";
  if (action.endsWith(".assign"))
    return "text-violet-500 bg-violet-50 dark:bg-violet-900/20";
  if (action.endsWith(".remove"))
    return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
  if (action.endsWith(".generate"))
    return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
  if (action.endsWith(".sync"))
    return "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20";
  if (action.endsWith(".import"))
    return "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
  return "text-slate-500 bg-slate-50 dark:bg-slate-800";
}

export function formatActionLabel(action: string): string {
  const [entity, verb] = action.split(".");
  const entityLabel =
    ENTITY_LABEL_MAP[entity] ??
    entity.charAt(0).toUpperCase() + entity.slice(1);
  const verbLabel =
    VERB_LABELS[verb] ?? verb.charAt(0).toUpperCase() + verb.slice(1);
  return `${entityLabel} ${verbLabel}`;
}

export function formatFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

export function formatChangeValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  const str = String(val);
  return VALUE_LABELS[str] ?? str;
}

export function formatActivityTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}h lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
