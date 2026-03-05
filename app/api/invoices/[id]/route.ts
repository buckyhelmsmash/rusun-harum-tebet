import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import { updateInvoiceSchema } from "@/lib/schemas/invoices";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const invoice = await InvoiceRepository.getById(id);
    return NextResponse.json(invoice);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/invoices/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateInvoiceSchema.parse(payload);

    const oldInvoice = await InvoiceRepository.getById(id);
    const updatedInvoice = await InvoiceRepository.update(id, validated);

    const changes = getChanges(oldInvoice, validated);

    if (changes.length > 0) {
      logActivity({
        actorId: session.$id,
        actorName: session.name || session.email,
        action: "invoice.update",
        description: `Updated invoice for period ${oldInvoice.period}`,
        targetType: "invoice",
        targetId: updatedInvoice.$id,
        unitId: updatedInvoice.unitId,
        metadata: { changes },
      });
    }

    return NextResponse.json({ result: updatedInvoice });
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
    console.error("PATCH /api/invoices/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
