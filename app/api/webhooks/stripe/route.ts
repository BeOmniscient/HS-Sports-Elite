import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/lib/supabase/types";

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getAdminClient() as any;

  switch (event.type) {
    // ── Ad purchase completed ──────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "payment") break;

      const { slotId, duration } = session.metadata ?? {};
      const businessName = session.custom_fields?.find((f) => f.key === "business_name")?.text?.value ?? "";
      const websiteUrl = session.custom_fields?.find((f) => f.key === "website_url")?.text?.value ?? "";
      const email = session.customer_details?.email ?? "";

      const now = new Date();
      const ends = new Date(now);
      if (duration === "weekly") ends.setDate(ends.getDate() + 7);
      else if (duration === "monthly") ends.setMonth(ends.getMonth() + 1);
      else ends.setMonth(ends.getMonth() + 4); // seasonal ~4 months

      await supabase.from("ad_bookings").insert({
        slot_type: slotId,
        business_name: businessName,
        contact_email: email,
        contact_name: "",
        link_url: websiteUrl,
        duration_type: duration as "weekly" | "monthly" | "seasonal",
        starts_at: now.toISOString(),
        ends_at: ends.toISOString(),
        price_cents: session.amount_total ?? 0,
        stripe_session_id: session.id,
        status: "active",
      });
      break;
    }

    // ── Subscription created ───────────────────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;
      if (!email) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      const tier = sub.items.data[0]?.plan.interval === "year" ? "annual" : "monthly";

      await supabase.from("profiles").upsert(
        {
          email,
          is_subscriber: isActive,
          subscription_tier: isActive ? tier : "free",
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          subscription_ends_at: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        },
        { onConflict: "email" }
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      if (customer.email) {
        await supabase.from("profiles").update({ is_subscriber: false, subscription_tier: "free" }).eq("email", customer.email);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
