import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SportBadge } from "@/components/ui/SportBadge";
import { ALL_SPORTS, SPORT_SLUG } from "@/types";
import type { Article } from "@/types";

export const revalidate = 300;

export const metadata = {
  title: "Scores | HS Sports Elite",
  description: "Latest Northern NJ high school sports scores and game results.",
};

const articleFields = `
  _id, title, "slug": slug.current, publishedAt, sport, excerpt, isPremium, source, sourceUrl,
  featuredImage { asset, alt, hotspot }
`;

// Articles whose titles likely contain game scores
async function getScoreArticles(sport?: string): Promise<Article[]> {
  const sportFilter = sport ? `&& sport == $sport` : "";
  return sanityClient
    .fetch(
      `*[_type == "article" ${sportFilter} && (
        title match "*-*" ||
        title match "*defeat*" ||
        title match "*beats*" ||
        title match "*wins*" ||
        title match "*blanks*" ||
        title match "*rallies*" ||
        title match "*shutout*" ||
        title match "*victory*" ||
        title match "*score*"
      )] | order(publishedAt desc) [0...24] { ${articleFields} }`,
      sport ? { sport } : {}
    )
    .catch(() => []);
}

async function getRecentBySport(sport: string): Promise<Article[]> {
  return sanityClient
    .fetch(
      `*[_type == "article" && sport == $sport] | order(publishedAt desc) [0...4] { ${articleFields} }`,
      { sport }
    )
    .catch(() => []);
}

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const activeSport = ALL_SPORTS.find((s) => SPORT_SLUG[s] === sport);

  const [scoreArticles, recentBySport] = await Promise.all([
    getScoreArticles(activeSport),
    activeSport ? getRecentBySport(activeSport) : Promise.resolve([]),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-brand-dark border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <h1 className="text-white font-black text-2xl tracking-tight">
            Scores &amp; Results
          </h1>
          <p className="text-white/50 text-sm mt-1">Northern NJ high school sports</p>
        </div>

        {/* Sport filter tabs */}
        <div className="max-w-screen-xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-0 pb-0">
            <Link
              href="/scores"
              className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-widest px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                !sport
                  ? "border-brand-red text-white"
                  : "border-transparent text-white/50 hover:text-white hover:border-brand-red"
              }`}
            >
              All Sports
            </Link>
            {ALL_SPORTS.map((s) => (
              <Link
                key={s}
                href={`/scores?sport=${SPORT_SLUG[s]}`}
                className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-widest px-3 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                  activeSport === s
                    ? "border-brand-red text-white"
                    : "border-transparent text-white/50 hover:text-white hover:border-brand-red"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main content */}
          <div>
            {/* Game results articles */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="section-heading">
                {activeSport ? `${activeSport} Results` : "Recent Game Results"}
              </h2>
              {activeSport && (
                <SportBadge sport={activeSport} size="md" />
              )}
            </div>

            {scoreArticles.length > 0 ? (
              <div className="article-grid">
                {scoreArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-bold">No results yet</p>
                <p className="text-sm mt-1">Check back after this weekend&apos;s games.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Live scores CTA */}
            <div className="bg-brand-dark text-white rounded p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Coming Soon</p>
              <h3 className="font-black text-base leading-tight mb-2">Live Play-by-Play Scores</h3>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Real-time scoreboard integration with ScoreStream is on the way — covering every Northern NJ game as it happens.
              </p>
              <Link
                href="/subscribe"
                className="block bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center px-4 py-2.5 rounded-sm transition-colors"
              >
                Subscribe for Alerts
              </Link>
            </div>

            {/* Browse by sport */}
            <div>
              <h2 className="section-heading">Browse by Sport</h2>
              <div className="space-y-1">
                {ALL_SPORTS.map((s) => (
                  <Link
                    key={s}
                    href={`/scores?sport=${SPORT_SLUG[s]}`}
                    className={`flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-colors ${
                      activeSport === s
                        ? "bg-brand-red text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                    <span className="text-xs opacity-50">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent articles for selected sport */}
            {activeSport && recentBySport.length > 0 && (
              <div>
                <h2 className="section-heading">{activeSport} News</h2>
                <div className="space-y-4">
                  {recentBySport.map((article) => (
                    <ArticleCard key={article._id} article={article} size="sm" showExcerpt={false} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
