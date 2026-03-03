import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { createVehicleSchema } from "@/lib/schemas/vehicles";

export async function POST(request: Request) {
  try {
    await verifyAuth(request);
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createVehicleSchema.parse(payload);
    const vehicle = await VehicleRepository.create(validated);
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
