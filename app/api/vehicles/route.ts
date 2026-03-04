import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { createVehicleSchema } from "@/lib/schemas/vehicles";

export async function POST(request: Request) {
  try {
    const session = await verifyAuth(request);
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createVehicleSchema.parse(payload);

    // Check for existing vehicle with same license plate
    const existingVehicle = await VehicleRepository.getByLicensePlate(
      validated.licensePlate,
    );
    if (existingVehicle) {
      return NextResponse.json(
        {
          error: `License plate ${validated.licensePlate} is already registered.`,
        },
        { status: 409 },
      );
    }

    const vehicle = await VehicleRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.create",
      description: `Added vehicle ${validated.licensePlate}`,
      targetType: "vehicle",
      targetId: vehicle.$id,
      unitId: validated.unit,
      metadata: {
        licensePlate: validated.licensePlate,
        vehicleType: validated.vehicleType,
      },
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
    console.error("POST /api/vehicles -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
