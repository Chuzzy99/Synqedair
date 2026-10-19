import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});
const prisma = new PrismaClient();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock";

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("No signature");
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        // This is triggered when the card is successfully Authorized (but not yet captured)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentAuthorized(paymentIntent.id);
        break;
      case "payment_intent.succeeded":
        // Triggered if auto-captured or after manual capture succeeds
        const capturedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCaptured(capturedIntent.id);
        break;
      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(failedIntent.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handlePaymentAuthorized(providerId: string) {
  const intent = await prisma.paymentIntent.update({
    where: { providerId },
    data: { status: "REQUIRES_CAPTURE" },
    include: { booking: true },
  });

  await prisma.transaction.create({
    data: {
      paymentIntentId: intent.id,
      type: "AUTHORIZATION",
      amount: intent.amount,
      status: "SUCCESS",
    },
  });

  await prisma.booking.update({
    where: { id: intent.bookingId },
    data: { status: "AUTHORIZED" },
  });

  // Trigger GDS Ticketing and Payment Capture
  try {
    const { bookingService } = await import("@/lib/services/bookingService");
    await bookingService.processAuthorizedBooking(intent.bookingId);
  } catch (err) {
    console.error(`Failed to process authorized booking ${intent.bookingId}:`, err);
  }
}

async function handlePaymentCaptured(providerId: string) {
  const intent = await prisma.paymentIntent.update({
    where: { providerId },
    data: { status: "SUCCEEDED" },
  });

  await prisma.transaction.create({
    data: {
      paymentIntentId: intent.id,
      type: "CAPTURE",
      amount: intent.amount,
      status: "SUCCESS",
    },
  });

  await prisma.booking.update({
    where: { id: intent.bookingId },
    data: { status: "CONFIRMED" },
  });
}

async function handlePaymentFailed(providerId: string) {
  const intent = await prisma.paymentIntent.update({
    where: { providerId },
    data: { status: "FAILED" },
  });

  await prisma.transaction.create({
    data: {
      paymentIntentId: intent.id,
      type: "AUTHORIZATION",
      amount: intent.amount,
      status: "FAILED",
    },
  });

  await prisma.booking.update({
    where: { id: intent.bookingId },
    data: { status: "CANCELLED" },
  });
}
