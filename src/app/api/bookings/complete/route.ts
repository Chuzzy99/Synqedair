import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    // 1. Find the pending order in the database
    const order = await prisma.order.findFirst({
      where: { paystackRef: reference },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Verify the Paystack transaction using the paystackRef via backend API
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
    const verifyRes = await fetch(`${BACKEND_URL}/api/bookings/verify/${reference}`, {
      method: "GET",
    });

    if (!verifyRes.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    const verifyData = await verifyRes.json();
    if (verifyData.status !== "success") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ success: false, error: "Payment not successful" }, { status: 400 });
    }

    // 3. If order is already booked, return success
    if (order.status === "BOOKED") {
      return NextResponse.json({ success: true, orderId: order.id, duffelOrderId: order.duffelOrderId });
    }

    // 4. Payment is successful, update order to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // 5. Create the Order in Duffel using the stored passenger details
    const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
    if (!DUFFEL_TOKEN) {
      return NextResponse.json({ success: false, error: "Missing Duffel token" }, { status: 500 });
    }

    const passengers = JSON.parse(order.passengerDetails);
    
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

    // 6. Update the Database Order as Booked
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
