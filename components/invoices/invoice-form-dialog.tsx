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
      goeyToast.success("Invoice updated successfully");
      onOpenChange(false);
    } catch (error) {
      goeyToast.error("Failed to update invoice", {
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
    { label: "Public Facility Fee", value: invoice.publicFacilityFee || 0 },
    { label: "Security Guard Fee", value: invoice.guardFee || 0 },
    { label: "Water Fee", value: invoice.waterFee },
    { label: "Vehicle Fee", value: invoice.vehicleFee },
    { label: "Arrears", value: invoice.arrears },
    { label: "Unique Code", value: invoice.uniqueCode },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Unit {unitDisplay} — Period {invoice.period}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Fee Breakdown
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
              <span className="font-semibold">Total Due</span>
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
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
