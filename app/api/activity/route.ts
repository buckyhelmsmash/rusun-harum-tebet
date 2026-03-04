import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { ActivityLogRepository } from "@/lib/repositories/activity-logs";
import { getErrorMessage } from "@/lib/repositories/base";
import { activityListParamsSchema } from "@/lib/schemas/activity-logs";

export async function GET(request: Request) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const params = activityListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await ActivityLogRepository.list(params);

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
    console.error("GET /api/activity -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
