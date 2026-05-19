import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { getArticleBySlug, getAllArticleSlugs, getArticlesBySport } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { formatDate, getSportHex, sportToSlug } from "@/lib/utils";
import { SportBadge } from "@/components/ui/SportBadge";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { PortableText } from "@portabletext/react";

export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage
        ? [urlFor(article.featuredImage).width(1200).height(630).fit("crop").url()]
        : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getArticlesBySport(article.sport, 4);
  const otherRelated = related.filter((a) => a._id !== article._id).slice(0, 3);
  const imgUrl = article.featuredImage
    ? urlFor(article.featuredImage).width(1200).height(600).fit("crop").url()
    : null;
  const sportHex = getSportHex(article.sport);

  return (
    <div className="bg-white">
      {/* Hero image */}
      {imgUrl && (
        <div className="relative w-full aspect-[21/9] max-h-[520px] bg-brand-dark overflow-hidden">
          <Image src={imgUrl} alt={article.title} fill priority className="object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* Article */}
          <article>
            {/* Sport accent bar */}
            <div className="h-1 w-16 rounded mb-4" style={{ backgroundColor: sportHex }} />

            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              <SportBadge sport={article.sport} size="md" />
              {article.school && (
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{article.school}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-950 leading-tight tracking-tight mb-4">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 pl-4 mb-6" style={{ borderColor: sportHex }}>
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-400 uppercase tracking-widest font-medium border-b border-gray-100 pb-4 mb-6">
              <span>{formatDate(article.publishedAt)}</span>
              {article.source === "rss" && article.sourceUrl && (
                <>
                  <span>·</span>
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">
                    Original Source ↗
                  </a>
                </>
              )}
            </div>

            {/* Body */}
            {article.isPremium ? (
              <PremiumGate excerpt={article.excerpt} />
            ) : article.content ? (
              <div className="prose prose-gray max-w-none prose-headings:font-black prose-a:text-brand-red prose-img:rounded">
                <PortableText value={article.content as never} />
              </div>
            ) : null}

            {/* Related athletes */}
            {article.relatedAthletes && article.relatedAthletes.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="section-heading mb-3">Athletes in This Story</h3>
                <div className="flex flex-wrap gap-2">
                  {article.relatedAthletes.map((athlete) => (
                    <Link
                      key={athlete._id}
                      href={`/athletes/${athlete.slug?.current ?? athlete.slug}`}
                      className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-brand-red transition-colors"
                    >
                      {athlete.name}
                      <span className="text-[10px] text-gray-400">{athlete.school}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8">
            <AdSlotBanner slotId="sidebar_article" />

            {otherRelated.length > 0 && (
              <div>
                <h3 className="section-heading">More {article.sport}</h3>
                <div className="space-y-4">
                  {otherRelated.map((a) => (
                    <ArticleCard key={a._id} article={a} size="sm" showExcerpt={false} />
                  ))}
                </div>
                <Link href={`/sports/${sportToSlug(article.sport)}`} className="block text-center text-xs text-gray-400 hover:text-brand-red mt-3 font-medium transition-colors">
                  All {article.sport} Stories →
                </Link>
              </div>
            )}

            <div className="bg-brand-dark text-white rounded p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Newsletter</p>
              <h3 className="font-black text-base leading-tight mb-3">NJ Sports Weekly Roundup</h3>
              <p className="text-white/60 text-xs mb-4">Top stories, scores & standouts — every Monday morning.</p>
              <NewsletterForm />
            </div>
          </aside>
        </div>

        {/* Bottom related articles */}
        {otherRelated.length > 0 && (
          <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="section-heading">More Stories</h2>
            <div className="article-grid">
              {otherRelated.map((a) => <ArticleCard key={a._id} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PremiumGate({ excerpt }: { excerpt?: string }) {
  return (
    <div className="relative">
      {excerpt && (
        <div className="prose prose-gray max-w-none mb-0">
          <p>{excerpt}</p>
        </div>
      )}
      {/* Fade + gate */}
      <div className="relative mt-4">
        <div className="h-24 bg-gradient-to-b from-transparent to-white absolute inset-x-0 top-0 z-10" />
        <div className="blur-sm text-gray-400 text-sm leading-relaxed line-clamp-4 pointer-events-none select-none">
          This is premium content available to HS Sports Elite subscribers. Subscribe to unlock the full story, exclusive athlete breakdowns, and deep-dive analysis on Northern NJ high school sports.
        </div>
      </div>
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded p-6 text-center">
        <Lock className="w-6 h-6 text-brand-red mx-auto mb-3" />
        <h3 className="font-black text-lg mb-2">Premium Content</h3>
        <p className="text-gray-500 text-sm mb-5">Subscribe to unlock this story and get unlimited access to all premium articles.</p>
        <Link href="/subscribe" className="inline-block bg-brand-red hover:bg-red-600 text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-sm transition-colors">
          Subscribe — $5/month
        </Link>
        <p className="text-xs text-gray-400 mt-3">Cancel anytime. Billed monthly or save with annual.</p>
      </div>
    </div>
  );
}

function NewsletterForm() {
  return (
    <form action="/api/newsletter" method="post" className="flex gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 text-xs px-3 py-2 rounded-sm outline-none focus:border-brand-red transition-colors"
      />
      <button type="submit" className="bg-brand-red hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-sm transition-colors flex-shrink-0">
        Join
      </button>
    </form>
  );
}
