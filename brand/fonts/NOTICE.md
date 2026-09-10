# Shipped fonts

Unlike `tools/fonts/`, these are **runtime assets**: `fonts.css` serves them to
the website, the component library and the print templates, so they travel to
anyone who receives a build. The SIL Open Font License permits that bundling
and requires this notice to travel with the files.

## Inter

- `inter-var-latin.woff2`, `inter-var-latin-ext.woff2` — variable, `wght` 100–900.
- Copyright 2016 The Inter Project Authors — https://github.com/rsms/inter
- Version 4.001
- SIL Open Font License 1.1 — https://openfontlicense.org

## JetBrains Mono

- `jetbrains-mono-var-latin.woff2`, `jetbrains-mono-var-latin-ext.woff2` — variable, `wght` 400–800.
- Copyright 2020 The JetBrains Mono Project Authors — https://github.com/JetBrains/JetBrainsMono
- Version 2.211
- SIL Open Font License 1.1 — https://scripts.sil.org/OFL

Copyright, version and licence URL above were read from each font's own `name`
table (IDs 0, 5 and 14). Both families ship the verbatim `OFL.txt` upstream; add
it here if this directory is ever redistributed on its own. The licence forbids
selling the fonts by themselves and requires this notice to accompany them.

Both subsets exist because Polish diacritics (`ą ć ę ł ń ó ś ź ż`) live in
latin-ext. Any font swap has to cover them.
