import { defineType, defineField } from "sanity";

export const athleteSchema = defineType({
  name: "athlete",
  title: "Athlete",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Full Name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "school", title: "School Name", type: "string" }),
    defineField({
      name: "sports",
      title: "Sports",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Football","Basketball","Baseball","Soccer","Wrestling",
          "Volleyball","Indoor Track","Outdoor Track","Tennis","Golf","Gymnastics","Hockey",
        ],
      },
    }),
    defineField({ name: "gradYear", title: "Graduation Year", type: "number" }),
    defineField({ name: "hometown", title: "Hometown", type: "string" }),
    defineField({ name: "height", title: "Height", type: "string" }),
    defineField({ name: "position", title: "Position", type: "string" }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "legacyId", title: "Legacy ID", type: "string" }),
  ],
  preview: {
    select: { title: "name", school: "school", media: "photo" },
    prepare: ({ title, school, media }) => ({ title, subtitle: school, media }),
  },
});
