import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const PAYSTACK_SUBACCOUNT = process.env.PAYSTACK_AIRLINE_SUBACCOUNT || process.env.PAYSTACK_SUBACCOUNT_CODE;

    if (!DUFFEL_TOKEN || !PAYSTACK_SECRET) {
      return NextResponse.json({ success: false, error: "Missing config" }, { status: 500 });
    }

    const body = await req.json();
    const { event, data } = body;

    // Verify webhook signature (normally you verify x-paystack-signature header with crypto.createHmac)
    // For local testing, we'll proceed if the event is charge.success.

    if (event === "charge.success") {
      const { reference, amount, currency } = data; // amount is in smallest unit (kobo/cents)

      console.log("Webhook: Payment successful:", { reference, amount, currency });

      // 1. Find the pending order in the database
      const order = await prisma.order.findFirst({
        where: { paystackRef: reference },
      });

      if (!order || order.status === "BOOKED") {
        return NextResponse.json({ success: true, message: "Order not found or already booked" });
      }

      // Update to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      // 2. Transfer the flight cost to the airline subaccount (split payment)
      const { convertUSDToCurrency } = await import("@/lib/currency");
      
      // We want to keep $20 USD.
      const bookingFeeInLocalCurrency = await convertUSDToCurrency(20, currency);
      const bookingFeeSmallestUnit = Math.round(bookingFeeInLocalCurrency * 100);
      
      const flightCostSmallest = amount - bookingFeeSmallestUnit;

      if (PAYSTACK_SUBACCOUNT) {
        try {
          const transferRes = await fetch("https://api.paystack.co/transfer", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${PAYSTACK_SECRET}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: "balance",
              amount: flightCostSmallest,
              recipient: PAYSTACK_SUBACCOUNT,
              reason: `Flight booking payment - ${reference}`,
              currency: currency,
            }),
          });
          const transferJson = await transferRes.json();
          console.log("Transfer to airline response:", transferJson);
        } catch (err) {
          console.error("Transfer to airline failed:", err);
          // Proceed to Duffel even if transfer fails (for testing)
        }
      }

      // 3. Create Duffel Booking
      const passengerData = JSON.parse(order.passengerDetails || "{}");
      const passengers = passengerData.passengers || [];
      const services = passengerData.services || [];

      const duffelRes = await fetch("https://api.duffel.com/air/orders", {
        method: "POST",
        headers: {
          "Accept-Encoding": "gzip",
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Duffel-Version": "v2",
          "Authorization": `Bearer ${DUFFEL_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            type: "instant",
            selected_offers: [order.offerId],
            passengers: passengers.map((p: any) => ({
              id: p.id,
              given_name: p.first_name,
              family_name: p.last_name,
              born_on: p.born_on,
              title: p.title,
              gender: p.gender,
              phone_number: p.phone_number,
              email: p.email,
            })),
            services: services.map((s: any) => ({
              id: s.id,
              quantity: s.quantity,
            })),
            payments: [
              {
                type: "balance",
                currency: order.currency,
                amount: String(order.totalAmount),
              }
            ],
          }
        }),
      });

      if (!duffelRes.ok) {
        const errorText = await duffelRes.text();
        console.error("Duffel create order error:", errorText);
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        return NextResponse.json({ success: false, error: "Failed to create order on Duffel" }, { status: duffelRes.status });
      }

      const duffelJson = await duffelRes.json();
      const duffelOrderId = duffelJson.data.id;

      // 4. Update the Database Order as Booked
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "BOOKED",
          duffelOrderId: duffelOrderId
        },
      });

      return NextResponse.json({ success: true, status: "processed", reference });
    }

    return NextResponse.json({ success: true, status: "ignored", event });
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
