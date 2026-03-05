import { NextResponse } from "next/server";
import { z } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { SettingsRepository } from "@/lib/repositories/settings";

const updateSchema = z.object({
  publicFacilityFee: z.number().int().min(0).optional(),
  guardFee: z.number().int().min(0).optional(),
  waterRate: z.number().int().min(0).optional(),
  car1Fee: z.number().int().min(0).optional(),
  car2Fee: z.number().int().min(0).optional(),
  car3Fee: z.number().int().min(0).optional(),
  meetingNumber: z.string().min(1, "Meeting number is required"),
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
    const session = await verifyAuth(request);

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const oldSettings = await SettingsRepository.get();
    const updated = await SettingsRepository.update(parsed.data);

    const changes = getChanges(oldSettings, parsed.data);

    if (changes.length > 0) {
      logActivity({
        actorId: session.$id,
        actorName: session.name || session.email,
        action: "settings.update",
        description: `Updated system settings (Meeting No: ${parsed.data.meetingNumber})`,
        targetType: "settings",
        metadata: {
          changes,
          meetingNumber: parsed.data.meetingNumber,
        },
      });
    }

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
