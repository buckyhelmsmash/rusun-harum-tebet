import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { UnitRepository } from "@/lib/repositories/units";
import { unitListSchema } from "@/lib/schemas/units";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = unitListSchema.parse(Object.fromEntries(searchParams));
    const result = await UnitRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/units" },
);
