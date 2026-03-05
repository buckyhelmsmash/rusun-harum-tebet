"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateInvoice } from "@/hooks/api/use-invoices";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/types";

interface InvoiceFormDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceFormDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceFormDialogProps) {
  const updateMutation = useUpdateInvoice();
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");

  useEffect(() => {
    if (invoice) {
      setStatus(invoice.status);
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      await updateMutation.mutateAsync({
        id: invoice.$id,
        data: {
          status,
          payDate: status === "paid" ? new Date().toISOString() : undefined,
        },
      });
      goeyToast.success("Tagihan berhasil diperbarui");
      onOpenChange(false);
    } catch (error) {
      goeyToast.error("Gagal memperbarui tagihan", {
        description: (error as Error).message,
      });
    }
  };

  if (!invoice) return null;

  const unitDisplay =
    typeof invoice.unit === "object" && invoice.unit
      ? ((invoice.unit as { displayId?: string }).displayId ?? invoice.unitId)
      : invoice.unitId;

  const feeBreakdown = [
    { label: "Biaya Sarana Umum", value: invoice.publicFacilityFee || 0 },
    { label: "Biaya Penjagaan Fasilitas", value: invoice.guardFee || 0 },
    { label: "Biaya Air", value: invoice.waterFee },
    { label: "Biaya Kendaraan", value: invoice.vehicleFee },
    { label: "Tunggakan", value: invoice.arrears },
    { label: "Kode Unik", value: invoice.uniqueCode },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Tagihan</DialogTitle>
          <DialogDescription>
            Unit {unitDisplay} — Periode {invoice.period}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rincian Biaya
            </p>
            {feeBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold">Total Tagihan</span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(invoice.totalDue)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as "paid" | "unpaid")}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Belum Lunas</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
