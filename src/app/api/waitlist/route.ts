import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FORMSPREE_ENDPOINT =
  process.env.FORMSPREE_WAITLIST_ENDPOINT || "https://formspree.io/f/xvkzyyqj";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, flyingFrom, flyingTo, frequency, whatsapp } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFrom = typeof flyingFrom === "string" ? flyingFrom.trim() : null;
    const cleanTo = typeof flyingTo === "string" ? flyingTo.trim() : null;
    const cleanFrequency = typeof frequency === "string" ? frequency.trim() : null;
    const cleanWhatsapp = typeof whatsapp === "string" ? whatsapp.trim() : null;

    // 1. Save or update entry in database
    let savedEntry = null;
    try {
      savedEntry = await prisma.waitlistEntry.upsert({
        where: { email: cleanEmail },
        update: {
          flyingFrom: cleanFrom,
          flyingTo: cleanTo,
          frequency: cleanFrequency,
          whatsapp: cleanWhatsapp,
          updatedAt: new Date(),
        },
        create: {
          email: cleanEmail,
          flyingFrom: cleanFrom,
          flyingTo: cleanTo,
          frequency: cleanFrequency,
          whatsapp: cleanWhatsapp,
        },
      });
    } catch (dbError) {
      console.error("[Waitlist API] DB error saving waitlist entry:", dbError);
      // We don't fail immediately; proceed to forward to Formspree
    }

    // 2. Forward to Formspree backend
    let formspreeSuccess = false;
    try {
      const formspreeRes = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          flyingFrom: cleanFrom || "—",
          flyingTo: cleanTo || "—",
          frequency: cleanFrequency || "—",
          whatsapp: cleanWhatsapp || "—",
          _subject: "🛫 New Synqed Air waitlist signup",
        }),
      });
      formspreeSuccess = formspreeRes.ok;
    } catch (formspreeError) {
      console.error("[Waitlist API] Error forwarding to Formspree:", formspreeError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the waitlist",
      data: {
        email: cleanEmail,
        savedToDatabase: Boolean(savedEntry),
        forwardedToFormspree: formspreeSuccess,
      },
    });
  } catch (err: any) {
    console.error("[Waitlist API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlistEntry.count();
    return NextResponse.json({
      status: "ready",
      message: "Waitlist backend is operational",
      formspreeConfigured: Boolean(FORMSPREE_ENDPOINT),
      totalEntries: count,
    });
  } catch {
    return NextResponse.json({
      status: "ready",
      message: "Waitlist backend is operational",
      formspreeConfigured: Boolean(FORMSPREE_ENDPOINT),
    });
  }
}
