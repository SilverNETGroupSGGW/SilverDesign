const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(pointer: fine)");

const track = (mark: HTMLElement) => {
  const pattern = mark.querySelector<SVGPatternElement>("pattern");
  if (!pattern) return () => {};
  const x0 = Number(pattern.getAttribute("x") ?? 0);
  const y0 = Number(pattern.getAttribute("y") ?? 0);
  const w = Number(pattern.getAttribute("width") ?? 0);
  const h = Number(pattern.getAttribute("height") ?? 0);
  const range = 0.08;
  let rect = mark.getBoundingClientRect();
  let raf = 0;
  let dx = 0;
  let dy = 0;
  const apply = () => {
    raf = 0;
    pattern.setAttribute("x", String(x0 + dx * w * range));
    pattern.setAttribute("y", String(y0 + dy * h * range));
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  const onMove = (e: PointerEvent) => {
    dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    schedule();
  };
  const onLeave = () => {
    dx = 0;
    dy = 0;
    schedule();
  };
  // Reading the rect per pointermove is a layout read between rAF writes; the mark only moves
  // when the page does.
  const onViewport = () => {
    rect = mark.getBoundingClientRect();
  };
  mark.addEventListener("pointermove", onMove);
  mark.addEventListener("pointerleave", onLeave);
  addEventListener("resize", onViewport);
  addEventListener("scroll", onViewport, { passive: true });
  return () => {
    mark.removeEventListener("pointermove", onMove);
    mark.removeEventListener("pointerleave", onLeave);
    removeEventListener("resize", onViewport);
    removeEventListener("scroll", onViewport);
    onLeave();
  };
};

let attached: (() => void)[] = [];
const sync = () => {
  const wanted = !reduce.matches && fine.matches;
  const running = attached.length > 0;
  if (wanted === running) return;
  for (const off of attached) off();
  attached = wanted ? [...document.querySelectorAll<HTMLElement>("[data-foil]")].map(track) : [];
};
sync();
for (const query of [reduce, fine]) query.addEventListener("change", sync);
