import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    // TODO: Verify Moota signature
    // TODO: Parse body, match uniqueCode and amount to find unpaid invoice
    // TODO: Mark invoice as paid via Appwrite Server SDK
    // TODO: Send Watzap notification

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
