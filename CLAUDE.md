# Silver — zasady dla Claude Code

Stan pracy i sposób wznowienia: `HANDOFF.md`. Spec i plan: `docs/superpowers/`.

## Na start sesji

Wywołaj skille `i-have-adhd` i `shut-up-and-code` i stosuj je przez całą sesję.
W terminalu robią to hooki z plikami-flagami w `~/.claude`; w sesjach w chmurze
tych plików nie ma, więc wywołanie jest ręczne.

Subagenci: model `opus` dla implementerów i reviewerów, `sonnet` dla scoped
re-review małych diffów. Nigdy `fable`. Jeden implementer naraz.

## Komentarze

- Nie dodawaj komentarzy, które powtarzają to, co robi kod.
- Bez komentarzy-nagłówków sekcji (`// Validate input`, `// Loop through items`).
- Bez komentarzy opisujących właśnie wprowadzoną zmianę (`// Added error handling`).
- Komentuj tylko *dlaczego*: nieoczywisty kompromis, obejście cudzego buga,
  ograniczenie niewidoczne w kodzie.
- Istniejące komentarze zostają, chyba że zmienił się opisywany kod.

## Przegląd UI

Do audytu interfejsu pod Web Interface Guidelines pobierz
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
i zastosuj do wskazanych plików (odpowiednik skilla `web-design-guidelines`).
