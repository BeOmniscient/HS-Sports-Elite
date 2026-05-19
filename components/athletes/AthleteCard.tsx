import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";
import type { Athlete } from "@/types";

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  const photoUrl = athlete.photo
    ? urlFor(athlete.photo).width(200).height(200).fit("crop").url()
    : null;

  return (
    <Link href={`/athletes/${athlete.slug?.current ?? athlete.slug}`} className="group flex items-center gap-3 p-3 rounded hover:bg-gray-50 transition-colors">
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {photoUrl ? (
          <Image src={photoUrl} alt={athlete.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-red to-red-800 flex items-center justify-center text-white font-black text-lg">
            {athlete.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm text-gray-900 group-hover:text-brand-red transition-colors truncate">{athlete.name}</p>
        <p className="text-[11px] text-gray-500 truncate">{athlete.school}</p>
        {athlete.sports?.length > 0 && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">{athlete.sports.join(" · ")}</p>
        )}
      </div>
    </Link>
  );
}
