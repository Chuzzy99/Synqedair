import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { paymentService } from "@/lib/payments";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { flightId, passengerDetails, targetCurrency, amount, userId } = body;

    // 1. Validation (mocking flight price verification for MVP)
    if (!amount || !targetCurrency) {
      return NextResponse.json({ error: "Missing amount or currency" }, { status: 400 });
    }

    // 2. Create Booking in DB (PENDING status)
    const booking = await prisma.booking.create({
      data: {
        userId: userId || null,
        offerId: flightId,
        totalAmount: amount, // In smallest unit (cents/kobo)
        currency: targetCurrency,
        status: "PENDING",
        passengerDetails: JSON.stringify(passengerDetails),
      },
    });

    // 3. Initiate Payment Intent via Payment Service
    const paymentIntent = await paymentService.initiateCheckout({
      amount: amount,
      currency: targetCurrency,
      metadata: {
        bookingId: booking.id,
      },
    });

    // 4. Save Payment Intent to DB
    await prisma.paymentIntent.create({
      data: {
        bookingId: booking.id,
        provider: paymentIntent.provider,
        providerId: paymentIntent.providerId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "REQUIRES_PAYMENT_METHOD",
      },
    });

    // 5. Return client secret / redirect URL to frontend
    return NextResponse.json({
      bookingId: booking.id,
      payment: paymentIntent,
    });
  } catch (error) {
    console.error("Initiate checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
