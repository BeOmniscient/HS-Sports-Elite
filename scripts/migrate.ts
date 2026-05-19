/**
 * One-time migration: imports all 401 articles + 50 athletes from
 * highschoolsportselite_full_scrape.json into Sanity.
 *
 * Usage:
 *   1. cp .env.local.example .env.local  (fill in SANITY vars)
 *   2. npm run migrate
 */

import { createClient } from "@sanity/client";
import * as fs from "fs";
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

interface RawArticle {
  slug: string;
  url: string;
  title: string;
  date: string;
  sport: string;
  school: string;
  content: string;
  excerpt: string;
  related_athletes: string[];
}

interface RawAthlete {
  id: string;
  name: string;
  school: string;
  sports: string;
  birthday: string;
  grad_year: string;
  hometown: string;
  bio: string;
  url: string;
}

function generateSanitySlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function parseSports(sportsStr: string): string[] {
  return sportsStr
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const map: Record<string, string> = {
        BASKETBALL: "Basketball", FOOTBALL: "Football", BASEBALL: "Baseball",
        SOCCER: "Soccer", WRESTLING: "Wrestling", VOLLEYBALL: "Volleyball",
        "OUTDOOR TRACK": "Outdoor Track", "INDOOR TRACK": "Indoor Track",
        TENNIS: "Tennis", GOLF: "Golf", GYMNASTICS: "Gymnastics",
      };
      return map[s] ?? s.charAt(0) + s.slice(1).toLowerCase();
    })
    .filter(Boolean);
}

function parseDate(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

async function migrateAthletes(athletes: RawAthlete[]): Promise<Map<string, string>> {
  console.log(`\n📋 Migrating ${athletes.length} athletes...`);
  const legacyIdToSanityId = new Map<string, string>();
  let count = 0;

  for (const athlete of athletes) {
    const slug = athlete.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "athlete" && legacyId == $id][0] { _id }`,
      { id: athlete.id }
    );

    if (existing) {
      legacyIdToSanityId.set(athlete.id, existing._id);
      continue;
    }

    const doc = {
      _type: "athlete",
      name: athlete.name,
      slug: { _type: "slug", current: slug },
      school: athlete.school?.replace(" High School", "").replace(" Regional High School", "") ?? "",
      sports: parseSports(athlete.sports ?? ""),
      gradYear: athlete.grad_year ? parseInt(athlete.grad_year) : undefined,
      hometown: athlete.hometown ?? "",
      bio: athlete.bio ?? "",
      legacyId: athlete.id,
    };

    const created = await client.create(doc);
    legacyIdToSanityId.set(athlete.id, created._id);
    count++;

    if (count % 10 === 0) process.stdout.write(".");
  }

  console.log(`\n✅ Athletes: ${count} created, ${athletes.length - count} skipped (already exist)`);
  return legacyIdToSanityId;
}

async function migrateArticles(articles: RawArticle[], athleteMap: Map<string, string>) {
  console.log(`\n📰 Migrating ${articles.length} articles...`);
  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    const slug = article.slug ?? generateSanitySlug(article.title);

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "article" && slug.current == $slug][0] { _id }`,
      { slug }
    );

    if (existing) { skipped++; continue; }

    const relatedAthleteRefs = (article.related_athletes ?? [])
      .map((id: string) => athleteMap.get(id))
      .filter(Boolean)
      .map((sanityId) => ({ _type: "reference", _ref: sanityId, _key: sanityId as string }));

    // Convert plain text content to minimal portable text
    const contentBlocks = article.content
      ? article.content.split(/\n\n+/).filter(Boolean).map((para, i) => ({
          _type: "block",
          _key: `block_${i}`,
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: `span_${i}`, text: para.trim(), marks: [] }],
        }))
      : [];

    const doc = {
      _type: "article",
      title: article.title,
      slug: { _type: "slug", current: slug },
      publishedAt: parseDate(article.date),
      sport: article.sport ?? "Football",
      excerpt: article.excerpt?.slice(0, 400) ?? "",
      content: contentBlocks,
      isPremium: false,
      source: "scraped",
      sourceUrl: article.url,
      ...(relatedAthleteRefs.length > 0 && { relatedAthletes: relatedAthleteRefs }),
    };

    await client.create(doc);
    created++;

    if (created % 25 === 0) {
      process.stdout.write(`\n  ${created}/${articles.length} articles imported...`);
    }
    // Respect Sanity API rate limit
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`\n✅ Articles: ${created} created, ${skipped} skipped (already exist)`);
}

async function main() {
  console.log("🚀 HS Sports Elite — Sanity Migration");
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"}\n`);

  // Load JSON — update path if needed
  const jsonPath = path.resolve(__dirname, "highschoolsportselite_full_scrape.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found at ${jsonPath}`);
    console.error("   Download it from Google Drive and place it in scripts/");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const athletes: RawAthlete[] = raw.sections?.athletes ?? [];
  const articles: RawArticle[] = raw.sections?.articles ?? [];

  console.log(`Found: ${athletes.length} athletes, ${articles.length} articles`);

  const athleteMap = await migrateAthletes(athletes);
  await migrateArticles(articles, athleteMap);

  console.log("\n🎉 Migration complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
