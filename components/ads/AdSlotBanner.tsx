import Link from "next/link";

interface AdSlotBannerProps {
  slotId: string;
  creative?: { imageUrl: string; linkUrl: string; altText: string } | null;
  className?: string;
}

export function AdSlotBanner({ slotId, creative, className }: AdSlotBannerProps) {
  if (!creative) {
    return (
      <div className={`bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300 text-xs font-medium py-6 ${className}`}>
        <Link href="/advertise" className="hover:text-brand-red transition-colors">
          Advertise Here — Learn More →
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={creative.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block overflow-hidden rounded ${className}`}
      data-ad-slot={slotId}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={creative.imageUrl} alt={creative.altText} className="w-full h-auto" />
    </Link>
  );
}
