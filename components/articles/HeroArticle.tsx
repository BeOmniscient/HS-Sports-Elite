import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";
import { formatDate } from "@/lib/utils";
import { getSportHex, sportToSlug } from "@/lib/utils";
import type { Article } from "@/types";

export function HeroArticle({ article }: { article: Article }) {
  const imgUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1400).height(700).fit("crop").url()
    : null;

  const sportHex = getSportHex(article.sport);
  const sportSlug = sportToSlug(article.sport);

  return (
    <Link href={`/articles/${article.slug?.current ?? article.slug}`} className="group block relative w-full overflow-hidden bg-brand-dark" style={{ minHeight: "480px" }}>
      {/* Background image */}
      {imgUrl ? (
        <div className="absolute inset-0">
          <Image src={imgUrl} alt={article.title} fill priority className="object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-80" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-950" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Sport color accent bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: sportHex }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full min-h-[480px] p-6 md:p-10">
        <div className="max-w-3xl">
          {/* Sport tag */}
          <Link
            href={`/sports/${sportSlug}`}
            className="inline-block text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 mb-4 rounded-sm"
            style={{ backgroundColor: sportHex }}
            onClick={(e) => e.stopPropagation()}
          >
            {article.sport}
          </Link>

          {/* Headline */}
          <h1 className="text-white font-black text-2xl md:text-4xl lg:text-5xl leading-tight tracking-tight mb-3 group-hover:text-gray-100 transition-colors">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4 line-clamp-2 max-w-2xl">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-white/50 text-xs uppercase tracking-widest font-medium">
            {article.school && <span>{article.school}</span>}
            {article.school && <span>·</span>}
            <span>{formatDate(article.publishedAt)}</span>
            <span className="ml-2 bg-white/10 text-white/70 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase">
              Read Story →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
