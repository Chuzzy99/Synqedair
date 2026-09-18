import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ success: false, error: "Missing Paystack key" }, { status: 500 });
    }

    const body = await req.json();
    const { 
      offerId, 
      passengerName, 
      passengerEmail, 
      passengerPhone, 
      amount, 
      currency, 
      chargeCurrency, // new field
      callbackUrl,
      passengers,
      services
    } = body;

    const bookingId = randomUUID();

    // Import the converter
    const { convertUSDToCurrency } = await import("@/lib/currency");
    
    // Use the requested charge currency (if provided), otherwise default to USD
    const targetCurrency = chargeCurrency || "USD";
    let amountInTargetCurrency = amount;
    
    if (currency !== targetCurrency) {
      // If Duffel amount is USD but target is NGN, convert it
      amountInTargetCurrency = await convertUSDToCurrency(amount, targetCurrency);
    }
    
    // Amount needs to be in smallest unit (kobo for NGN, cents for USD)
    const amountInSmallestUnit = Math.round(amountInTargetCurrency * 100);

    // 1. Create a Pending Order in the Database
    const order = await prisma.order.create({
      data: {
        id: bookingId,
        offerId,
        totalAmount: amount, // Store the original USD amount
        currency: currency, // The original offer currency (e.g. USD) needed for Duffel
        paystackRef: bookingId,
        status: "PENDING",
        passengerDetails: JSON.stringify({ passengers, services }),
      },
    });

    // 2. Initialize Paystack Transaction
    const requestBody: any = {
      email: passengerEmail,
      amount: amountInSmallestUnit,
      reference: bookingId,
      currency: targetCurrency,
      callback_url: callbackUrl,
    };

    console.log("=== PAYSTACK INIT ===");
    console.log("chargeCurrency received:", chargeCurrency);
    console.log("targetCurrency:", targetCurrency);
    console.log("amount (USD):", amount);
    console.log("amountInTargetCurrency:", amountInTargetCurrency);
    console.log("amountInSmallestUnit:", amountInSmallestUnit);
    console.log("email:", passengerEmail);
    console.log("requestBody:", JSON.stringify(requestBody));

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Paystack initialize error:", errorText);
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      // Return the full Paystack error message to the frontend so we can see it
      return NextResponse.json({ success: false, error: "Failed to initialize payment", paystackError: errorText }, { status: res.status });
    }

    const json = await res.json();
    
    return NextResponse.json({ 
      success: true, 
      bookingId: order.id, 
      paymentAuthorizationUrl: json.data.authorization_url 
    });
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
