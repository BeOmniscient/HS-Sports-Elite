import { sanityClient } from "./client";
import type { Article, Athlete, School } from "@/types";

const articleFields = `
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  publishedAt,
  sport,
  "school": school->name,
  excerpt,
  isPremium,
  source,
  sourceUrl,
  featuredImage { asset, alt, hotspot },
  "relatedAthletes": relatedAthletes[]->{ _id, name, "slug": slug.current, school, sports }
`;

export async function getFeaturedArticle(): Promise<Article | null> {
  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) [0] { ${articleFields} }`
  );
}

export async function getLatestArticles(limit = 12, offset = 0): Promise<Article[]> {
  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) [${offset}...${offset + limit}] { ${articleFields} }`
  );
}

export async function getArticlesBySport(sport: string, limit = 12): Promise<Article[]> {
  return sanityClient.fetch(
    `*[_type == "article" && sport == $sport] | order(publishedAt desc) [0...${limit}] { ${articleFields} }`,
    { sport }
  );
}

export async function getArticlesBySchool(schoolSlug: string, limit = 12): Promise<Article[]> {
  return sanityClient.fetch(
    `*[_type == "article" && school->slug.current == $schoolSlug] | order(publishedAt desc) [0...${limit}] { ${articleFields} }`,
    { schoolSlug }
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      ${articleFields},
      content
    }`,
    { slug }
  );
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const results = await sanityClient.fetch<{ slug: string }[]>(
    `*[_type == "article"] { "slug": slug.current }`
  );
  return results.map((r) => r.slug);
}

export async function getAthleteBySlug(slug: string): Promise<Athlete | null> {
  return sanityClient.fetch(
    `*[_type == "athlete" && slug.current == $slug][0] {
      _id, name, "slug": slug.current, school, sports, gradYear, hometown, bio, photo,
      "relatedArticles": *[_type == "article" && references(^._id)] | order(publishedAt desc)[0...6] {
        ${articleFields}
      }
    }`,
    { slug }
  );
}

export async function getAllAthletes(): Promise<Athlete[]> {
  return sanityClient.fetch(
    `*[_type == "athlete"] | order(name asc) {
      _id, name, "slug": slug.current, school, sports, gradYear, photo
    }`
  );
}

export async function getAllSchools(): Promise<School[]> {
  return sanityClient.fetch(
    `*[_type == "school"] | order(name asc) {
      _id, name, "slug": slug.current, mascot, location, logo
    }`
  );
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  return sanityClient.fetch(
    `*[_type == "school" && slug.current == $slug][0] {
      _id, name, "slug": slug.current, mascot, location, logo
    }`,
    { slug }
  );
}

export async function searchArticles(query: string, limit = 10): Promise<Article[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sanityClient as any).fetch(
    `*[_type == "article" && [title, excerpt] match $query] | order(publishedAt desc)[0...${limit}] {
      ${articleFields}
    }`,
    { query: `${query}*` }
  );
}
