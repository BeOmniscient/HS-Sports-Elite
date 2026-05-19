import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { urlFor } from "@/lib/sanity/client";
import { formatDate, truncate } from "@/lib/utils";
import { SportBadge } from "@/components/ui/SportBadge";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  size?: "sm" | "md" | "lg";
  showExcerpt?: boolean;
}

export function ArticleCard({ article, size = "md", showExcerpt = true }: ArticleCardProps) {
  const imgUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(600).height(340).fit("crop").url()
    : null;

  if (size === "sm") {
    return (
      <Link href={`/articles/${article.slug?.current ?? article.slug}`} className="group flex gap-3 items-start">
        {imgUrl && (
          <div className="relative flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100">
            <Image src={imgUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <SportBadge sport={article.sport} size="sm" />
          <h3 className="text-sm font-bold text-gray-900 leading-tight mt-1 group-hover:text-brand-red transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug?.current ?? article.slug}`} className="group block bg-white rounded overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {imgUrl ? (
          <Image src={imgUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-white/20 text-4xl font-black">{article.sport?.[0]}</span>
          </div>
        )}
        {article.isPremium && (
          <div className="absolute top-2 right-2 bg-brand-red text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <SportBadge sport={article.sport} />
          {article.school && (
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">{article.school}</span>
          )}
        </div>
        <h2 className={`font-black text-gray-900 leading-tight group-hover:text-brand-red transition-colors ${size === "lg" ? "text-xl" : "text-base"}`}>
          {article.title}
        </h2>
        {showExcerpt && article.excerpt && (
          <p className="text-gray-500 text-sm mt-1.5 leading-snug line-clamp-2">
            {truncate(article.excerpt, 120)}
          </p>
        )}
        <p className="text-[11px] text-gray-400 mt-3 uppercase tracking-wide font-medium">
          {formatDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
