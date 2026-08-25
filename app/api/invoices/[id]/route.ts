import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import { updateInvoiceSchema } from "@/lib/schemas/invoices";

export const GET = withApiHandler<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const invoice = await InvoiceRepository.getById(id);
    return NextResponse.json(invoice);
  },
  { role: "admin", label: "GET /api/invoices/[id]" },
);

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
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
        description: `Memperbarui tagihan untuk periode ${oldInvoice.period}`,
        targetType: "invoice",
        targetId: updatedInvoice.$id,
        unitId: updatedInvoice.unitId,
        metadata: { changes },
      });
    }

    return NextResponse.json({ result: updatedInvoice });
  },
  { role: "admin", label: "PATCH /api/invoices/[id]" },
);
