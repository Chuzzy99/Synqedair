import axios from "axios";
import { PaymentGateway, PaymentIntentOptions, PaymentIntentResponse } from "./types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_test_mock";
const PAYSTACK_API = "https://api.paystack.co";

export class PaystackService implements PaymentGateway {
  private getHeaders() {
    return {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    };
  }

  async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResponse> {
    // Paystack uses transaction initialization rather than payment intents
    // We typically set this up with a redirect URL or let the frontend handle the drop-in using the reference
    const reference = `ps_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email: options.metadata?.email || "customer@synqedair.com", // Paystack requires email
        amount: options.amount, // Paystack amount is in kobo/cents
        currency: options.currency,
        reference: reference,
        metadata: options.metadata,
        channels: ["card"], // Restrict to card for now
      },
      { headers: this.getHeaders() }
    );

    const { data } = response.data;

    return {
      provider: "PAYSTACK",
      providerId: reference,
      authorizationUrl: data.authorization_url,
      amount: options.amount,
      currency: options.currency,
    };
  }

  async verifyPayment(providerId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${PAYSTACK_API}/transaction/verify/${providerId}`, {
        headers: this.getHeaders(),
      });
      return response.data.data.status === "success";
    } catch (error) {
      console.error("Paystack verify error:", error);
      return false;
    }
  }

  async capturePayment(providerId: string, amount?: number): Promise<boolean> {
    // Paystack doesn't natively do two-step auth & capture in their standard API without explicit permissions
    // For MVP, if verifyPayment is true, we consider it captured for now.
    // In production, we'd request Paystack to enable Auth/Capture on our merchant account.
    return this.verifyPayment(providerId);
  }

  async cancelPayment(providerId: string): Promise<boolean> {
    // Similarly, canceling an uncaptured auth on Paystack requires specific setup.
    // For MVP, we can initiate a refund if it was captured.
    return true; 
  }
}

export const paystackService = new PaystackService();
