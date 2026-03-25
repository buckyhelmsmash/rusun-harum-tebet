import crypto from 'crypto';

interface DuitkuConfig {
  merchantCode: string;
  apiKey: string;
  isSandbox: boolean;
}

export interface DuitkuPopRequest {
  paymentAmount: number;
  merchantOrderId: string;
  productDetails: string;
  email: string;
  phoneNumber: string;
  customerVaName: string;
  callbackUrl: string;
  returnUrl: string;
  expiryPeriod: number; // minutes
}

export interface DuitkuCallbackPayload {
  merchantOrderId: string;
  amount: string;
  reference: string;
  resultCode: string;
  signature: string;
  publisherOrderId?: string;
  spcSignature?: string;
}

export class DuitkuClient {
  private config: DuitkuConfig;
  private readonly baseUrl: string;

  constructor() {
    const merchantCode = process.env.DUITKU_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY;
    const isSandbox = process.env.DUITKU_SANDBOX === 'true';

    if (!merchantCode || !apiKey) {
      console.warn('Duitku environment variables are missing (Merchant Code or API Key). Check your .env file.');
    }

    this.config = { 
      merchantCode: merchantCode || '', 
      apiKey: apiKey || '', 
      isSandbox 
    };

    // Duitku POP endpoints have a specific base URL
    this.baseUrl = isSandbox
      ? 'https://api-sandbox.duitku.com/api/merchant'
      : 'https://api-prod.duitku.com/api/merchant';
  }

  /**
   * Used strictly for verifying incoming Webhooks.
   * Duitku Callback still uses MD5(merchantCode + amount + orderId + apiKey)
   */
  public verifyCallbackSignature(
    orderId: string,
    amount: string,
    providedSignature: string
  ): boolean {
    const data = `${this.config.merchantCode}${amount}${orderId}${this.config.apiKey}`;
    const expectedSignature = crypto.createHash('md5').update(data).digest('hex');
    return expectedSignature === providedSignature;
  }

  /**
   * Generates a payment intent using the POP API standard.
   */
  public async createTransaction(req: DuitkuPopRequest): Promise<unknown> {
    // 1. Duitku POP requires exact Unix milliseconds
    const timestamp = Date.now().toString();

    // 2. Signature Formula for API POP Header: SHA256(merchantCode + timestamp + apiKey)
    const signatureData = `${this.config.merchantCode}${timestamp}${this.config.apiKey}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    // Split names safely since user might only have one word
    const nameParts = req.customerVaName.split(" ");
    const firstName = nameParts[0] || "Penghuni";
    const lastName = nameParts.slice(1).join(" ") || "Rusun";

    // 3. Exact payload shape required by Duitku POP
    const payload = {
      paymentAmount: req.paymentAmount,
      merchantOrderId: req.merchantOrderId,
      productDetails: req.productDetails,
      paymentMethod: "", // MUST be empty string for POP interface to work natively
      email: req.email,
      phoneNumber: req.phoneNumber,
      additionalParam: "",
      merchantUserInfo: req.email,
      customerVaName: req.customerVaName,
      callbackUrl: req.callbackUrl,
      returnUrl: req.returnUrl,
      expiryPeriod: req.expiryPeriod,
      customerDetail: {
        firstName: firstName,
        lastName: lastName,
        email: req.email,
        phoneNumber: req.phoneNumber,
        billingAddress: {
          firstName: firstName,
          lastName: lastName,
          address: "Rusun Harum Tebet",
          city: "Jakarta",
          postalCode: "12870",
          phone: req.phoneNumber,
          countryCode: "ID"
        },
        shippingAddress: {
          firstName: firstName,
          lastName: lastName,
          address: "Rusun Harum Tebet",
          city: "Jakarta",
          postalCode: "12870",
          phone: req.phoneNumber,
          countryCode: "ID"
        }
      },
      itemDetails: [
        {
          name: req.productDetails,
          price: req.paymentAmount,
          quantity: 1
        }
      ]
    };

    const response = await fetch(`${this.baseUrl}/createInvoice`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-duitku-signature': signature,
        'x-duitku-timestamp': timestamp,
        'x-duitku-merchantcode': this.config.merchantCode
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DUITKU] API Response Error:", errorText);
      throw new Error(`Duitku API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

export const duitkuClient = new DuitkuClient();
