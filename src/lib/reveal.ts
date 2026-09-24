const CROWDED = 4;
const CROWDED_GAP_MS = 60;

/** A <time> custom property in ms; the CSS minifier writes 250ms as .25s. */
const ms = (el: Element, prop: string): number => {
  const value = getComputedStyle(el).getPropertyValue(prop).trim();
  const n = Number.parseFloat(value) || 0;
  return value.endsWith("ms") ? n : value.endsWith("s") ? n * 1000 : n;
};

const inDocumentOrder = (a: Element, b: Element): number =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/**
 * States are styled in base.css. Acts only if Base.astro's head script has set `data-reveals` on the
 * root before the first frame; without it (reduced motion, or the page already opened up by itself)
 * nothing is touched.
 */
export const watchReveals = (): void => {
  const root = document.documentElement;
  if (root.dataset.reveals !== "") return;
  const main = document.querySelector("main");
  // Entrances queue in reading order however fast the page scrolls, each no sooner than its
  // predecessor's --reveal-gap after it; the first waits for <main>'s --reveal-start. What scrolled
  // away while waiting is let in unseen, so the entrances being watched never wait behind it.
  const queue: HTMLElement[] = [];
  const onScreen = new Set<Element>();
  let nextAt = performance.now() + (main ? ms(main, "--reveal-start") : 0);
  let timer = 0;

  const letIn = (el: HTMLElement): void => {
    observer.unobserve(el);
    onScreen.delete(el);
    el.dataset.reveal = "in";
  };
  const pump = (): void => {
    timer = 0;
    while (queue.length > 0 && !onScreen.has(queue[0]!)) letIn(queue.shift()!);
    if (queue.length === 0) return;
    const now = performance.now();
    if (now >= nextAt) {
      const el = queue.shift()!;
      letIn(el);
      nextAt = now + (queue.length > CROWDED ? CROWDED_GAP_MS : ms(el, "--reveal-gap"));
    }
    if (queue.length > 0) timer = window.setTimeout(pump, Math.max(0, nextAt - performance.now()));
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (!entry.isIntersecting) {
          onScreen.delete(el);
          continue;
        }
        onScreen.add(el);
        if (!queue.includes(el)) queue.push(el);
      }
      queue.sort(inDocumentOrder);
      if (!timer) pump();
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) observer.observe(el);
  // Only now: until this line runs, the head script's timer still opens the page up by itself.
  root.dataset.reveals = "on";
  addEventListener("beforeprint", () => {
    observer.disconnect();
    clearTimeout(timer);
    delete root.dataset.reveals;
  });
};
