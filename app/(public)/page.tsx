import { Suspense } from "react";
import { getFeaturedArticle, getLatestArticles, getArticlesBySport, getAllAthletes } from "@/lib/sanity/queries";
import { HeroArticle } from "@/components/articles/HeroArticle";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AthleteCard } from "@/components/athletes/AthleteCard";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import Link from "next/link";
import { ALL_SPORTS, SPORT_SLUG, SPORT_HEX } from "@/types";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest, athletes, footballArticles, basketballArticles] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getLatestArticles(12).catch(() => []),
    getAllAthletes().catch(() => []),
    getArticlesBySport("Football", 4).catch(() => []),
    getArticlesBySport("Basketball", 4).catch(() => []),
  ]);

  const grid = featured ? latest.filter((a) => a._id !== featured._id).slice(0, 9) : latest.slice(0, 9);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      {featured && <HeroArticle article={featured} />}

      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Main column ── */}
          <div className="space-y-12">

            {/* Latest News */}
            <section>
              <SectionHeader title="Latest News" href="/articles" />
              {grid.length > 0 ? (
                <div className="article-grid">
                  {grid.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-8 text-center">No articles yet — check back soon.</p>
              )}
              <div className="mt-6 text-center">
                <Link href="/articles" className="inline-block border border-gray-300 hover:border-brand-red text-gray-500 hover:text-brand-red text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm transition-colors">
                  Load More Stories
                </Link>
              </div>
            </section>

            {/* Football */}
            {footballArticles.length > 0 && (
              <SportSection sport="Football" articles={footballArticles} />
            )}

            {/* Mid-page ad */}
            <AdSlotBanner slotId="banner_home_mid" />

            {/* Basketball */}
            {basketballArticles.length > 0 && (
              <SportSection sport="Basketball" articles={basketballArticles} />
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-8">

            {/* Subscribe CTA */}
            <div className="bg-brand-dark text-white rounded-sm p-5 border-l-4 border-brand-red">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Go Premium</p>
              <h3 className="font-black text-lg leading-tight mb-2">Never miss a big NJ sports moment</h3>
              <p className="text-white/60 text-xs mb-4 leading-relaxed">Unlock premium stories, full stat breakdowns, and exclusive athlete profiles.</p>
              <Link href="/subscribe" className="block bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center px-4 py-2.5 rounded-sm transition-colors">
                Subscribe — $5/mo
              </Link>
            </div>

            {/* Ad slot */}
            <AdSlotBanner slotId="sidebar_home" />

            {/* Featured Athletes */}
            {athletes.length > 0 && (
              <div>
                <SectionHeader title="Top Athletes" href="/athletes" linkLabel="View All" />
                <div className="bg-white border border-gray-100 rounded-sm divide-y divide-gray-50">
                  {athletes.slice(0, 6).map((athlete) => (
                    <AthleteCard key={athlete._id} athlete={athlete} />
                  ))}
                </div>
              </div>
            )}

            {/* Browse by Sport */}
            <div>
              <SectionHeader title="Browse by Sport" />
              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden divide-y divide-gray-50">
                {ALL_SPORTS.map((sport) => {
                  const slug = SPORT_SLUG[sport];
                  const hex = SPORT_HEX[slug] ?? "#e8002d";
                  return (
                    <Link
                      key={sport}
                      href={`/sports/${slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-red transition-colors">
                        {sport}
                      </span>
                      <span className="ml-auto text-gray-300 group-hover:text-brand-red text-xs transition-colors">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel = "See All →" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 bg-brand-red rounded-full" />
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-[11px] text-gray-400 hover:text-brand-red font-bold uppercase tracking-wide transition-colors">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function SportSection({ sport, articles }: { sport: string; articles: Awaited<ReturnType<typeof getArticlesBySport>> }) {
  const slug = SPORT_SLUG[sport as keyof typeof SPORT_SLUG] ?? sport.toLowerCase();
  const hex = SPORT_HEX[slug] ?? "#e8002d";

  return (
    <section>
      {/* Section header with sport color accent */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">{sport}</h2>
        </div>
        <Link href={`/sports/${slug}`} className="text-[11px] text-gray-400 hover:text-brand-red font-bold uppercase tracking-wide transition-colors">
          See All →
        </Link>
      </div>

      {/* 4-column card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} size="md" showExcerpt={false} />
        ))}
      </div>
    </section>
  );
}
