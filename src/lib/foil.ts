const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(pointer: fine)");

/** How far the texture follows the pointer at the opener's edge, in tiles. */
const RANGE = 0.08;
/** Per ms. Critically damped, so the foil trails the hand by ~140 ms and never overshoots. */
const OMEGA = 0.014;
/** The glint peaks this many ms in and is back within a pixel of rest by five times that. */
const GLINT_PEAK = 180;
/** In tiles, along the band. */
const GLINT_REACH = 0.25;

/** One pass of light, out and back: starts at rest with no velocity, 1 at the peak, then decays. */
const glint = (t: number) => {
  const u = t / GLINT_PEAK;
  return u * u * Math.exp(2 * (1 - u));
};

/** The exact step of a critically damped spring, so a long frame cannot make it unstable. */
const spring = (p: number, v: number, target: number, dt: number): [number, number] => {
  const e = p - target;
  const k = v + OMEGA * e;
  const decay = Math.exp(-OMEGA * dt);
  return [target + (e + k * dt) * decay, (v - OMEGA * k * dt) * decay];
};

const foil = (mark: HTMLElement) => {
  const pattern = mark.querySelector<SVGPatternElement>("pattern");
  if (!pattern) return undefined;
  const x0 = Number(pattern.getAttribute("x") ?? 0);
  const y0 = Number(pattern.getAttribute("y") ?? 0);
  const w = Number(pattern.getAttribute("width") ?? 0);
  const h = Number(pattern.getAttribute("height") ?? 0);
  const [ax = 0, ay = 0] = (mark.dataset.foil ?? "").split(" ").map(Number);
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let px = 0;
  let py = 0;
  let glintAt = -1;
  let raf = 0;
  let last = 0;
  let rect = mark.getBoundingClientRect();

  const paint = () => {
    pattern.setAttribute("x", String(x0 + x));
    pattern.setAttribute("y", String(y0 + y));
  };
  const step = (now: number) => {
    // A stalled frame (the lead's layout on fonts.ready, a background tab) would otherwise land
    // the whole glide in one jump.
    const dt = last ? Math.min(now - last, 34) : 16;
    last = now;
    // Added to the pointer's target, not in its place: a cursor resting on the hero at load would
    // otherwise cancel the glint with its first event.
    if (now - glintAt >= 5 * GLINT_PEAK) glintAt = -1;
    const reach = glintAt >= 0 ? glint(now - glintAt) * GLINT_REACH : 0;
    const tx = px + ax * w * reach;
    const ty = py + ay * h * reach;
    [x, vx] = spring(x, vx, tx, dt);
    [y, vy] = spring(y, vy, ty, dt);
    const resting = glintAt < 0 && Math.hypot(x - tx, y - ty) < 0.05 && Math.hypot(vx, vy) < 0.001;
    if (resting) {
      x = tx;
      y = ty;
      vx = 0;
      vy = 0;
      last = 0;
    }
    paint();
    raf = resting ? 0 : requestAnimationFrame(step);
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(step);
  };

  const onMove = (e: PointerEvent) => {
    px = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * w * RANGE;
    py = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * h * RANGE;
    run();
  };
  const onLeave = () => {
    px = 0;
    py = 0;
    run();
  };
  // Reading the rect per pointermove is a layout read between rAF writes; the mark only moves
  // when the page does.
  const onViewport = () => {
    rect = mark.getBoundingClientRect();
  };

  let listening: AbortController | undefined;
  return {
    follow(on: boolean) {
      listening?.abort();
      listening = undefined;
      if (!on) {
        onLeave();
        return;
      }
      listening = new AbortController();
      const { signal } = listening;
      mark.addEventListener("pointermove", onMove, { signal });
      mark.addEventListener("pointerleave", onLeave, { signal });
      addEventListener("resize", onViewport, { signal });
      addEventListener("scroll", onViewport, { passive: true, signal });
      onViewport();
    },
    still() {
      listening?.abort();
      listening = undefined;
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      glintAt = -1;
      x = y = vx = vy = px = py = 0;
      paint();
    },
    /** Once the texture is decoded, and two frames after fonts.ready, which is where wedge.ts lays
     *  the lead out; never when the page opens at rest (data-hero, Base.astro). */
    glint() {
      if (document.documentElement.dataset.hero === "still") return;
      const src = pattern.querySelector("image")?.getAttribute("href");
      if (!src) return;
      const texture = new Image();
      texture.src = src;
      Promise.all([texture.decode(), document.fonts.ready]).then(
        () =>
          requestAnimationFrame(() =>
            requestAnimationFrame((now) => {
              if (reduce.matches) return;
              glintAt = now;
              run();
            }),
          ),
        () => {},
      );
    },
  };
};

const foils = [...document.querySelectorAll<HTMLElement>("[data-foil]")].flatMap(
  (mark) => foil(mark) ?? [],
);
const sync = () => {
  for (const f of foils) {
    if (reduce.matches) f.still();
    else f.follow(fine.matches);
  }
};
sync();
for (const query of [reduce, fine]) query.addEventListener("change", sync);
if (!reduce.matches) for (const f of foils) f.glint();
