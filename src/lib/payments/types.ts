export interface PaymentIntentOptions {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  provider: "STRIPE" | "PAYSTACK";
  providerId: string; // The ID from the provider (e.g. pi_...)
  clientSecret?: string; // Needed for Stripe Elements
  authorizationUrl?: string; // Needed for Paystack redirect
  amount: number;
  currency: string;
}

export interface PaymentGateway {
  createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResponse>;
  verifyPayment(providerId: string): Promise<boolean>;
  capturePayment(providerId: string, amount?: number): Promise<boolean>;
  cancelPayment(providerId: string): Promise<boolean>;
}
