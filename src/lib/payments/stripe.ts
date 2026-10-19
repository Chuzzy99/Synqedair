import Stripe from "stripe";
import { PaymentGateway, PaymentIntentOptions, PaymentIntentResponse } from "./types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

export class StripeService implements PaymentGateway {
  async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResponse> {
    const intent = await stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency,
      metadata: options.metadata,
      capture_method: "manual", // We authorize first, capture after GDS ticketing
    });

    return {
      provider: "STRIPE",
      providerId: intent.id,
      clientSecret: intent.client_secret || undefined,
      amount: intent.amount,
      currency: intent.currency,
    };
  }

  async verifyPayment(providerId: string): Promise<boolean> {
    const intent = await stripe.paymentIntents.retrieve(providerId);
    return intent.status === "requires_capture" || intent.status === "succeeded";
  }

  async capturePayment(providerId: string, amount?: number): Promise<boolean> {
    try {
      const intent = await stripe.paymentIntents.capture(providerId, {
        amount_to_capture: amount,
      });
      return intent.status === "succeeded";
    } catch (error) {
      console.error("Stripe capture error:", error);
      return false;
    }
  }

  async cancelPayment(providerId: string): Promise<boolean> {
    try {
      const intent = await stripe.paymentIntents.cancel(providerId);
      return intent.status === "canceled";
    } catch (error) {
      console.error("Stripe cancel error:", error);
      return false;
    }
  }
}

export const stripeService = new StripeService();
