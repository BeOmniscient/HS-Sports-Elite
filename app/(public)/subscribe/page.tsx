import type { Metadata } from "next";
import { CheckCircle, Lock, Zap } from "lucide-react";
import { SubscribeButton } from "./SubscribeButton";

export const metadata: Metadata = {
  title: "Subscribe — HS Sports Elite",
  description: "Unlock premium NJ high school sports coverage. Full stories, athlete profiles, and exclusive analysis.",
};

const FREE_FEATURES = [
  "Breaking scores & results",
  "Latest news headlines",
  "School & sport archives",
  "Athlete profiles (basic)",
];

const PREMIUM_FEATURES = [
  "Full-length feature stories",
  "In-depth athlete profiles & stats",
  "Exclusive recruiting coverage",
  "Full playoff & bracket analysis",
  "Premium video highlights",
  "Weekly insider newsletter",
  "No ads",
];

export default function SubscribePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-brand-dark text-white py-16 px-4 text-center">
        <Zap className="w-8 h-8 text-brand-red fill-brand-red mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Go Premium. Go Deep.
        </h1>
        <p className="text-white/60 text-lg max-w-lg mx-auto">
          The full story behind Northern NJ's best athletes and biggest games — only on HS Sports Elite.
        </p>
      </div>

      <div className="max-w-screen-md mx-auto px-4 py-12">
        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-black text-xl mb-1">Free</h3>
            <div className="text-3xl font-black mb-4 text-gray-400">$0</div>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full border border-gray-200 text-gray-400 text-sm font-bold uppercase tracking-wide py-2.5 rounded-sm cursor-default">
              Current Plan
            </button>
          </div>

          {/* Premium */}
          <div className="bg-brand-dark text-white rounded-lg border-2 border-brand-red p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">
              Most Popular
            </div>
            <h3 className="font-black text-xl mb-1">Elite</h3>
            <div className="mb-1">
              <span className="text-3xl font-black">$5</span>
              <span className="text-white/50 text-sm"> / month</span>
            </div>
            <p className="text-white/40 text-xs mb-4">or $49/year — save 18%</p>
            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <CheckCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <SubscribeButton priceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? ""} label="Subscribe Monthly — $5/mo" />
              <SubscribeButton priceId={process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ?? ""} label="Subscribe Annually — $49/yr" variant="outline" />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="font-black text-lg text-center mb-6">Common Questions</h3>
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings and you keep access through the end of your billing period. No questions asked." },
            { q: "What payment methods do you accept?", a: "All major credit and debit cards via Stripe. Your payment info is never stored on our servers." },
            { q: "Is there a student discount?", a: "We're working on it. Email us at team@highschoolsportselite.com and we'll sort you out." },
            { q: "What if I'm a coach or school official?", a: "We offer complimentary access for coaches covering their own teams. Reach out directly." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded p-5">
              <h4 className="font-bold text-sm mb-1">{q}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Payments secured by Stripe. Cancel any time.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
