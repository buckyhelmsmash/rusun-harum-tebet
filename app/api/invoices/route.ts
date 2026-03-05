import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import {
  createInvoiceSchema,
  invoiceListParamsSchema,
} from "@/lib/schemas/invoices";

export async function GET(request: Request) {
  try {
    await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const params = invoiceListParamsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await InvoiceRepository.list(params);

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("GET /api/invoices -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAuth(request);
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createInvoiceSchema.parse(payload);

    const invoice = await InvoiceRepository.create(validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "invoice.create",
      description: `Created invoice for period ${validated.period}`,
      targetType: "invoice",
      targetId: invoice.$id,
      unitId: validated.unit,
      metadata: {
        period: validated.period,
        totalDue: validated.totalDue,
      },
    });

    return NextResponse.json({ result: invoice });
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
    console.error("POST /api/invoices -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
