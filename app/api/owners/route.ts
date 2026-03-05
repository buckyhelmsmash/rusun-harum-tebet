import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { OwnerRepository } from "@/lib/repositories/owners";
import {
  createOwnerSchema,
  residentListParamsSchema,
} from "@/lib/schemas/residents";

export async function GET(request: Request) {
  try {
    await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const params = residentListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await OwnerRepository.list(params);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/owners -", getErrorMessage(error));
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
    const validated = createOwnerSchema.parse(payload);

    const existing = await OwnerRepository.getByKtpNumber(validated.ktpNumber);
    if (existing) {
      return NextResponse.json(
        {
          error: `Owner with KTP ${validated.ktpNumber} is already registered.`,
        },
        { status: 409 },
      );
    }

    const owner = await OwnerRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "owner.create",
      description: `Menambahkan pemilik ${validated.fullName}`,
      targetType: "owner",
      targetId: owner.$id,
    });

    return NextResponse.json({ result: owner });
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
    console.error("POST /api/owners -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
