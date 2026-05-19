import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolBySlug, getAllSchools, getArticlesBySchool } from "@/lib/sanity/queries";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";

export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const schools = await getAllSchools();
    return schools.map((s) => ({ school: s.slug?.current ?? s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }): Promise<Metadata> {
  const { school } = await params;
  const s = await getSchoolBySlug(school);
  if (!s) return {};
  return {
    title: `${s.name} Sports`,
    description: `High school sports coverage for ${s.name}${s.mascot ? ` — the ${s.mascot}` : ""}.`,
  };
}

export default async function SchoolPage({ params }: { params: Promise<{ school: string }> }) {
  const { school: schoolSlug } = await params;
  const [school, articles] = await Promise.all([
    getSchoolBySlug(schoolSlug).catch(() => null),
    getArticlesBySchool(schoolSlug, 18).catch(() => []),
  ]);
  if (!school) notFound();

  return (
    <div className="bg-gray-50">
      <div className="bg-brand-dark text-white py-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{school.name}</h1>
          {school.mascot && <p className="text-white/50 mt-1">{school.mascot}</p>}
          {school.location && <p className="text-white/40 text-sm mt-0.5">{school.location}</p>}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h2 className="section-heading">Latest Coverage</h2>
            {articles.length > 0 ? (
              <div className="article-grid">
                {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
              </div>
            ) : (
              <p className="text-gray-400 py-10 text-center">No articles yet for {school.name}.</p>
            )}
          </div>
          <aside>
            <AdSlotBanner slotId={`team_sponsor_${schoolSlug}`} />
          </aside>
        </div>
      </div>
    </div>
  );
}
