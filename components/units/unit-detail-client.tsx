"use client";

import {
  Car,
  ChevronLeft,
  Info,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DetailCard, DetailCardHeader } from "@/components/ui/detail-card";
import { goeyToast } from "@/components/ui/goey-toaster";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResidentPickerDialog } from "@/components/units/resident-picker-dialog";
import { VehicleFormDialog } from "@/components/units/vehicle-form-dialog";
import { useGetUnit } from "@/hooks/api/use-units";
import { useDeleteVehicle } from "@/hooks/api/use-vehicles";
import type { Vehicle } from "@/types";

interface UnitDetailClientProps {
  unitId: string;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "owner_occupied":
      return "success";
    case "rented":
      return "info";
    case "vacant":
      return "destructive";
    default:
      return "default";
  }
}

function VehicleIcon({ type }: { type: string }) {
  if (type === "motorcycle") {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 p-2 rounded-lg">
        <Car className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-2 rounded-lg">
      <Car className="h-5 w-5" />
    </div>
  );
}

export function UnitDetailClient({ unitId }: UnitDetailClientProps) {
  const { data: unit, isLoading, isError } = useGetUnit(unitId);
  const deleteVehicleMutation = useDeleteVehicle();

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [residentModalOpen, setResidentModalOpen] = useState(false);
  const [residentType, setResidentType] = useState<"owner" | "tenant">("owner");

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading unit details...
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        Failed to load unit details.
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

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Are you sure you want to remove this vehicle?")) {
      try {
        await deleteVehicleMutation.mutateAsync({ id: vehicleId, unitId });
        goeyToast.success("Vehicle removed successfully");
      } catch {
        goeyToast.error("Failed to remove vehicle");
      }
    }
  };

  const handleOpenResidentPicker = (type: "owner" | "tenant") => {
    setResidentType(type);
    setResidentModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 shadow-sm"
              asChild
            >
              <Link href="/admin/units">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Unit {unit.displayId}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Block {unit.block}, Floor {unit.floor}, Unit {unit.unitNumber} •{" "}
                <span className="capitalize">{unit.unitType} Unit</span>
              </p>
            </div>
          </div>
          <StatusBadge variant={getStatusVariant(unit.occupancyStatus)}>
            {unit.occupancyStatus.replace("_", " ")}
          </StatusBadge>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 — Unit Information */}
          <DetailCard>
            <DetailCardHeader
              icon={<Info className="h-4 w-4" />}
              title="Unit Information"
            />
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Block
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {unit.block}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Floor
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {unit.floor}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Unit Type
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                  {unit.unitType}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Billing Recipient
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                  {unit.billRecipient}
                </p>
              </div>
            </div>
          </DetailCard>

          {/* Card 2 — Owner */}
          <DetailCard>
            <DetailCardHeader
              icon={<User className="h-4 w-4" />}
              title="Owner"
              action={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-700"
                  onClick={() => handleOpenResidentPicker("owner")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            {unit.owner ? (
              <div className="p-6 flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {unit.owner.fullName}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    {unit.owner.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {unit.owner.email || "No email provided"}
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      KTP Number
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {unit.owner.ktpNumber}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-300" />
                </div>
                <p className="italic text-slate-500 dark:text-slate-400">
                  No owner assigned to this unit
                </p>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleOpenResidentPicker("owner")}
                >
                  Assign Owner
                </Button>
              </div>
            )}
          </DetailCard>

          {/* Card 3 — Current Tenant */}
          <DetailCard>
            <DetailCardHeader
              icon={<Users className="h-4 w-4" />}
              title="Current Tenant"
              action={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-700"
                  onClick={() => handleOpenResidentPicker("tenant")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            {unit.tenant ? (
              <div className="p-6 flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {unit.tenant.fullName}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    {unit.tenant.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {unit.tenant.email || "No email provided"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-slate-300" />
                </div>
                <p className="italic text-slate-500 dark:text-slate-400">
                  No active tenant registered for this unit
                </p>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleOpenResidentPicker("tenant")}
                >
                  Assign Tenant
                </Button>
              </div>
            )}
          </DetailCard>

          {/* Card 4 — Registered Vehicles */}
          <DetailCard>
            <DetailCardHeader
              icon={<Car className="h-4 w-4" />}
              title="Registered Vehicles"
              action={
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1"
                  onClick={handleAddVehicle}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Vehicle
                </button>
              }
            />
            {unit.vehicles && unit.vehicles.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {unit.vehicles.map((v) => (
                  <div
                    key={v.$id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <VehicleIcon type={v.vehicleType} />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                          {v.licensePlate}
                        </p>
                        <p className="text-xs text-slate-500">
                          {v.brand || "Unknown"} {v.color ? `(${v.color})` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        onClick={() => handleEditVehicle(v as Vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteVehicle(v.$id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-slate-300" />
                </div>
                <p className="italic text-slate-500 dark:text-slate-400">
                  No vehicles registered for this unit
                </p>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={handleAddVehicle}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Vehicle
                </Button>
              </div>
            )}
          </DetailCard>
        </div>
      </div>

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
    </>
  );
}
