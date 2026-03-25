import { NextResponse } from 'next/server';
import { duitkuClient } from '@/lib/duitku';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // In a real scenario, these values come from your database
    // validation against the generated monthly invoice document
    const { amount, invoiceId, customerName, customerEmail, customerPhone } = body;

    if (!amount || !invoiceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Usually derived from host header or env
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const reqData = {
      paymentAmount: Number(amount),
      merchantOrderId: invoiceId, // Match with Appwrite invoice document ID
      productDetails: `Tagihan Rusun Harum Tebet - Invoice ${invoiceId}`,
      email: customerEmail || 'no-email@rusuntebet.id',
      phoneNumber: customerPhone || '000000000',
      customerVaName: customerName || 'Warga Rusun Harum Tebet',
      callbackUrl: `${appUrl}/api/webhooks/duitku`,
      returnUrl: `${appUrl}/portal/invoice/${invoiceId}`,
      expiryPeriod: 1440, // 24 hours
    };

    const result = await duitkuClient.createTransaction(reqData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[DUITKU_CREATE_ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
