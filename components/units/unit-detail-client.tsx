"use client";

import {
  Building2,
  CalendarDays,
  Car,
  ChevronLeft,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResidentPickerDialog } from "@/components/units/resident-picker-dialog";
import { UnitHistorySection } from "@/components/units/unit-history-section";
import { VehicleFormDialog } from "@/components/units/vehicle-form-dialog";
import { useRemoveResident } from "@/hooks/api/use-unit-assignment";
import { useGetUnit } from "@/hooks/api/use-units";
import { useDeleteVehicle } from "@/hooks/api/use-vehicles";
import type { Vehicle } from "@/types";

interface UnitDetailClientProps {
  unitId: string;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "owner_occupied":
    case "dihuni_pemilik":
      return "success";
    case "rented":
    case "disewa":
      return "info";
    case "vacant":
    case "kosong":
      return "destructive";
    default:
      return "default";
  }
}

function translateStatus(status: string) {
  switch (status) {
    case "owner_occupied":
      return "Dihuni Pemilik";
    case "rented":
      return "Disewa";
    case "vacant":
      return "Kosong";
    default:
      return status.replace("_", " ");
  }
}

function translateType(type: string) {
  switch (type) {
    case "residential":
      return "Residensial";
    case "commercial":
      return "Komersial";
    default:
      return type;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function IconButton({
  tooltip,
  variant = "ghost",
  className,
  onClick,
  children,
}: {
  tooltip: string;
  variant?: "ghost" | "outline";
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={`h-8 w-8 transition-colors ${className ?? ""}`}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function UnitDetailClient({ unitId }: UnitDetailClientProps) {
  const { data: unit, isLoading, isError } = useGetUnit(unitId);
  const { mutateAsync: deleteVehicle, isPending: isDeleting } =
    useDeleteVehicle();

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [residentModalOpen, setResidentModalOpen] = useState(false);
  const [residentType, setResidentType] = useState<"owner" | "tenant">("owner");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [removeResidentType, setRemoveResidentType] = useState<
    "owner" | "tenant" | null
  >(null);

  const removeMutation = useRemoveResident();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Memuat detail unit...
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="p-8 text-center text-destructive">
        Gagal memuat detail unit.
      </div>
    );
  }

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setVehicleModalOpen(true);
  };

  const handleEditVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setVehicleModalOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVehicle({ id: deleteTarget, unitId });
      goeyToast.success("Kendaraan berhasil dihapus");
    } catch {
      goeyToast.error("Gagal menghapus kendaraan");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleOpenResidentPicker = (type: "owner" | "tenant") => {
    setResidentType(type);
    setResidentModalOpen(true);
  };

  const billRecipientLabel = unit.ownerId
    ? unit.billRecipient === "owner"
      ? "Pemilik"
      : "Penyewa"
    : "—";

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-5xl mx-auto pb-8">
        {/* ─── Hero Header ─── */}
        <Card className="gap-0 py-0 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="mt-0.5 shrink-0 transition-colors"
                    asChild
                  >
                    <Link href="/admin/units">
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Kembali</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Kembali ke daftar</TooltipContent>
              </Tooltip>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 justify-between">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Unit {unit.displayId}
                  </h1>
                  <StatusBadge variant={getStatusVariant(unit.occupancyStatus)}>
                    {translateStatus(unit.occupancyStatus)}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Blok {unit.block} · Lantai {unit.floor} · No.{" "}
                  {unit.unitNumber}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
                <Building2 className="h-3 w-3" />
                {translateType(unit.unitType)}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
                <CreditCard className="h-3 w-3" />
                Tagihan ke {billRecipientLabel}
              </Badge>
            </div>
          </div>
        </Card>

        {/* ─── People Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-blue-500" />
                Pemilik
              </CardTitle>
              <CardAction>
                <div className="flex gap-1">
                  {unit.owner && (
                    <IconButton
                      tooltip="Lepas pemilik"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRemoveResidentType("owner")}
                    >
                      <UserX className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton
                    tooltip={unit.owner ? "Ganti pemilik" : "Pilih pemilik"}
                    onClick={() => handleOpenResidentPicker("owner")}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              {unit.owner ? (
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-14 bg-blue-100 text-blue-600">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-base">
                      {getInitials(unit.owner.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-lg mt-3">
                    {unit.owner.fullName}
                  </p>

                  <div className="w-full mt-4 rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{unit.owner.phoneNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {unit.owner.email || "Tidak ada email"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full mt-3 flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      KTP
                    </span>
                    <span className="text-xs font-mono">
                      {unit.owner.ktpNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                  <Avatar className="size-14">
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm italic text-muted-foreground">
                    Belum ada pemilik
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenResidentPicker("owner")}
                  >
                    Pilih Pemilik
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenant */}
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-violet-500" />
                Penyewa Saat Ini
              </CardTitle>
              {unit.ownerId && (
                <CardAction>
                  <div className="flex gap-1">
                    {unit.tenant && (
                      <IconButton
                        tooltip="Lepas penyewa"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRemoveResidentType("tenant")}
                      >
                        <UserX className="h-4 w-4" />
                      </IconButton>
                    )}
                    <IconButton
                      tooltip={unit.tenant ? "Ganti penyewa" : "Pilih penyewa"}
                      onClick={() => handleOpenResidentPicker("tenant")}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                  </div>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              {unit.tenant ? (
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-14 bg-violet-100 text-violet-600">
                    <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-base">
                      {getInitials(unit.tenant.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-lg mt-3">
                    {unit.tenant.fullName}
                  </p>

                  <div className="w-full mt-4 rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{unit.tenant.phoneNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {unit.tenant.email || "Tidak ada email"}
                      </span>
                    </div>
                    {(unit.tenant.startDate || unit.tenant.endDate) && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>
                            {unit.tenant.startDate
                              ? new Date(
                                  unit.tenant.startDate,
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                            {" — "}
                            {unit.tenant.endDate
                              ? new Date(
                                  unit.tenant.endDate,
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "∞"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="w-full mt-3 flex items-center justify-between rounded-lg border border-dashed px-3 py-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      KTP
                    </span>
                    <span className="text-xs font-mono">
                      {unit.tenant.ktpNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                  <Avatar className="size-14">
                    <AvatarFallback>
                      <Users className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm italic text-muted-foreground">
                    {unit.ownerId
                      ? "Tidak ada penyewa aktif"
                      : "Pilih pemilik terlebih dahulu"}
                  </p>
                  {unit.ownerId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenResidentPicker("tenant")}
                    >
                      Pilih Penyewa
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Vehicles Section ─── */}
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4 text-blue-500" />
              Kendaraan Terdaftar
              {unit.vehicles && unit.vehicles.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {unit.vehicles.length}
                </Badge>
              )}
            </CardTitle>
            {unit.ownerId && (
              <CardAction>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddVehicle}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Tambah
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Daftarkan kendaraan baru</TooltipContent>
                </Tooltip>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {unit.vehicles && unit.vehicles.length > 0 ? (
              <div className="divide-y">
                {unit.vehicles.map((v) => (
                  <div
                    key={v.$id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group/row rounded-lg -mx-2 px-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="default"
                        className={
                          v.vehicleType === "motorcycle"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }
                      >
                        <AvatarFallback
                          className={
                            v.vehicleType === "motorcycle"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                          }
                        >
                          <Car className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold uppercase tracking-tight text-sm">
                          {v.licensePlate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {v.brand || "Tidak diketahui"}{" "}
                          {v.color ? `(${v.color})` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        tooltip="Edit kendaraan"
                        onClick={() => handleEditVehicle(v as Vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        tooltip="Hapus kendaraan"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(v.$id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                <Avatar size="lg">
                  <AvatarFallback>
                    <Car className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm italic text-muted-foreground">
                  Belum ada kendaraan terdaftar
                </p>
                {unit.ownerId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddVehicle}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Kendaraan
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Pilih pemilik untuk menambah kendaraan
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Activity History ─── */}
        <UnitHistorySection unitId={unitId} />
      </div>

      {/* ─── Dialogs ─── */}
      <VehicleFormDialog
        open={vehicleModalOpen}
        onOpenChange={setVehicleModalOpen}
        unitId={unitId}
        vehicle={selectedVehicle}
      />

      <ResidentPickerDialog
        open={residentModalOpen}
        onOpenChange={setResidentModalOpen}
        unitId={unitId}
        type={residentType}
        currentResidentId={
          residentType === "owner" ? unit.owner?.$id : unit.tenant?.$id
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteVehicle}
        title="Hapus Kendaraan"
        description="Apakah Anda yakin ingin menghapus kendaraan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        variant="destructive"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!removeResidentType}
        onClose={() => setRemoveResidentType(null)}
        onConfirm={async () => {
          if (!removeResidentType) return;
          try {
            await removeMutation.mutateAsync({
              unitId,
              type: removeResidentType,
            });
            goeyToast.success(
              `${removeResidentType === "owner" ? "Pemilik" : "Penyewa"} dihapus dari unit`,
            );
          } catch {
            goeyToast.error(
              `Gagal menghapus ${removeResidentType === "owner" ? "pemilik" : "penyewa"}`,
            );
          } finally {
            setRemoveResidentType(null);
          }
        }}
        title={`Hapus ${removeResidentType === "owner" ? "Pemilik" : "Penyewa"}`}
        description={`Apakah Anda yakin ingin menghapus ${removeResidentType === "owner" ? "pemilik" : "penyewa"} saat ini dari unit ini?`}
        confirmText="Hapus"
        variant="destructive"
        isLoading={removeMutation.isPending}
      />
    </TooltipProvider>
  );
}
