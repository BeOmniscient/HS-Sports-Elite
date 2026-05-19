import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { SPORT_HEX } from "@/types";
import { formatDate } from "@/lib/utils";

interface TickerArticle {
  _id: string;
  title: string;
  slug: string;
  sport: string;
  publishedAt: string;
}

async function getTickerArticles(): Promise<TickerArticle[]> {
  return sanityClient
    .fetch(
      `*[_type == "article"] | order(publishedAt desc) [0...10] {
        _id, title, "slug": slug.current, sport, publishedAt
      }`
    )
    .catch(() => []);
}

export async function ScoresWidget() {
  const articles = await getTickerArticles();

  if (articles.length === 0) {
    return (
      <div className="bg-brand-dark">
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-3 min-h-[36px]">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-red flex-shrink-0">
            Latest
          </span>
          <span className="text-white/30 text-[10px] uppercase tracking-widest">
            Northern NJ High School Sports
          </span>
        </div>
      </div>
    );
  }

  // Duplicate items so the marquee loops seamlessly
  const items = [...articles, ...articles];

  return (
    <div className="bg-brand-dark text-white overflow-hidden">
      <div className="flex items-center min-h-[36px]">
        {/* Static label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 bg-brand-red h-full min-h-[36px] z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
            Latest
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {items.map((article, i) => {
              const hex = SPORT_HEX[article.sport?.toLowerCase().replace(/ /g, "-")] ?? "#ef4444";
              return (
                <Link
                  key={`${article._id}-${i}`}
                  href={`/articles/${article.slug}`}
                  className="flex items-center gap-2 px-5 text-white/70 hover:text-white transition-colors flex-shrink-0 group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[11px] font-medium whitespace-nowrap group-hover:text-white transition-colors">
                    {article.title}
                  </span>
                  <span className="text-[10px] text-white/30 whitespace-nowrap">
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="text-white/20 ml-3">·</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
