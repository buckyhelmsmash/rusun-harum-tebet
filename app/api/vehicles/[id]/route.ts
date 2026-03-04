import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
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
    const vehicle = await VehicleRepository.update(id, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.update",
      description: `Updated vehicle ${vehicle.licensePlate}`,
      targetType: "vehicle",
      targetId: vehicle.$id,
      unitId:
        typeof vehicle.unit === "string"
          ? vehicle.unit
          : (vehicle.unit?.$id ?? undefined),
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
    const unitId =
      typeof vehicle.unit === "string"
        ? vehicle.unit
        : (vehicle.unit?.$id ?? undefined);

    await VehicleRepository.delete(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.delete",
      description: `Removed vehicle ${vehicle.licensePlate}`,
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
