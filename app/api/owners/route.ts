import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { OwnerRepository } from "@/lib/repositories/owners";
import {
  createOwnerSchema,
  residentListParamsSchema,
} from "@/lib/schemas/residents";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = residentListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await OwnerRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/owners" },
);

export const POST = withApiHandler(
  async (request, { session }) => {
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
  },
  { role: "admin", label: "POST /api/owners" },
);
