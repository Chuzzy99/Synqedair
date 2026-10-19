import { stripeService } from "./stripe";
import { paystackService } from "./paystack";
import { PaymentGateway, PaymentIntentOptions, PaymentIntentResponse } from "./types";

export class PaymentService {
  /**
   * Determines the best gateway based on currency.
   * NGN, GHS, KES, ZAR typically go to Paystack for better local acceptance.
   * USD, GBP, EUR, CAD, etc. go to Stripe.
   */
  private getGatewayForCurrency(currency: string): PaymentGateway {
    const paystackCurrencies = ["NGN", "GHS", "ZAR", "KES"];
    if (paystackCurrencies.includes(currency.toUpperCase())) {
      return paystackService;
    }
    return stripeService;
  }

  async initiateCheckout(options: PaymentIntentOptions): Promise<PaymentIntentResponse> {
    const gateway = this.getGatewayForCurrency(options.currency);
    return gateway.createPaymentIntent(options);
  }

  async verify(provider: string, providerId: string): Promise<boolean> {
    const gateway = provider === "PAYSTACK" ? paystackService : stripeService;
    return gateway.verifyPayment(providerId);
  }

  async capture(provider: string, providerId: string, amount?: number): Promise<boolean> {
    const gateway = provider === "PAYSTACK" ? paystackService : stripeService;
    return gateway.capturePayment(providerId, amount);
  }

  async cancel(provider: string, providerId: string): Promise<boolean> {
    const gateway = provider === "PAYSTACK" ? paystackService : stripeService;
    return gateway.cancelPayment(providerId);
  }
}

export const paymentService = new PaymentService();
