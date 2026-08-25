import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { TenantRepository } from "@/lib/repositories/tenants";
import {
  createTenantSchema,
  residentListParamsSchema,
} from "@/lib/schemas/residents";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = residentListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await TenantRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/tenants" },
);

export const POST = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createTenantSchema.parse(payload);

    const existing = await TenantRepository.getByKtpNumber(validated.ktpNumber);
    if (existing) {
      return NextResponse.json(
        {
          error: `Tenant with KTP ${validated.ktpNumber} is already registered.`,
        },
        { status: 409 },
      );
    }

    const tenant = await TenantRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "tenant.create",
      description: `Menambahkan penyewa ${validated.fullName}`,
      targetType: "tenant",
      targetId: tenant.$id,
    });

    return NextResponse.json({ result: tenant });
  },
  { role: "admin", label: "POST /api/tenants" },
);
