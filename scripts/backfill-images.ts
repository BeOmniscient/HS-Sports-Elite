/**
 * One-time backfill: fetches images for all articles that have a sourceUrl
 * but no featuredImage, using OG scraping → Unsplash fallback.
 *
 * Usage:
 *   npm run backfill-images
 *
 * Set UNSPLASH_ACCESS_KEY in .env.local for Unsplash fallback (optional).
 */

import { createClient } from "@sanity/client";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// ── Image helpers (inlined to avoid @/ path alias issues in ts-node) ──────────

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function scrapeOgImage(sourceUrl: string): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HSSportsBot/1.0; +https://highschoolsportselite.com)" },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const candidates = [
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1],
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1],
      html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)?.[1],
      html.match(/<meta[^>]+content="([^"]+)"[^>]+name="twitter:image"/i)?.[1],
    ];

    for (const c of candidates) {
      if (c && isValidImageUrl(c)) return c;
    }
  } catch {
    // not fatal
  }
  return null;
}

const _unsplashCache = new Map<string, string>();

async function getUnsplashImage(sport: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const cacheKey = sport.toLowerCase();
  if (_unsplashCache.has(cacheKey)) return _unsplashCache.get(cacheKey)!;

  try {
    const query = encodeURIComponent(`${sport} high school sports athlete`);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=5&orientation=landscape&client_id=${key}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as { results: { urls: { regular: string } }[] };
    const results = data.results ?? [];
    if (results.length === 0) return null;
    const pick = results[Math.floor(Math.random() * results.length)].urls.regular;
    _unsplashCache.set(cacheKey, pick);
    return pick;
  } catch {
    return null;
  }
}

async function uploadImageToSanity(imageUrl: string): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } } | null> {
  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HSSportsBot/1.0)" },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";

    const asset = await client.assets.upload("image", buffer, {
      filename: `backfill-${Date.now()}.${ext}`,
      contentType,
    });

    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface ArticleStub {
  _id: string;
  title: string;
  sport: string;
  sourceUrl?: string;
}

async function main() {
  console.log("🖼️  HS Sports Elite — Image Backfill");
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Unsplash fallback: ${process.env.UNSPLASH_ACCESS_KEY ? "✅ enabled" : "⚠️  disabled (no key)"}\n`);

  // Fetch all articles missing a featuredImage that have a sourceUrl
  const articles: ArticleStub[] = await client.fetch(
    `*[_type == "article" && defined(sourceUrl) && !defined(featuredImage)] | order(publishedAt desc) {
      _id, title, sport, sourceUrl
    }`
  );

  console.log(`Found ${articles.length} articles without images.\n`);

  if (articles.length === 0) {
    console.log("Nothing to backfill. All done!");
    return;
  }

  let withOg = 0;
  let withUnsplash = 0;
  let failed = 0;
  let processed = 0;

  for (const article of articles) {
    processed++;

    // Layer 2 — OG scrape
    let imageRef = null;
    if (article.sourceUrl) {
      const ogUrl = await scrapeOgImage(article.sourceUrl);
      if (ogUrl) {
        imageRef = await uploadImageToSanity(ogUrl);
        if (imageRef) withOg++;
      }
    }

    // Layer 3 — Unsplash fallback
    if (!imageRef && article.sport) {
      const unsplashUrl = await getUnsplashImage(article.sport);
      if (unsplashUrl) {
        imageRef = await uploadImageToSanity(unsplashUrl);
        if (imageRef) withUnsplash++;
      }
    }

    if (imageRef) {
      await client.patch(article._id).set({ featuredImage: imageRef }).commit();
    } else {
      failed++;
    }

    if (processed % 25 === 0) {
      console.log(`  ${processed}/${articles.length} processed — ${withOg} OG, ${withUnsplash} Unsplash, ${failed} failed`);
    }

    // Respect Sanity rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   OG images:      ${withOg}`);
  console.log(`   Unsplash:       ${withUnsplash}`);
  console.log(`   No image found: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
