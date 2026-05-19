import { defineType, defineField } from "sanity";

export const schoolSchema = defineType({
  name: "school",
  title: "School",
  type: "document",
  fields: [
    defineField({ name: "name", title: "School Name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
    defineField({ name: "mascot", title: "Mascot", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "primaryColor", title: "Primary Color (hex)", type: "string" }),
  ],
  preview: {
    select: { title: "name", mascot: "mascot", media: "logo" },
    prepare: ({ title, mascot, media }) => ({ title, subtitle: mascot, media }),
  },
});
