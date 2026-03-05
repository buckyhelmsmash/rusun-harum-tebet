"use client";

import { Loader2 } from "lucide-react";
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
import { account } from "@/lib/appwrite/client";
import type { WaterUsage } from "@/lib/schemas/water-usages";
import { formatPeriodRange } from "@/lib/utils/period";

const WATER_RATE_PER_M3 = 12_500;

interface WaterUsageEditDialogProps {
  usage: WaterUsage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function getUnitLabel(unit: WaterUsage["unit"]): string {
  if (typeof unit === "string") return unit;
  return unit?.displayId || "—";
}

export function WaterUsageEditDialog({
  usage,
  open,
  onOpenChange,
  onSuccess,
}: WaterUsageEditDialogProps) {
  const [previousMeter, setPreviousMeter] = useState(0);
  const [currentMeter, setCurrentMeter] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && usage) {
      setPreviousMeter(usage.previousMeter);
      setCurrentMeter(usage.currentMeter);
    }
  }, [open, usage]);

  const liveUsage = Math.max(0, currentMeter - previousMeter);
  const liveAmount = liveUsage * WATER_RATE_PER_M3;
  const isValid = currentMeter >= previousMeter;

  const handleSave = async () => {
    if (!usage || !isValid) return;

    setIsSaving(true);
    try {
      const session = await account.createJWT();
      const res = await fetch(`/api/water-usages/${usage.$id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ previousMeter, currentMeter }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }

      goeyToast.success("Water usage updated");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      goeyToast.error("Failed to update", {
        description: (error as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!usage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Water Usage</DialogTitle>
          <DialogDescription>
            {getUnitLabel(usage.unit)} · {formatPeriodRange(usage.period)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prev-meter">Previous Meter</Label>
              <Input
                id="edit-prev-meter"
                type="number"
                min={0}
                value={previousMeter}
                onChange={(e) => setPreviousMeter(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-curr-meter">Current Meter</Label>
              <Input
                id="edit-curr-meter"
                type="number"
                min={0}
                value={currentMeter}
                onChange={(e) => setCurrentMeter(Number(e.target.value))}
              />
            </div>
          </div>

          {!isValid && (
            <p className="text-sm text-rose-600">
              Current meter cannot be less than previous meter.
            </p>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Usage</span>
              <p className="font-semibold text-emerald-600">
                {liveUsage.toLocaleString()} m³
              </p>
            </div>
            <div>
              <span className="text-slate-500">Amount</span>
              <p className="font-semibold text-slate-900 dark:text-white">
                Rp {liveAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
