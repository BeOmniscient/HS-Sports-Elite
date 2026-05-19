import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";
import { fetchAndUploadArticleImage } from "@/lib/images/auto-image";

// Run daily via Vercel Cron (see vercel.json)
// Protected by CRON_SECRET header

const RSS_FEEDS = [
  { url: "https://news.google.com/rss/search?q=New+Jersey+high+school+sports+Bergen+County&hl=en-US&gl=US&ceid=US:en", defaultSport: null },
  { url: "https://news.google.com/rss/search?q=NJSIAA+football&hl=en-US&gl=US&ceid=US:en", defaultSport: "Football" },
  { url: "https://news.google.com/rss/search?q=NJSIAA+basketball&hl=en-US&gl=US&ceid=US:en", defaultSport: "Basketball" },
  { url: "https://news.google.com/rss/search?q=NJ+high+school+baseball+2026&hl=en-US&gl=US&ceid=US:en", defaultSport: "Baseball" },
  { url: "https://news.google.com/rss/search?q=Northern+NJ+high+school+soccer&hl=en-US&gl=US&ceid=US:en", defaultSport: "Soccer" },
  { url: "https://njathletics.net/blogs/news.atom", defaultSport: null },
];

const SPORT_KEYWORDS: Record<string, string> = {
  football: "Football", soccer: "Soccer", basketball: "Basketball",
  baseball: "Baseball", softball: "Baseball", wrestling: "Wrestling",
  volleyball: "Volleyball", tennis: "Tennis", golf: "Golf",
  gymnastics: "Gymnastics", track: "Outdoor Track", "cross country": "Outdoor Track",
};

function inferSport(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [kw, sport] of Object.entries(SPORT_KEYWORDS)) {
    if (lower.includes(kw)) return sport;
  }
  return null;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function GET(req: Request) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let imported = 0;
  let skipped = 0;
  let withImages = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { next: { revalidate: 0 } });
      const xml = await res.text();

      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      for (const [, itemXml] of items) {
        const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          ?? itemXml.match(/<title>(.*?)<\/title>/)?.[1]
          ?? "";
        const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1]
          ?? itemXml.match(/<guid>(.*?)<\/guid>/)?.[1]
          ?? "";
        const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
        const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
          ?? itemXml.match(/<description>(.*?)<\/description>/)?.[1]
          ?? "";

        if (!title || !link) continue;

        const fullText = `${title} ${description}`;
        const isNJRelevant = /\bnj\b|new jersey|bergen|passaic|essex|union|morris|hudson|northern valley|old tappan|njsiaa/i.test(fullText);
        if (!isNJRelevant) { skipped++; continue; }

        const sport = feed.defaultSport ?? inferSport(fullText);
        if (!sport) { skipped++; continue; }

        const slug = generateSlug(title);

        const existing = await sanityWriteClient.fetch(
          `*[_type == "article" && slug.current == $slug][0]._id`,
          { slug }
        );
        if (existing) { skipped++; continue; }

        const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
        const excerpt = description.replace(/<[^>]+>/g, "").slice(0, 300);

        // Fetch image (feed → OG → Unsplash)
        const featuredImage = await fetchAndUploadArticleImage({
          feedItemXml: itemXml,
          sourceUrl: link,
          sport,
        });

        await sanityWriteClient.create({
          _type: "article",
          title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
          slug: { _type: "slug", current: slug },
          publishedAt,
          sport,
          excerpt,
          isPremium: false,
          source: "rss",
          sourceUrl: link,
          ...(featuredImage && { featuredImage }),
        });

        imported++;
        if (featuredImage) withImages++;
      }
    } catch (err) {
      console.error(`RSS feed error for ${feed.url}:`, err);
    }
  }

  return NextResponse.json({ ok: true, imported, skipped, withImages });
}
