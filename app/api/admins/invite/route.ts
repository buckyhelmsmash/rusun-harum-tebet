import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { z } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { createAdminClient } from "@/lib/appwrite/server";
import { adminRepository } from "@/lib/repositories/admins";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    const newUser = await adminRepository.invite(email);

    try {
      const { messaging } = await createAdminClient();
      await messaging.createEmail(
        ID.unique(), // messageId
        "Undangan Admin Rusun Harum Tebet", // subject
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Selamat Datang di Rusun Harum Tebet!</h2>
            <p>Anda telah diundang sebagai Admin.</p>
            <p>Karena platform ini menggunakan Google OAuth, Anda tidak memerlukan password. Silakan login menggunakan akun Google Anda.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" 
                 style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
                Login ke Dashboard
              </a>
            </p>
          </div>
        `, // content
        [], // topics
        [newUser.$id], // users
        [], // targets
        [], // cc
        [], // bcc
        [], // attachments
        false, // draft
        true, // html
      );
    } catch (msgError) {
      console.error("Failed to send welcome email:", msgError);
      // We don't fail the whole request just because the email failed
    }

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "admin.invite",
      description: `Mengundang admin baru: ${email}`,
      targetType: "admin",
      targetId: newUser.$id,
    });

    return NextResponse.json({ result: newUser });
  },
  { role: "superadmin", label: "POST /api/admins/invite" },
);
