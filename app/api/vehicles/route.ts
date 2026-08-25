import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { UnitRepository } from "@/lib/repositories/units";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { createVehicleSchema } from "@/lib/schemas/vehicles";

export const POST = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createVehicleSchema.parse(payload);

    // Ensure the unit has an owner before allowing vehicle registration
    const unit = await UnitRepository.getById(validated.unit);
    if (!unit.ownerId) {
      return NextResponse.json(
        {
          error:
            "Cannot register a vehicle for a unit without an owner. Assign an owner first.",
        },
        { status: 400 },
      );
    }

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

    if (validated.vehicleType === "car") {
      const carCount = await VehicleRepository.countCarsByUnit(validated.unit);
      if (carCount >= 3) {
        return NextResponse.json(
          { error: "Maximum 3 cars allowed per unit." },
          { status: 400 },
        );
      }
    }

    const vehicle = await VehicleRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "vehicle.create",
      description: `Menambahkan kendaraan ${validated.licensePlate} ke unit ${unit.displayId}`,
      targetType: "vehicle",
      targetId: vehicle.$id,
      unitId: validated.unit,
      metadata: {
        licensePlate: validated.licensePlate,
        vehicleType: validated.vehicleType,
      },
    });

    return NextResponse.json({ result: vehicle });
  },
  { role: "admin", label: "POST /api/vehicles" },
);
