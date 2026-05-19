"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  priceId: string;
  label: string;
  variant?: "solid" | "outline";
}

export function SubscribeButton({ priceId, label, variant = "solid" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
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
      className={cn(
        "w-full text-sm font-bold uppercase tracking-widest py-3 rounded-sm transition-colors disabled:opacity-50",
        variant === "solid"
          ? "bg-brand-red hover:bg-red-600 text-white"
          : "border border-white/30 hover:border-white text-white"
      )}
    >
      {loading ? "Loading…" : label}
    </button>
  );
}
