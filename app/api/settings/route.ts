import { NextResponse } from "next/server";
import { z } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
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

export const GET = withApiHandler(
  async () => {
    const settings = await SettingsRepository.get();
    return NextResponse.json(settings);
  },
  { label: "GET /api/settings" },
);

export const PATCH = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const oldSettings = await SettingsRepository.get();
    const updated = await SettingsRepository.update(validated);

    const changes = getChanges(oldSettings, validated);

    if (changes.length > 0) {
      logActivity({
        actorId: session.$id,
        actorName: session.name || session.email,
        action: "settings.update",
        description: `Memperbarui pengaturan sistem (No. Rapat: ${validated.meetingNumber})`,
        targetType: "settings",
        metadata: {
          changes,
          meetingNumber: validated.meetingNumber,
        },
      });
    }

    return NextResponse.json(updated);
  },
  { role: "superadmin", label: "PATCH /api/settings" },
);
