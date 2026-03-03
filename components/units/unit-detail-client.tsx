"use client";

import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResidentPickerDialog } from "@/components/units/resident-picker-dialog";
import { VehicleFormDialog } from "@/components/units/vehicle-form-dialog";
import { useGetUnit } from "@/hooks/api/use-units";
import { useDeleteVehicle } from "@/hooks/api/use-vehicles";
import type { Vehicle } from "@/types";

interface UnitDetailClientProps {
  unitId: string;
}

export function UnitDetailClient({ unitId }: UnitDetailClientProps) {
  const { data: unit, isLoading, isError } = useGetUnit(unitId);
  const deleteVehicleMutation = useDeleteVehicle();

  // Dialog states
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [residentModalOpen, setResidentModalOpen] = useState(false);
  const [residentType, setResidentType] = useState<"owner" | "tenant">("owner");

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading unit details...
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="p-8 text-center text-destructive">
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
      await deleteVehicleMutation.mutateAsync({ id: vehicleId, unitId });
    }
  };

  const handleOpenResidentPicker = (type: "owner" | "tenant") => {
    setResidentType(type);
    setResidentModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/units">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Unit {unit.displayId}
          </h2>
          <Badge
            className="ml-auto capitalize"
            variant={
              unit.occupancyStatus === "vacant"
                ? "destructive"
                : unit.occupancyStatus === "owner_occupied"
                  ? "default"
                  : "secondary"
            }
          >
            {unit.occupancyStatus.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Unit Information
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium">Block</p>
                  <p>{unit.block}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Floor</p>
                  <p>{unit.floor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Unit Type</p>
                  <p className="capitalize">{unit.unitType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">
                    Billing Recipient
                  </p>
                  <p className="capitalize">{unit.billRecipient}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Owner</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenResidentPicker("owner")}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {unit.owner ? (
                <div className="text-sm space-y-2">
                  <p className="font-medium text-base">{unit.owner.fullName}</p>
                  <p className="text-muted-foreground">
                    {unit.owner.phoneNumber}
                  </p>
                  <p className="text-muted-foreground">
                    {unit.owner.email || "No email provided"}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 italic flex items-center justify-between">
                  No owner assigned
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenResidentPicker("owner")}
                  >
                    Assign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenant Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Current Tenant
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenResidentPicker("tenant")}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              {unit.tenant ? (
                <div className="text-sm space-y-2">
                  <p className="font-medium text-base">
                    {unit.tenant.fullName}
                  </p>
                  <p className="text-muted-foreground">
                    {unit.tenant.phoneNumber}
                  </p>
                  <p className="text-muted-foreground">
                    {unit.tenant.email || "No email provided"}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 italic flex items-center justify-between">
                  No active tenant
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenResidentPicker("tenant")}
                  >
                    Assign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registered Vehicles Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                Registered Vehicles
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={handleAddVehicle}
              >
                Add Vehicle
              </Button>
            </CardHeader>
            <CardContent>
              {unit.vehicles && unit.vehicles.length > 0 ? (
                <div className="space-y-4">
                  {unit.vehicles.map((v) => (
                    <div
                      key={v.$id}
                      className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{v.licensePlate}</p>
                        <p className="text-muted-foreground capitalize">
                          {v.vehicleType} • {v.brand || "Unknown Brand"}{" "}
                          {v.color ? `(${v.color})` : ""}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditVehicle(v as Vehicle)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVehicle(v.$id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2 italic">
                  No vehicles registered
                </div>
              )}
            </CardContent>
          </Card>
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
