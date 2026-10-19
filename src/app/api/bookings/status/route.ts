import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

/**
 * GET /api/bookings/status?reference=xxx
 *
 * Polled by the /success page to check booking state without
 * triggering any side-effects (no Duffel call, no payment action).
 *
 * The webhook is the source of truth for creating the Duffel ticket.
 * The /api/bookings/complete route is the fallback if the webhook
 * didn't fire before the user landed on the success page.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { paystackRef: reference },
    select: {
      id: true,
      duffelOrderId: true,
      status: true,
    },
  });

  if (!order) {
    return NextResponse.json({ found: false, status: "NOT_FOUND" });
  }

  return NextResponse.json({
    found: true,
    status: order.status,           // PENDING | PAID | BOOKED | FAILED
    orderId: order.id,
    duffelOrderId: order.duffelOrderId ?? null,
  });
}
