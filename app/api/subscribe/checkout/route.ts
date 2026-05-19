import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";

export async function POST(req: Request) {
  const { priceId } = await req.json() as { priceId: string };
  if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/subscribe`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { source: "hs-sports-elite-web" },
    },
  });

  return NextResponse.json({ url: session.url });
}
