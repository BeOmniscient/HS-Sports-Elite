import { Suspense } from "react";
import { getFeaturedArticle, getLatestArticles, getArticlesBySport, getAllAthletes } from "@/lib/sanity/queries";
import { HeroArticle } from "@/components/articles/HeroArticle";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AthleteCard } from "@/components/athletes/AthleteCard";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { SportBadge } from "@/components/ui/SportBadge";
import Link from "next/link";
import { ALL_SPORTS, SPORT_SLUG } from "@/types";

export const revalidate = 300; // revalidate every 5 minutes

export default async function HomePage() {
  const [featured, latest, athletes, footballArticles, basketballArticles] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getLatestArticles(9).catch(() => []),
    getAllAthletes().catch(() => []),
    getArticlesBySport("Football", 4).catch(() => []),
    getArticlesBySport("Basketball", 4).catch(() => []),
  ]);

  const grid = featured ? latest.filter((a) => a._id !== featured._id).slice(0, 8) : latest.slice(0, 8);

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      {featured && <HeroArticle article={featured} />}

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main feed */}
          <div>
            {/* Latest news */}
            <div className="mb-10">
              <h2 className="section-heading">Latest News</h2>
              <div className="article-grid">
                {grid.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/articles" className="inline-block border border-gray-300 hover:border-brand-red text-gray-600 hover:text-brand-red text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm transition-colors">
                  Load More Stories
                </Link>
              </div>
            </div>

            {/* Football section */}
            {footballArticles.length > 0 && (
              <SportSection sport="Football" articles={footballArticles} />
            )}

            {/* Mid-page ad */}
            <AdSlotBanner slotId="banner_home_mid" className="mb-10" />

            {/* Basketball section */}
            {basketballArticles.length > 0 && (
              <SportSection sport="Basketball" articles={basketballArticles} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Subscribe CTA */}
            <div className="bg-brand-dark text-white rounded p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Go Premium</p>
              <h3 className="font-black text-lg leading-tight mb-2">Never miss a big NJ sports moment</h3>
              <p className="text-white/60 text-xs mb-4 leading-relaxed">Unlock premium stories, full stat breakdowns, and exclusive athlete profiles.</p>
              <Link href="/subscribe" className="block bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center px-4 py-2.5 rounded-sm transition-colors">
                Subscribe — $5/mo
              </Link>
            </div>

            {/* Ad slot */}
            <AdSlotBanner slotId="sidebar_home" />

            {/* Top athletes */}
            <div>
              <h2 className="section-heading">Featured Athletes</h2>
              <div className="space-y-1">
                {athletes.slice(0, 8).map((athlete) => (
                  <AthleteCard key={athlete._id} athlete={athlete} />
                ))}
              </div>
              <Link href="/athletes" className="block text-center text-xs text-gray-400 hover:text-brand-red mt-3 font-medium transition-colors">
                View All Athletes →
              </Link>
            </div>

            {/* Browse by sport */}
            <div>
              <h2 className="section-heading">Browse by Sport</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_SPORTS.map((sport) => (
                  <SportBadge key={sport} sport={sport} size="md" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SportSection({ sport, articles }: { sport: string; articles: Awaited<ReturnType<typeof getArticlesBySport>> }) {
  const slug = SPORT_SLUG[sport as keyof typeof SPORT_SLUG] ?? sport.toLowerCase();
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SportBadge sport={sport} size="md" asLink={false} />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">{sport}</h2>
        </div>
        <Link href={`/sports/${slug}`} className="text-[11px] text-gray-400 hover:text-brand-red font-bold uppercase tracking-wide transition-colors">
          See All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles[0] && <ArticleCard article={articles[0]} size="lg" />}
        <div className="space-y-4">
          {articles.slice(1).map((article) => (
            <ArticleCard key={article._id} article={article} size="sm" showExcerpt={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
