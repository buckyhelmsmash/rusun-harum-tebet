import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import {
  createInvoiceSchema,
  invoiceListParamsSchema,
} from "@/lib/schemas/invoices";

export const GET = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const params = invoiceListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await InvoiceRepository.list(params);
    return NextResponse.json(result);
  },
  { role: "admin", label: "GET /api/invoices" },
);

export const POST = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createInvoiceSchema.parse(payload);

    const invoice = await InvoiceRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "invoice.create",
      description: `Membuat tagihan untuk periode ${validated.period}`,
      targetType: "invoice",
      targetId: invoice.$id,
      unitId: validated.unit,
      metadata: {
        period: validated.period,
        totalDue: validated.totalDue,
      },
    });

    return NextResponse.json({ result: invoice });
  },
  { role: "admin", label: "POST /api/invoices" },
);
