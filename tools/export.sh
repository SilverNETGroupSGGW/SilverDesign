#!/usr/bin/env bash
# Export every template in templates/ to dist/ as print-ready PDF and a PNG
# proof. Uses the Chromium that Playwright already put on this machine; set
# CHROME to point somewhere else if yours lives elsewhere.
#
#   tools/export.sh              # everything
#   tools/export.sh poster-a3    # one template
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist"
mkdir -p "$OUT"

CHROME="${CHROME:-$HOME/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome}"
if [ ! -x "$CHROME" ]; then
  CHROME="$(command -v chromium || command -v google-chrome || command -v chrome || true)"
fi
[ -x "$CHROME" ] || { echo "No Chromium found. Set CHROME=/path/to/chrome" >&2; exit 1; }

# Template page size in mm, including bleed. The PNG proof is shot at the
# page's CSS pixel size (mm x 96/25.4) and scaled up, so it lands on the
# page exactly rather than sitting in the corner of a larger viewport.
# template : width_mm height_mm scale
declare -A PAGE=( [poster-a3]="303 426 2" )

targets=("$@")
if [ ${#targets[@]} -eq 0 ]; then
  targets=()
  for f in "$ROOT"/templates/*.html; do targets+=("$(basename "$f" .html)"); done
fi

for name in "${targets[@]}"; do
  src="$ROOT/templates/$name.html"
  [ -f "$src" ] || { echo "no such template: $name" >&2; exit 1; }
  read -r mm_w mm_h scale <<< "${PAGE[$name]:-210 297 2}"
  w=$(awk "BEGIN{printf \"%d\", $mm_w * 96 / 25.4}")
  h=$(awk "BEGIN{printf \"%d\", $mm_h * 96 / 25.4}")

  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --no-pdf-header-footer --print-to-pdf="$OUT/$name.pdf" \
    --virtual-time-budget=4000 "file://$src" 2>/dev/null

  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor="$scale" --window-size="$w,$h" \
    --screenshot="$OUT/$name.png" \
    --virtual-time-budget=4000 "file://$src" 2>/dev/null

  echo "dist/$name.pdf  dist/$name.png"
done
