"use client";

import dynamic from "next/dynamic";
import config from "@/sanity.config";

const NextStudio = dynamic(() => import("next-sanity/studio").then((m) => m.NextStudio), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[#101112] text-white/40 text-sm">
      Loading Studio…
    </div>
  ),
});

export default function StudioPage() {
  return <NextStudio config={config} />;
}
