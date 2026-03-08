import crypto from "crypto";
import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

interface MootaWebhookPayload {
  account_number: string;
  date: string; // "2019-11-10 14:33:01"
  description: string;
  amount: number;
  type: "CR" | "DB";
  note: string;
  balance: number;
  created_at: string;
  mutation_id: string;
  token: string;
  bank_id: string;
}

export async function POST(req: Request) {
  try {
    // 1. Validate the Moota Signature
    const signatureHeader =
      req.headers.get("Signature") || req.headers.get("X-MOOTA-WEBHOOK");
    const secret = process.env.MOOTA_WEBHOOK_SECRET;

    if (!secret) {
      console.error("Missing MOOTA_WEBHOOK_SECRET environment variable.");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    if (!signatureHeader) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 },
      );
    }

    // We must read the raw body text to verify the HMAC signature properly
    const rawBody = await req.text();

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signatureHeader !== expectedSignature) {
      console.error("Moota Webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse Payload
    const payloads: MootaWebhookPayload[] = JSON.parse(rawBody);

    if (!Array.isArray(payloads)) {
      return NextResponse.json(
        { error: "Invalid payload format, expected array" },
        { status: 400 },
      );
    }

    // 3. Initialize Appwrite Admin Client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    // Use the actual collection IDs from environment variables if set, else fallback to constants
    const invoicesCollectionId =
      process.env.NEXT_PUBLIC_APPWRITE_INVOICES_COLLECTION_ID || "invoices";
    const activityLogsCollectionId =
      process.env.NEXT_PUBLIC_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID ||
      "activity_logs";

    // 4. Process incoming mutations
    for (const mutation of payloads) {
      // We only care about incoming money (Credit)
      if (mutation.type !== "CR") continue;

      try {
        // Find exactly ONE unpaid invoice matching the exact transfer amount
        const invoicesList = await databases.listDocuments(
          databaseId,
          invoicesCollectionId,
          [
            Query.equal("totalDue", mutation.amount),
            Query.equal("status", "unpaid"),
          ],
        );

        if (invoicesList.documents.length === 1) {
          const matchedInvoice = invoicesList.documents[0];

          // Pay the invoice!
          await databases.updateDocument(
            databaseId,
            invoicesCollectionId,
            matchedInvoice.$id,
            {
              status: "paid",
              payDate: new Date(mutation.created_at).toISOString(),
              receiptId: mutation.mutation_id,
            },
          );

          console.log(
            `Successfully auto-verified invoice ${matchedInvoice.invoiceNumber} for amount ${mutation.amount}`,
          );

          // Log the activity
          await databases.createDocument(
            databaseId,
            activityLogsCollectionId,
            "unique()",
            {
              action: "invoice.update",
              targetType: "invoice",
              targetId: matchedInvoice.$id,
              unitId: matchedInvoice.unitId || null,
              actorId: "system",
              actorName: "Auto-Verification (Moota)",
              description: `Invoice ${matchedInvoice.invoiceNumber} automatically verified via Bank Mutation (${mutation.mutation_id}).`,
              metadata: JSON.stringify({
                amount: mutation.amount,
                bank_id: mutation.bank_id,
                date: mutation.date,
              }),
            },
          );
        } else if (invoicesList.documents.length > 1) {
          // Edge Case: Multiple unpaid invoices share the same exact totalDue amount
          console.warn(
            `Webhook Warning: Multiple unpaid invoices found for amount ${mutation.amount}. Cannot auto-verify.`,
          );
        } else {
          // Standard case where mutation amount doesn't match any system invoices (could be a mistake transfer, or an old paid invoice)
          console.log(
            `Webhook Info: No unpaid invoice found for CR amount ${mutation.amount}. Dropping mutation.`,
          );
        }
      } catch (err) {
        console.error(
          `Error processing mutation ${mutation.mutation_id}:`,
          err,
        );
        // Continue loop to try other mutations even if one fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Moota Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
