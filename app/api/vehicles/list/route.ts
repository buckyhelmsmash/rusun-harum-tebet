import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import { vehicleListParamsSchema } from "@/lib/schemas/vehicles";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = vehicleListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await VehicleRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/vehicles" },
);
