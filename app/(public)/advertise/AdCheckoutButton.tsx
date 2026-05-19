"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { AdDuration, AdSlotType } from "@/lib/stripe/client";

const DURATION_LABEL: Record<AdDuration, string> = {
  weekly: "1 Week",
  monthly: "1 Month",
  seasonal: "Season",
};

interface AdCheckoutButtonProps {
  slotId: AdSlotType;
  slotLabel: string;
  duration: AdDuration;
  priceCents: number;
}

export function AdCheckoutButton({ slotId, slotLabel, duration, priceCents }: AdCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, slotLabel, duration, priceCents }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex flex-col items-center gap-1 border border-gray-200 hover:border-brand-red hover:bg-red-50 rounded p-3 text-center transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide group-hover:text-brand-red">{DURATION_LABEL[duration]}</span>
      <span className="text-base font-black text-gray-900 group-hover:text-brand-red">{formatCurrency(priceCents)}</span>
      <span className="text-[10px] text-gray-300 group-hover:text-brand-red/60">
        {loading ? "Loading…" : "Buy Now"}
      </span>
    </button>
  );
}
