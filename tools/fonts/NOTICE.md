# Build-input fonts

Fonts in this directory are **build inputs**, not shipped assets. They are read
once by `tools/build_logo.py` to convert the ILVER letterforms into outlines;
the resulting logo files contain only path data, so nothing here is loaded at
runtime by the website, the library, or the print templates.

## Figtree

- `figtree-600-latin.woff2` — Figtree, weight 600, latin subset. Version 2.002.
- Copyright 2022 The Figtree Project Authors — https://github.com/erikdkennedy/figtree
- Licensed under the SIL Open Font License 1.1 — https://openfontlicense.org
- Metadata above read from the font's own `name` table (IDs 0 and 14).

The latin subset is sufficient because only the five characters `ILVER` are
outlined. The full family and the verbatim `OFL.txt` are at
https://github.com/google/fonts/tree/main/ofl/figtree — add that file here if
this directory is ever redistributed on its own. The OFL permits bundling and
modification; it forbids selling the font by itself and requires this notice to
travel with the font file.
