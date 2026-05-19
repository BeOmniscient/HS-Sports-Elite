import { NextResponse } from "next/server";
import { stripe, AD_PRICES } from "@/lib/stripe/client";
import type { AdSlotType, AdDuration } from "@/lib/stripe/client";

export async function POST(req: Request) {
  const { slotId, slotLabel, duration, priceCents } = await req.json() as {
    slotId: AdSlotType;
    slotLabel: string;
    duration: AdDuration;
    priceCents: number;
  };

  const prices = AD_PRICES[slotId];
  if (!prices) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });

  const expectedPrice = prices[duration];
  if (expectedPrice !== priceCents) return NextResponse.json({ error: "Price mismatch" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: `${slotLabel} — ${duration.charAt(0).toUpperCase() + duration.slice(1)} Ad`,
            description: `HS Sports Elite advertising slot: ${slotLabel}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { slotId, slotLabel, duration },
    success_url: `${siteUrl}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/advertise`,
    billing_address_collection: "required",
    custom_fields: [
      { key: "business_name", label: { type: "custom", custom: "Business Name" }, type: "text" },
      { key: "website_url", label: { type: "custom", custom: "Your Website URL" }, type: "text" },
    ],
  });

  return NextResponse.json({ url: session.url });
}
