import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";
import { createDuffelOrder, buildDuffelPassengers, DuffelApiError } from "@/lib/duffel/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// ─── Signature verification ────────────────────────────────────────────────────
// Paystack signs every webhook with HMAC-SHA512 using your secret key.
// Header: x-paystack-signature
// We MUST verify this before processing — otherwise anyone can hit this URL
// and trigger free ticket issuance.
function verifyPaystackSignature(rawBody: string, secret: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  return expected === signature;
}

export async function POST(req: Request) {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  const PAYSTACK_SUBACCOUNT =
    process.env.PAYSTACK_AIRLINE_SUBACCOUNT || process.env.PAYSTACK_SUBACCOUNT_CODE;

  if (!PAYSTACK_SECRET) {
    console.error("[Webhook] Missing PAYSTACK_SECRET_KEY");
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  // Read raw body FIRST — needed for signature verification before JSON.parse
  const rawBody = await req.text();

  // ── Verify signature ─────────────────────────────────────────────────────────
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(rawBody, PAYSTACK_SECRET, signature)) {
    console.warn("[Webhook] Invalid or missing Paystack signature — request rejected");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { event: string; data: any };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = body;
  console.info(`[Webhook] Received event: ${event}`);

  try {
    if (event === "charge.success") {
      await handleChargeSuccess(data, PAYSTACK_SECRET, PAYSTACK_SUBACCOUNT);
    } else {
      console.info(`[Webhook] Ignoring unhandled event: ${event}`);
    }

    // Always return 200 quickly — Paystack retries on non-200
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[Webhook] Unhandled error:", e);
    // Still return 200 to stop Paystack retrying for non-transient errors
    return NextResponse.json({ received: true, warning: "Processing error logged" });
  }
}

// ─── charge.success handler ────────────────────────────────────────────────────
async function handleChargeSuccess(
  data: any,
  paystackSecret: string,
  subaccount: string | undefined
) {
  const { reference, amount, currency } = data;

  console.info(`[Webhook] charge.success — reference=${reference} amount=${amount} currency=${currency}`);

  // ── 1. Find order (idempotency guard) ────────────────────────────────────────
  const order = await prisma.order.findFirst({
    where: { paystackRef: reference },
  });

  if (!order) {
    console.warn(`[Webhook] No order found for reference ${reference} — ignoring`);
    return;
  }

  if (order.status === "BOOKED") {
    console.info(`[Webhook] Order ${order.id} already BOOKED — skipping (idempotent)`);
    return;
  }

  if (order.status === "FAILED") {
    console.warn(`[Webhook] Order ${order.id} is FAILED — will not retry ticketing`);
    return;
  }

  // ── 2. Mark as PAID ──────────────────────────────────────────────────────────
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  // ── 3. Split: transfer flight cost to airline subaccount ─────────────────────
  // Keep $20 USD as Synqed booking fee; transfer the rest to the airline subaccount
  if (subaccount) {
    try {
      const { convertUSDToCurrency } = await import("@/lib/currency");
      const bookingFeeLocal = await convertUSDToCurrency(20, currency);
      const bookingFeeSmallest = Math.round(bookingFeeLocal * 100);
      const flightCostSmallest = amount - bookingFeeSmallest;

      const transferRes = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: flightCostSmallest,
          recipient: subaccount,
          reason: `Flight booking — ${reference}`,
          currency,
        }),
      });
      const transferJson = await transferRes.json();
      console.info(`[Webhook] Transfer to airline: ${JSON.stringify(transferJson)}`);
    } catch (err) {
      // Non-fatal — log and continue to ticket issuance
      console.error("[Webhook] Airline transfer failed (non-fatal):", err);
    }
  }

  // ── 4. Issue ticket via Duffel ───────────────────────────────────────────────
  const passengerData = JSON.parse(order.passengerDetails ?? "{}");
  const rawPassengers: Array<Record<string, string>> = passengerData.passengers ?? [];
  const services: Array<{ id: string; quantity: number }> = passengerData.services ?? [];

  if (!order.offerId || rawPassengers.length === 0) {
    console.error(`[Webhook] Order ${order.id} missing offerId or passengers — marking FAILED`);
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return;
  }

  try {
    const duffelOrder = await createDuffelOrder({
      offerId: order.offerId,
      rawPassengers,
      services,
      settlementCurrency: order.currency ?? "USD",
      settlementAmount: String(order.totalAmount),
    });

    // ── 5. Save Duffel result and mark BOOKED ────────────────────────────────
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "BOOKED",
        duffelOrderId: duffelOrder.id,
      },
    });

    console.info(
      `[Webhook] Order ${order.id} BOOKED — ` +
        `PNR=${duffelOrder.booking_reference} DuffelId=${duffelOrder.id}`
    );
  } catch (err) {
    const reason = err instanceof DuffelApiError
      ? `Duffel ${err.status}: ${err.message}`
      : String(err);

    console.error(`[Webhook] Duffel ticketing FAILED for order ${order.id}: ${reason}`);

    // Mark FAILED — the /api/bookings/complete route (called by success page)
    // also has Duffel logic and will retry once on page load.
    // If both fail, ops team is alerted via logs.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
  }
}
