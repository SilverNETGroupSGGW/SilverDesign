import { z } from "astro/zod";

export const LocalizedString = z.object({ pl: z.string().min(1), en: z.string().min(1) });
export type LocalizedString = z.infer<typeof LocalizedString>;

export const SiteSchema = z.object({
  name: z.string(),
  formalName: z.string(),
  faculty: LocalizedString,
  university: z.string(),
  since: z.number().int(),
  room: z.string(),
  address: z.array(z.string()).min(1),
  chair: z.string(),
  discord: z.string().url(),
  email: z.string().email(),
  github: z.string().url(),
  facebook: z.string().url(),
});
export type Site = z.infer<typeof SiteSchema>;

export const ProjectSchema = z.object({
  name: z.string(),
  order: z.number().int(),
  status: z.enum(["store", "github"]),
  platforms: z.array(z.enum(["android", "ios", "web", "api"])),
  links: z.object({
    play: z.string().url().optional(),
    appStore: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
  tech: z.array(z.string()).min(1),
  summary: LocalizedString,
  result: LocalizedString,
  screenshot: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

const HistoryBase = z.object({
  order: z.number().int().default(0),
  title: LocalizedString,
  body: LocalizedString,
});
export const HistorySchema = z.union([
  HistoryBase.extend({ year: z.number().int() }),
  HistoryBase.extend({ yearFrom: z.number().int(), yearTo: z.number().int() }),
]);
export type HistoryEntry = z.infer<typeof HistorySchema>;

export const historyStart = (h: HistoryEntry): number => ("year" in h ? h.year : h.yearFrom);
