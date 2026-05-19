import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => getStripe()[prop as keyof Stripe],
});

export const AD_PRICES = {
  banner_home: {
    label: "Homepage Banner",
    weekly:   4900,   // $49
    monthly:  14900,  // $149
    seasonal: 34900,  // $349
  },
  banner_sport: {
    label: "Sport Section Banner",
    weekly:   2900,
    monthly:  9900,
    seasonal: 22900,
  },
  team_sponsor: {
    label: "Team Page Sponsor",
    weekly:   1900,
    monthly:  5900,
    seasonal: 14900,
  },
  newsletter: {
    label: "Newsletter Sponsor (1 send)",
    weekly:   9900,   // per send, no weekly/seasonal
    monthly:  9900,
    seasonal: 9900,
  },
} as const;

export type AdSlotType = keyof typeof AD_PRICES;
export type AdDuration = "weekly" | "monthly" | "seasonal";
