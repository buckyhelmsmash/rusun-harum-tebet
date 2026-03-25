import { NextResponse } from 'next/server';
import { duitkuClient, DuitkuCallbackPayload } from '@/lib/duitku';

export async function POST(req: Request) {
  try {
    // Duitku sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries()) as unknown as DuitkuCallbackPayload;

    const {
      merchantOrderId,
      amount,
      resultCode,
      signature,
    } = payload;

    if (!merchantOrderId || !amount || !resultCode || !signature) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify request came from Duitku realistically
    const isValidSignature = duitkuClient.verifyCallbackSignature(
      merchantOrderId,
      amount,
      signature
    );

    if (!isValidSignature) {
      console.warn(`[DUITKU_WEBHOOK] Invalid signature for invoice ${merchantOrderId}`);
      return NextResponse.json({ error: 'Bad Signature' }, { status: 403 });
    }

    if (resultCode === '00') {
      // Payment Successful
      console.log(`[DUITKU_WEBHOOK] Payment success for invoice ${merchantOrderId}`);
      
      // TODO: Initialize Appwrite Server SDK here
      // TODO: Fetch invoice document by ID (merchantOrderId)
      // TODO: Update invoice status to 'Lunas' / Paid
      // TODO: Log the transaction reference into a payments collection
    } else {
      console.log(`[DUITKU_WEBHOOK] Payment failed or expired for invoice ${merchantOrderId}`);
      // Handle failure logic if necessary
    }

    // Duitku expects an HTTP 200 plain text response 'Success' or 'Failed'
    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('[DUITKU_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
