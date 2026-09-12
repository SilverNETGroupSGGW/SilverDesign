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
  discord: z.url(),
  email: z.email(),
  github: z.url(),
  facebook: z.url(),
});
export type Site = z.infer<typeof SiteSchema>;

export const ProjectSchema = z.object({
  name: z.string(),
  order: z.number().int(),
  status: z.enum(["store", "github"]),
  /** Shown on the students' sheet, which has room for three apps and picks them by hand. */
  sheet: z.boolean().default(false),
  platforms: z.array(z.enum(["android", "ios", "web", "api"])),
  links: z.object({
    play: z.url().optional(),
    appStore: z.url().optional(),
    github: z.url().optional(),
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

const Step = z.object({ title: z.string(), body: z.string() });

export const CopySchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  nav: z.object({
    projects: z.string(),
    history: z.string(),
    join: z.string(),
    switchTo: z.string(),
    skip: z.string(),
    mainLabel: z.string(),
  }),
  hero: z.object({
    title: z.string(),
    lead: z.string(),
    ctaDiscord: z.string(),
    ctaProjects: z.string(),
  }),
  steps: z.object({
    heading: z.string(),
    items: z.tuple([Step, Step, Step]),
    hackathons: z.string(),
  }),
  projects: z.object({
    heading: z.string(),
    lead: z.string(),
    viewAll: z.string(),
    filterAll: z.string(),
    filterStore: z.string(),
    filterGithub: z.string(),
    filterLabel: z.string(),
    filterCount: z.string(),
    shotAlt: z.string(),
    play: z.string(),
    appStore: z.string(),
    github: z.string(),
    platforms: z.string(),
    platformAndroid: z.string(),
    platformIos: z.string(),
    platformWeb: z.string(),
    platformApi: z.string(),
  }),
  build: z.object({ heading: z.string(), what: z.string(), how: z.string(), inOrg: z.string() }),
  join: z.object({
    heading: z.string(),
    lead: z.string(),
    threshold: z.string(),
    discord: z.string(),
    email: z.string(),
    room: z.string(),
    stripProjects: z.string(),
    stripHistory: z.string(),
  }),
  footer: z.object({ since: z.string(), contact: z.string(), links: z.string() }),
  history: z.object({ heading: z.string(), lead: z.string() }),
  notFound: z.object({ title: z.string(), body: z.string(), home: z.string() }),
  brochure: z.object({
    students: z.object({
      title: z.string(),
      lead: z.string(),
      stepsHeading: z.string(),
      appsHeading: z.string(),
      threshold: z.string(),
      qrLabel: z.string(),
    }),
    companies: z.object({
      title: z.string(),
      lead: z.string(),
      whoHeading: z.string(),
      who: z.string(),
      builtHeading: z.string(),
      togetherHeading: z.string(),
      together: z.tuple([z.string(), z.string(), z.string()]),
      contactHeading: z.string(),
      qrLabel: z.string(),
    }),
  }),
});
export type Copy = z.infer<typeof CopySchema>;

/** A result that opens with a number is a measurement, which §8 sets in Geist Mono; one that opens
 *  with a word is a sentence about the project and stays in Geist. */
export const isMeasurement = (result: string): boolean => /^\d/.test(result);
