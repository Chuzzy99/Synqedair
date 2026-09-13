import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
    if (!DUFFEL_TOKEN) {
      return NextResponse.json({ success: false, error: "Missing Duffel token" }, { status: 500 });
    }

    const body = await req.json();
    const { offerId, passengers, services, payments, paystackRef, totalAmount, currency } = body;

    // 1. Create a Pending Order in the Database
    const order = await prisma.order.create({
      data: {
        offerId,
        totalAmount,
        currency,
        paystackRef,
        status: "PENDING",
        passengerDetails: JSON.stringify(passengers),
      },
    });

    // 2. Verify the Paystack transaction using the paystackRef
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ success: false, error: "Missing Paystack secret" }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${paystackRef}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    const verifyData = await verifyRes.json();
    if (verifyData.data.status !== "success") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ success: false, error: "Payment not successful" }, { status: 400 });
    }

    // Payment is successful, update order to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // 3. Create the Order in Duffel using our pre-funded Balance
    const res = await fetch("https://api.duffel.com/air/orders", {
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
          selected_offers: [offerId],
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
          payments: payments, // The frontend passes { type: "balance", currency, amount }
        }
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Duffel create order error:", errorText);
      
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      
      return NextResponse.json({ success: false, error: "Failed to create order on Duffel" }, { status: res.status });
    }

    const json = await res.json();
    const duffelOrderId = json.data.id;

    // 4. Update the Database Order as Booked
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: "BOOKED",
        duffelOrderId: duffelOrderId
      },
    });

    return NextResponse.json({ success: true, orderId: order.id, duffelOrderId });
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
