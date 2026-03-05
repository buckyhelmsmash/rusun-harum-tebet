import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { TenantRepository } from "@/lib/repositories/tenants";
import {
  createTenantSchema,
  residentListParamsSchema,
} from "@/lib/schemas/residents";

export async function GET(request: Request) {
  try {
    await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const params = residentListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await TenantRepository.list(params);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/tenants -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAuth(request);
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
    console.error("POST /api/tenants -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
