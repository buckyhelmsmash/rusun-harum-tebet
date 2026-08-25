import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ActivityLogRepository } from "@/lib/repositories/activity-logs";
import { activityListParamsSchema } from "@/lib/schemas/activity-logs";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = activityListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await ActivityLogRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/activity" },
);
