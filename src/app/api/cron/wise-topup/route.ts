import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// This endpoint would ideally be called by a cron job service (e.g. Vercel Cron)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
    const WISE_API_TOKEN = process.env.WISE_API_TOKEN;
    const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID;
    
    if (!DUFFEL_TOKEN || !WISE_API_TOKEN || !WISE_PROFILE_ID) {
      return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 });
    }

    // 1. Check Duffel Balance (using the airlines or balance endpoint if applicable, but Duffel Balance is currently in the organization billing)
    // For this prototype, let's assume we do a fixed daily topup or fetch a generic balance.
    // Actually, Duffel API doesn't expose a direct /balance endpoint for all users yet. We will mock the balance check logic.
    
    const balanceThreshold = 1000; // USD
    const currentBalance = 500; // Mocked
    const topUpAmount = 5000; // USD

    if (currentBalance < balanceThreshold) {
      // 2. Create Wise Quote
      const quoteRes = await fetch("https://api.sandbox.transferwise.tech/v2/quotes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WISE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceCurrency: "USD",
          targetCurrency: "USD",
          sourceAmount: topUpAmount,
          profile: WISE_PROFILE_ID
        })
      });

      if (!quoteRes.ok) {
        throw new Error("Failed to create Wise quote");
      }

      const quote = await quoteRes.json();

      // 3. Create Transfer to Duffel's Bank Account
      // Note: In reality, you'd need the Duffel Recipient ID created in Wise.
      const DUFFEL_WISE_RECIPIENT_ID = process.env.DUFFEL_WISE_RECIPIENT_ID;

      const transferRes = await fetch("https://api.sandbox.transferwise.tech/v1/transfers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WISE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetAccount: DUFFEL_WISE_RECIPIENT_ID,
          quoteUuid: quote.id,
          customerTransactionId: `topup-${Date.now()}`,
          details: {
            reference: "Duffel Balance Top Up"
          }
        })
      });

      if (!transferRes.ok) {
        throw new Error("Failed to create Wise transfer");
      }

      const transfer = await transferRes.json();

      // 4. Fund the Transfer (assuming balance in Wise is sufficient)
      const fundRes = await fetch(`https://api.sandbox.transferwise.tech/v3/profiles/${WISE_PROFILE_ID}/transfers/${transfer.id}/payments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WISE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "BALANCE"
        })
      });

      if (!fundRes.ok) {
        throw new Error("Failed to fund Wise transfer");
      }

      // 5. Log the Top Up in our Database
      await prisma.topUpLog.create({
        data: {
          amount: topUpAmount,
          currency: "USD",
          status: "SUCCESS"
        }
      });

      return NextResponse.json({ success: true, message: "Top up completed", transferId: transfer.id });
    }

    return NextResponse.json({ success: true, message: "Balance is sufficient, no top up needed." });
  } catch (error: any) {
    console.error("Wise Top Up Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
