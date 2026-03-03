"use client";

import { ResponsiveFormContainer } from "@/components/responsive-form-container";
import { Button } from "@/components/ui/button";

interface ResidentPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  type: "owner" | "tenant";
  currentResidentId?: string;
}

export function ResidentPickerDialog({
  open,
  onOpenChange,
  unitId,
  type,
  currentResidentId,
}: ResidentPickerDialogProps) {
  // TODO: Implement owner/tenant search and selection using TanStack query
  // after Phase 3 (Residents API) is complete.

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={onOpenChange}
      title={type === "owner" ? "Assign Owner" : "Assign Tenant"}
      description={`Search and select a resident to assign as the ${type} for this unit.`}
    >
      <div className="space-y-4 py-4">
        <div className="text-sm text-muted-foreground italic text-center p-4 border rounded-md">
          Resident search integration is pending Residents API implementation
          (Phase 3).
        </div>
        <div className="flex w-full justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </ResponsiveFormContainer>
  );
}
