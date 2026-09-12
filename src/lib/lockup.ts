import lockupJson from "../../brand/logo/lockup.json?raw";

const lockup = JSON.parse(lockupJson) as { path: string; frame: number[] };

export { markRibbonPath as lockupArmsPath } from "./mark";

/** The word "ilver", as outlines in the mark's own user units. */
export const lockupPath = lockup.path;

/** The plaque: the S body and the word, padded, expanded to 900:460. It clips the arms. */
export const lockupFrame = lockup.frame.join(" ");
export const lockupRatio = lockup.frame[2]! / lockup.frame[3]!;
