import { sanityWriteClient } from "@/lib/sanity/client";

export type SanityImageRef = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

// ── Layer 1: extract image URL from raw RSS feed item XML ─────────────────────
export function extractFeedImage(itemXml: string): string | null {
  const patterns = [
    /media:content[^>]+url="([^"]+)"/i,
    /media:content[^>]+url='([^']+)'/i,
    /<enclosure[^>]+url="([^"]+)"[^>]+type="image[^"]*"/i,
    /<enclosure[^>]+type="image[^"]*"[^>]+url="([^"]+)"/i,
    /media:thumbnail[^>]+url="([^"]+)"/i,
    /media:thumbnail[^>]+url='([^']+)'/i,
  ];
  for (const re of patterns) {
    const match = itemXml.match(re)?.[1];
    if (match && isValidImageUrl(match)) return match;
  }
  return null;
}

// ── Layer 2: scrape og:image / twitter:image from source URL ─────────────────
export async function scrapeOgImage(sourceUrl: string): Promise<string | null> {
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
      html.match(/<meta[^>]+property="og:image:secure_url"[^>]+content="([^"]+)"/i)?.[1],
    ];

    for (const candidate of candidates) {
      if (candidate && isValidImageUrl(candidate)) return candidate;
    }
  } catch {
    // timeout or network error — not fatal
  }
  return null;
}

// ── Layer 3: Unsplash API fallback by sport ───────────────────────────────────
const _unsplashCache = new Map<string, string>();

export async function getUnsplashImage(sport: string): Promise<string | null> {
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
    // Pick a random result from the top 5 for variety
    const results = data.results ?? [];
    if (results.length === 0) return null;
    const pick = results[Math.floor(Math.random() * results.length)].urls.regular;
    _unsplashCache.set(cacheKey, pick);
    return pick;
  } catch {
    return null;
  }
}

// ── Upload image URL → Sanity asset → return reference ───────────────────────
export async function uploadImageToSanity(imageUrl: string): Promise<SanityImageRef | null> {
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

    const asset = await sanityWriteClient.assets.upload("image", buffer, {
      filename: `auto-image-${Date.now()}.${ext}`,
      contentType,
    });

    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } catch {
    return null;
  }
}

// ── Orchestrator: run all three layers in priority order ─────────────────────
export async function fetchAndUploadArticleImage(opts: {
  feedItemXml?: string;
  sourceUrl?: string;
  sport?: string;
}): Promise<SanityImageRef | null> {
  // Layer 1 — RSS feed
  if (opts.feedItemXml) {
    const feedUrl = extractFeedImage(opts.feedItemXml);
    if (feedUrl) {
      const ref = await uploadImageToSanity(feedUrl);
      if (ref) return ref;
    }
  }

  // Layer 2 — OG scrape
  if (opts.sourceUrl) {
    const ogUrl = await scrapeOgImage(opts.sourceUrl);
    if (ogUrl) {
      const ref = await uploadImageToSanity(ogUrl);
      if (ref) return ref;
    }
  }

  // Layer 3 — Unsplash fallback
  if (opts.sport) {
    const unsplashUrl = await getUnsplashImage(opts.sport);
    if (unsplashUrl) {
      const ref = await uploadImageToSanity(unsplashUrl);
      if (ref) return ref;
    }
  }

  return null;
}

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
