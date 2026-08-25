import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { UnitRepository } from "@/lib/repositories/units";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { updateVehicleSchema } from "@/lib/schemas/vehicles";

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateVehicleSchema.parse(payload);

    // Fetch before update to reliably get unitId (Appwrite updateRow omits unmodified relationships)
    const existingVehicle = await VehicleRepository.getById(id);
    const unitId = existingVehicle.unitId;

    const vehicle = await VehicleRepository.update(id, validated);
    const changes = getChanges(existingVehicle, validated);

    const unitDoc = unitId
      ? await UnitRepository.getById(unitId).catch(() => null)
      : null;

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.update",
      description: `Memperbarui kendaraan ${vehicle.licensePlate}${unitDoc ? ` pada unit ${unitDoc.displayId}` : ""}`,
      targetType: "vehicle",
      targetId: vehicle.$id,
      unitId,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: vehicle });
  },
  { role: "admin", label: "PATCH /api/vehicles/[id]" },
);

export const DELETE = withApiHandler<{ id: string }>(
  async (_request, { params, session }) => {
    const { id } = await params;

    const vehicle = await VehicleRepository.getById(id);
    const unitId = vehicle.unitId;

    await VehicleRepository.delete(id);

    const unitDoc = unitId
      ? await UnitRepository.getById(unitId).catch(() => null)
      : null;

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.delete",
      description: `Menghapus kendaraan ${vehicle.licensePlate}${unitDoc ? ` dari unit ${unitDoc.displayId}` : ""}`,
      targetType: "vehicle",
      targetId: id,
      unitId,
    });

    return NextResponse.json({ result: { success: true } });
  },
  { role: "admin", label: "DELETE /api/vehicles/[id]" },
);
