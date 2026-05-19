import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getAthleteBySlug, getAllAthletes } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SportBadge } from "@/components/ui/SportBadge";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";

export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const athletes = await getAllAthletes();
    return athletes.map((a) => ({ slug: a.slug?.current ?? a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const athlete = await getAthleteBySlug(slug);
  if (!athlete) return {};
  return {
    title: `${athlete.name} — ${athlete.school}`,
    description: athlete.bio ? athlete.bio.slice(0, 155) : `Athlete profile for ${athlete.name} at ${athlete.school}.`,
  };
}

export default async function AthletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const athlete = await getAthleteBySlug(slug);
  if (!athlete) notFound();

  const photoUrl = athlete.photo
    ? urlFor(athlete.photo).width(400).height(400).fit("crop").url()
    : null;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-brand-dark text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border-4 border-brand-red">
              {photoUrl ? (
                <Image src={photoUrl} alt={athlete.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red to-red-900 flex items-center justify-center text-white font-black text-4xl">
                  {athlete.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{athlete.name}</h1>
              <p className="text-white/60 text-sm mt-1">{athlete.school}</p>
              {athlete.gradYear && (
                <p className="text-white/40 text-xs mt-0.5 uppercase tracking-wider">Class of {athlete.gradYear}</p>
              )}
              {athlete.hometown && (
                <p className="text-white/40 text-xs mt-0.5">{athlete.hometown}</p>
              )}
              {athlete.sports?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {athlete.sports.map((sport) => (
                    <SportBadge key={sport} sport={sport} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {/* Bio */}
            {athlete.bio && (
              <div className="bg-white rounded border border-gray-100 p-6 mb-8">
                <h2 className="section-heading">About</h2>
                <p className="text-gray-700 leading-relaxed text-sm">{athlete.bio}</p>
              </div>
            )}

            {/* Related articles */}
            {athlete.relatedArticles && athlete.relatedArticles.length > 0 && (
              <div>
                <h2 className="section-heading">In The News</h2>
                <div className="article-grid">
                  {athlete.relatedArticles.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <AdSlotBanner slotId="sidebar_athlete" />
          </aside>
        </div>
      </div>
    </div>
  );
}
