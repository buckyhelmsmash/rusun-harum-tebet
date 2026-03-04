import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { vehicleListParamsSchema } from "@/lib/schemas/vehicles";

export async function GET(request: Request) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const params = vehicleListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await VehicleRepository.list(params);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("GET /api/vehicles -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
