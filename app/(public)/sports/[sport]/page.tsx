import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesBySport } from "@/lib/sanity/queries";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { SportBadge } from "@/components/ui/SportBadge";
import { slugToSport, getSportHex } from "@/lib/utils";
import { ALL_SPORTS, SPORT_SLUG } from "@/types";

export const revalidate = 300;

export const dynamicParams = true;

export async function generateStaticParams() {
  return Object.values(SPORT_SLUG).map((sport) => ({ sport }));
}

export async function generateMetadata({ params }: { params: Promise<{ sport: string }> }): Promise<Metadata> {
  const { sport } = await params;
  const sportName = slugToSport(sport);
  return {
    title: `${sportName} — Northern NJ High School Sports`,
    description: `Latest ${sportName} news, scores, and stories from Northern NJ high schools.`,
  };
}

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  const sportName = slugToSport(sport);
  const isValidSport = ALL_SPORTS.some((s) => SPORT_SLUG[s] === sport);
  if (!isValidSport) notFound();

  const articles = await getArticlesBySport(sportName, 18).catch(() => []);
  const sportHex = getSportHex(sport);
  const [hero, ...rest] = articles;

  return (
    <div className="bg-gray-50">
      {/* Sport header */}
      <div className="bg-brand-dark text-white py-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="h-1 w-12 rounded mb-4" style={{ backgroundColor: sportHex }} />
          <div className="flex items-center gap-3 mb-1">
            <SportBadge sport={sportName} size="md" asLink={false} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{sportName}</h1>
          <p className="text-white/50 text-sm mt-2">Northern NJ High School {sportName} Coverage</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {hero && (
              <div className="mb-8">
                <ArticleCard article={hero} size="lg" />
              </div>
            )}
            {rest.length > 0 && (
              <div className="article-grid">
                {rest.map((article) => <ArticleCard key={article._id} article={article} />)}
              </div>
            )}
            {articles.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-bold">No {sportName} stories yet.</p>
                <p className="text-sm mt-2">Check back soon — we're always covering the latest action.</p>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <AdSlotBanner slotId={`banner_sport_${sport}`} />
            <div className="bg-white rounded border border-gray-100 p-4">
              <h3 className="section-heading">Other Sports</h3>
              <div className="flex flex-wrap gap-2">
                {ALL_SPORTS.filter((s) => SPORT_SLUG[s] !== sport).map((s) => (
                  <SportBadge key={s} sport={s} size="sm" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
