import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Users, TrendingUp, MapPin } from "lucide-react";
import { AD_PRICES } from "@/lib/stripe/client";
import { AdCheckoutButton } from "./AdCheckoutButton";

export const metadata: Metadata = {
  title: "Advertise With Us",
  description: "Reach Northern NJ sports families, coaches, and fans. Sponsor a team page, newsletter, or site banner.",
};

const AD_SLOTS = [
  {
    id: "banner_home" as const,
    icon: "🏠",
    label: "Homepage Banner",
    description: "Top-of-page exposure on our highest-traffic page. Your brand is the first thing every visitor sees.",
    reach: "All site visitors",
    placement: "Homepage — above the fold",
  },
  {
    id: "banner_sport" as const,
    icon: "🏈",
    label: "Sport Section Banner",
    description: "Own the banner on a specific sport section — Football, Basketball, Baseball, and more. Hyper-targeted.",
    reach: "Sport-specific fans & families",
    placement: "Sport archive pages",
  },
  {
    id: "team_sponsor" as const,
    icon: "🎓",
    label: "Team Page Sponsor",
    description: "\"Brought to you by [Your Business]\" on a specific school's page. Perfect for local businesses.",
    reach: "School community, parents, fans",
    placement: "Individual school pages",
  },
  {
    id: "newsletter" as const,
    icon: "📧",
    label: "Newsletter Sponsor",
    description: "Exclusive sponsor of our weekly NJ Sports Roundup email. One advertiser per send. Direct inbox access.",
    reach: "Newsletter subscribers",
    placement: "Weekly email — Monday send",
  },
] as const;

const STATS = [
  { icon: Users, value: "5,000+", label: "Monthly readers" },
  { icon: MapPin, value: "37", label: "Schools covered" },
  { icon: TrendingUp, value: "400+", label: "Articles published" },
];

export default function AdvertisePage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-dark text-white py-16 px-4">
        <div className="max-w-screen-md mx-auto text-center">
          <p className="text-brand-red text-xs font-black uppercase tracking-widest mb-3">Advertise</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Reach Northern NJ Sports Families
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            HS Sports Elite connects you with the parents, coaches, and fans who care most about local high school sports. Hyper-local. Highly engaged.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-brand-red mx-auto mb-1" />
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad packages */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-center mb-2">Choose Your Package</h2>
        <p className="text-gray-500 text-sm text-center mb-10">All ads go live within 24 hours of payment. No contracts. Cancel or swap any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AD_SLOTS.map((slot) => {
            const prices = AD_PRICES[slot.id];
            return (
              <div key={slot.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-100">
                  <div className="text-3xl mb-3">{slot.icon}</div>
                  <h3 className="text-xl font-black mb-2">{slot.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{slot.description}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{slot.placement}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{slot.reach}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing tiers */}
                <div className="p-6 grid grid-cols-3 gap-3">
                  <AdCheckoutButton
                    slotId={slot.id}
                    slotLabel={slot.label}
                    duration="weekly"
                    priceCents={prices.weekly}
                  />
                  <AdCheckoutButton
                    slotId={slot.id}
                    slotLabel={slot.label}
                    duration="monthly"
                    priceCents={prices.monthly}
                  />
                  <AdCheckoutButton
                    slotId={slot.id}
                    slotLabel={slot.label}
                    duration="seasonal"
                    priceCents={prices.seasonal}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* What's included */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="font-black text-xl mb-6 text-center">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Live within 24 hours of payment",
              "Full-color display ad (we'll spec the dimensions)",
              "Click-through to your website or offer",
              "Basic impression & click reporting",
              "Swap your creative any time",
              "No long-term contracts — pay per period",
              "Direct contact with our team",
              "Free ad design assistance available",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise / direct */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need a custom sponsorship or season-long partnership?{" "}
            <Link href="/contact" className="text-brand-red font-bold hover:underline">
              Contact us directly →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
