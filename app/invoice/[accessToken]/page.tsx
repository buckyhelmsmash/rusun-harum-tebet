"use client";

import { Building2, Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { HistorySection } from "@/components/portal/history-section";
import { PaymentInstructions } from "@/components/portal/payment-instructions";

interface PortalInvoice {
  $id: string;
  invoiceNumber: string;
  period: string;
  status: "paid" | "unpaid";
  dueDate: string;
  waterFee: number;
  publicFacilityFee: number;
  guardFee: number;
  vehicleFee: number;
  arrears: number;
  arrearsBreakdown?: string;
  uniqueCode: number;
  totalDue: number;
  payDate?: string;
  unit?: {
    displayId: string;
    block: string;
    floor: number;
    owner?: { fullName: string };
    tenant?: { fullName: string };
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateRange(period: string) {
  const [year, month] = period.split("-");
  const monthNum = Number.parseInt(month);
  const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `25 ${months[prevMonth - 1]} - 25 ${months[monthNum - 1]} ${year}`;
}

export default function ResidentInvoicePortal({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = use(params);
  const [invoice, setInvoice] = useState<PortalInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/portal/invoice/${accessToken}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Tagihan tidak ditemukan");
          return;
        }

        setInvoice(data);
      } catch {
        setError("Gagal terhubung ke server");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            {error || "Tagihan tidak ditemukan"}
          </h1>
          <p className="text-sm text-slate-500">
            Pastikan tautan Anda benar atau hubungi pengelola.
          </p>
        </div>
      </div>
    );
  }

  const residentName =
    invoice.unit?.tenant?.fullName ||
    invoice.unit?.owner?.fullName ||
    "Penghuni";

  const breakdownItems = [
    {
      label: "IPL (Iuran Pemeliharaan)",
      value: invoice.publicFacilityFee + invoice.guardFee,
    },
    { label: "Biaya Air (PDAM)", value: invoice.waterFee },
    { label: "Biaya Kendaraan", value: invoice.vehicleFee },
    { label: "Sarana Umum", value: invoice.publicFacilityFee },
    { label: "Penjagaan Fasilitas", value: invoice.guardFee },
    {
      label: "Tunggakan",
      value: invoice.arrears,
      isNegative: invoice.arrears > 0,
    },
  ].filter((item) => {
    // Hide Sarana Umum & Penjagaan Fasilitas if they are 0 (or just show the combined IPL if preferred)
    // Actually the design shows both IPL (which is the sum) and the individual items.
    // Wait, the prompt image shows IPL, Air, Kendaraan, Tunggakan, Sarana Umum, Penjagaan Fasilitas.
    // Let's match the image exactly:
    if (item.label === "IPL (Iuran Pemeliharaan)" && item.value === 0)
      return false;
    if (item.label === "Sarana Umum" && item.value === 0) return false;
    if (item.label === "Penjagaan Fasilitas" && item.value === 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col shadow-xl relative">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Iuran Pengelolaan PPPSRS
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              {formatDateRange(invoice.period)}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Unit + Resident Info */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-5 flex items-center gap-4 shadow-sm">
            <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Building2 className="size-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate">
                Rusun Harum Tebet
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-900 font-semibold text-[13px]">
                  {residentName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-[13px] font-medium">
                  Unit {invoice.unit?.displayId}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    invoice.status === "paid"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  {invoice.status === "paid" ? "✓ LUNAS" : "⏳ BELUM LUNAS"}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-blue-50/50 px-5 py-4 flex items-center justify-between border-b border-slate-100">
              <span className="text-blue-600 font-bold text-[13px] uppercase tracking-wider">
                Rincian Biaya
              </span>
            </div>

            <div className="p-5 space-y-4">
              {breakdownItems.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span
                    className={`font-semibold ${item.isNegative ? "text-rose-500" : "text-slate-900"}`}
                  >
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}

              {/* Unique Code */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <span className="text-slate-400 text-[11px] font-medium italic">
                  Kode Unik
                </span>
                <span className="text-blue-600 font-bold text-xs">
                  + {formatCurrency(invoice.uniqueCode)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="px-5 py-6 flex justify-between items-center bg-slate-50/50">
              <span className="text-slate-900 font-bold text-base">
                Total Keseluruhan
              </span>
              <span className="text-2xl font-black text-blue-600">
                {formatCurrency(invoice.totalDue)}
              </span>
            </div>
          </div>

          {/* Payment Instructions */}
          {invoice.status === "unpaid" && <PaymentInstructions />}

          {/* History Section */}
          <HistorySection accessToken={accessToken} />

          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}
