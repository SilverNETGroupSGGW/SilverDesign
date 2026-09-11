import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { HistorySchema, ProjectSchema, SiteSchema } from "./lib/schemas";

const site = defineCollection({
  loader: file("src/content/site.json", {
    parser: (text) => [{ id: "site", ...JSON.parse(text) }],
  }),
  schema: SiteSchema,
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "*.json" }),
  schema: ProjectSchema,
});

const history = defineCollection({
  loader: glob({ base: "./src/content/history", pattern: "*.json" }),
  schema: HistorySchema,
});

export const collections = { site, projects, history };
