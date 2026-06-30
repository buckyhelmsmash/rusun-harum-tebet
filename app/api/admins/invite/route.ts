import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, ForbiddenError, requireRole } from "@/lib/auth/verify";
import { AdminRepository } from "@/lib/repositories/admins";
import { getErrorMessage } from "@/lib/repositories/base";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(request, "superadmin");
    
    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    const newUser = await AdminRepository.invite(email);

    // Send welcome email via Appwrite Messaging
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
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
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
        true // html
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
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("POST /api/admins/invite -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
