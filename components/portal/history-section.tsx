"use client";

import { History, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface HistoryInvoice {
  $id: string;
  invoiceNumber: string;
  period: string;
  status: "paid" | "unpaid";
  totalDue: number;
  dueDate: string;
  payDate?: string;
}

interface HistorySectionProps {
  accessToken: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${months[Number.parseInt(month) - 1]} ${year}`;
}

export function HistorySection({ accessToken }: HistorySectionProps) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryInvoice[] | null>(null);

  async function handleSubmit() {
    if (pin.length !== 6) {
      setError("Masukkan 6 digit PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, pinCode: pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setHistory(data.history);
      setOpen(false);
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  if (history) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 px-5 py-4 flex items-center gap-3 border-b border-slate-100">
          <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center">
            <History className="size-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Riwayat Tagihan
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {history.length} tagihan ditemukan
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {history.map((inv) => (
            <div
              key={inv.$id}
              className="px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPeriod(inv.period)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {inv.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(inv.totalDue)}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${
                    inv.status === "paid"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  {inv.status === "paid" ? "LUNAS" : "BELUM LUNAS"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
            <History className="size-5 text-slate-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Riwayat Tagihan
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Klik tombol di bawah untuk mengakses
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="size-4" />
              Akses Riwayat
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center">Verifikasi PIN</DialogTitle>
              <DialogDescription className="text-center text-sm">
                Masukkan 6-digit PIN yang dikirim melalui WhatsApp untuk
                mengakses riwayat tagihan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setError("");
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={pin.length !== 6 || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                {loading ? "Memverifikasi..." : "Akses Riwayat"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
