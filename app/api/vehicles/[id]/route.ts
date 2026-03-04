import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { UnitRepository } from "@/lib/repositories/units";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { updateVehicleSchema } from "@/lib/schemas/vehicles";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
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
      description: `Updated vehicle ${vehicle.licensePlate}${unitDoc ? ` on unit ${unitDoc.displayId}` : ""}`,
      targetType: "vehicle",
      targetId: vehicle.$id,
      unitId,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: vehicle });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("PATCH /api/vehicles/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
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
      description: `Removed vehicle ${vehicle.licensePlate}${unitDoc ? ` from unit ${unitDoc.displayId}` : ""}`,
      targetType: "vehicle",
      targetId: id,
      unitId,
    });

    return NextResponse.json({ result: { success: true } });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/vehicles/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
