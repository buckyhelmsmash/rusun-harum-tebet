"use client";

import { Search, User } from "lucide-react";
import { useState } from "react";
import { ResponsiveFormContainer } from "@/components/shared/responsive-form-container";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Input } from "@/components/ui/input";
import { useGetOwners } from "@/hooks/api/use-owners";
import { useGetTenants } from "@/hooks/api/use-tenants";
import { useAssignResident } from "@/hooks/api/use-unit-assignment";
import type { Owner, Tenant } from "@/types";

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
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const assignMutation = useAssignResident();

  const { data: ownersData, isLoading: ownersLoading } = useGetOwners(
    { search: search || undefined, limit: 20 },
    { enabled: type === "owner" },
  );
  const { data: tenantsData, isLoading: tenantsLoading } = useGetTenants(
    { search: search || undefined, limit: 20 },
    { enabled: type === "tenant" },
  );

  const residents: (Owner | Tenant)[] =
    type === "owner" ? (ownersData?.items ?? []) : (tenantsData?.items ?? []);

  const isListLoading = type === "owner" ? ownersLoading : tenantsLoading;

  const handleAssign = async () => {
    if (!selectedId) return;
    try {
      await assignMutation.mutateAsync({
        unitId,
        type,
        residentId: selectedId,
        ...(type === "tenant" && {
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });
      goeyToast.success(
        `${type === "owner" ? "Pemilik" : "Penyewa"} berhasil ditetapkan`,
      );
      resetAndClose();
    } catch (error) {
      goeyToast.error("Gagal memilih penghuni.", {
        description: (error as Error).message,
      });
    }
  };

  const resetAndClose = () => {
    setSearch("");
    setSelectedId(null);
    setStartDate("");
    setEndDate("");
    onOpenChange(false);
  };

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={(val) => {
        if (!val) resetAndClose();
        else onOpenChange(val);
      }}
      title={type === "owner" ? "Pilih Pemilik" : "Pilih Penyewa"}
      description={`Cari dan pilih penghuni untuk ditetapkan sebagai ${type === "owner" ? "pemilik" : "penyewa"} untuk unit ini.`}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={`Cari ${type === "owner" ? "pemilik" : "penyewa"} berdasarkan nama atau KTP...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto border rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
          {isListLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Memuat...
            </div>
          ) : residents.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              {search
                ? `Tidak ada ${type === "owner" ? "pemilik" : "penyewa"} yang sesuai dengan "${search}"`
                : `Belum ada ${type === "owner" ? "pemilik" : "penyewa"} yang terdaftar`}
            </div>
          ) : (
            residents.map((r) => {
              const isSelected = selectedId === r.$id;
              const isCurrent = r.$id === currentResidentId;
              return (
                <button
                  key={r.$id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setSelectedId(isSelected ? null : r.$id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    isCurrent
                      ? "bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed"
                      : isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-500"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {r.fullName}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-normal text-emerald-600">
                          (saat ini)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      KTP: {r.ktpNumber} • {r.phoneNumber}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        role="img"
                        aria-label="Selected"
                      >
                        <title>Selected</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Lease dates for tenant assignment */}
        {type === "tenant" && selectedId && (
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Tanggal Mulai Sewa</FieldLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>
                  Tanggal Selesai Sewa{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (opsional)
                  </span>
                </FieldLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
        )}

        {/* Actions */}
        <div className="flex w-full justify-end gap-2 pt-2">
          <Button variant="outline" onClick={resetAndClose}>
            Batal
          </Button>
          <Button
            disabled={!selectedId || assignMutation.isPending}
            onClick={handleAssign}
          >
            {assignMutation.isPending
              ? "Menetapkan..."
              : `Pilih ${type === "owner" ? "Pemilik" : "Penyewa"}`}
          </Button>
        </div>
      </div>
    </ResponsiveFormContainer>
  );
}
