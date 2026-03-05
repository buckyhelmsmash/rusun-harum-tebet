import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { SettingsRepository } from "@/lib/repositories/settings";

const updateSchema = z.object({
  iplFee: z.number().int().min(0).optional(),
  publicFacilityFee: z.number().int().min(0).optional(),
  guardFee: z.number().int().min(0).optional(),
  waterRate: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    const settings = await SettingsRepository.get();
    return NextResponse.json(settings);
  } catch (error: unknown) {
    console.error("[settings-get]", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await verifyAuth(request);

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const updated = await SettingsRepository.update(parsed.data);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[settings-patch]", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
