import { tipSpan, type UnrollEdges, type UnrollFrame } from "./unroll-span";

const svg = document.querySelector<SVGSVGElement>(".home .ribbon");
const mask = svg?.querySelector<SVGMaskElement>("mask.unroll");
const opener = svg?.closest<HTMLElement>(".opener");
if (svg && mask && opener) {
  const frame = JSON.parse(mask.dataset.unroll ?? "{}") as UnrollFrame;
  const box = svg.getBoundingClientRect();
  const clip = opener.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const k = vb.width / box.width;
  const edges: UnrollEdges = {
    left: vb.x + (clip.left - box.left) * k,
    right: vb.x + (clip.right - box.left) * k,
    top: vb.y + (clip.top - box.top) * k,
  };
  const { from, to } = tipSpan(frame, edges);
  // Set while the animation may already be running: its keyframes read these, and in the first
  // frames the tip is still beyond the left edge either way.
  svg.style.setProperty("--unroll-from", String(from));
  svg.style.setProperty("--unroll-to", String(to));
  // The mask costs an offscreen pass on every repaint the foil makes afterwards.
  const masked = svg.querySelector("[mask]");
  Promise.all(svg.getAnimations().map((a) => a.finished)).then(
    () => masked?.removeAttribute("mask"),
    () => {},
  );
}
