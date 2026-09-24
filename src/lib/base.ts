/**
 * "/" unless the build is given a base (the Pages workflow passes the project path to
 * `astro build --base`). Every link and asset URL goes through `withBase`.
 */
export const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");

/** A site path (with or without its leading slash) under BASE. */
export const withBase = (path: string): string => BASE + path.replace(/^\//, "");
