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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateInvoice } from "@/hooks/api/use-invoices";
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

  const [iplFee, setIplFee] = useState(0);
  const [waterFee, setWaterFee] = useState(0);
  const [vehicleFee, setVehicleFee] = useState(0);
  const [arrears, setArrears] = useState(0);
  const [uniqueCode, setUniqueCode] = useState(0);
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");

  useEffect(() => {
    if (invoice) {
      setIplFee(invoice.iplFee);
      setWaterFee(invoice.waterFee);
      setVehicleFee(invoice.vehicleFee);
      setArrears(invoice.arrears);
      setUniqueCode(invoice.uniqueCode);
      setStatus(invoice.status);
    }
  }, [invoice]);

  const totalDue = iplFee + waterFee + vehicleFee + arrears + uniqueCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    try {
      await updateMutation.mutateAsync({
        id: invoice.$id,
        data: {
          iplFee,
          waterFee,
          vehicleFee,
          arrears,
          uniqueCode,
          totalDue,
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
    typeof invoice.unit === "object" ? invoice.unit?.displayId : invoice.unitId;

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iplFee">IPL Fee (Rp)</Label>
              <Input
                id="iplFee"
                type="number"
                value={iplFee}
                onChange={(e) => setIplFee(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterFee">Water Fee (Rp)</Label>
              <Input
                id="waterFee"
                type="number"
                value={waterFee}
                onChange={(e) => setWaterFee(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleFee">Vehicle Fee (Rp)</Label>
              <Input
                id="vehicleFee"
                type="number"
                value={vehicleFee}
                onChange={(e) => setVehicleFee(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrears">Arrears (Rp)</Label>
              <Input
                id="arrears"
                type="number"
                value={arrears}
                onChange={(e) => setArrears(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uniqueCode">Unique Code</Label>
              <Input
                id="uniqueCode"
                type="number"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(Number(e.target.value))}
                min={100}
                max={999}
              />
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
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Total Due
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              Rp {totalDue.toLocaleString("id-ID")}
            </p>
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
