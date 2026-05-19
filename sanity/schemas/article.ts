import { defineType, defineField } from "sanity";

export const articleSchema = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (R) => R.required() }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "sport",
      title: "Sport",
      type: "string",
      options: {
        list: [
          "Football","Basketball","Baseball","Soccer","Wrestling",
          "Volleyball","Indoor Track","Outdoor Track","Tennis","Golf","Gymnastics","Hockey",
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: "school", title: "School", type: "reference", to: [{ type: "school" }] }),
    defineField({ name: "featuredImage", title: "Featured Image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alt text" })] }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", type: "string", title: "Alt text" })],
        },
      ],
    }),
    defineField({ name: "relatedAthletes", title: "Related Athletes", type: "array", of: [{ type: "reference", to: [{ type: "athlete" }] }] }),
    defineField({ name: "isPremium", title: "Premium Content", type: "boolean", initialValue: false }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: { list: ["original", "rss", "scraped"] },
      initialValue: "original",
    }),
    defineField({ name: "sourceUrl", title: "Source URL", type: "url" }),
  ],
  preview: {
    select: { title: "title", sport: "sport", media: "featuredImage" },
    prepare: ({ title, sport, media }) => ({ title, subtitle: sport, media }),
  },
  orderings: [{ title: "Newest", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
});
