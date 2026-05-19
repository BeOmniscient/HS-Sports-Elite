"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "hs-sports-elite",
  title: "HS Sports Elite",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Articles").child(
              S.documentList().title("All Articles").filter('_type == "article"').defaultOrdering([{ field: "publishedAt", direction: "desc" }])
            ),
            S.listItem().title("Athletes").child(
              S.documentList().title("Athletes").filter('_type == "athlete"')
            ),
            S.listItem().title("Schools").child(
              S.documentList().title("Schools").filter('_type == "school"')
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
