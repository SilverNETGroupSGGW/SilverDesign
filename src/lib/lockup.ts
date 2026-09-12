import lockupJson from "../../brand/logo/lockup.json?raw";

const lockup = JSON.parse(lockupJson) as { path: string };

/** The word "ilver", as outlines in the mark's own user units. */
export const lockupPath = lockup.path;
