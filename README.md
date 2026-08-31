# Linwei Tao — Personal Homepage

Personal academic homepage of [Linwei Tao](https://www.taolinwei.com), Ph.D. candidate at the University of Sydney.

Live at: **[taolinwei.com](https://www.taolinwei.com)**

---

## Based on

This site is built on [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) by RayeRen, a Jekyll-based academic homepage template using the [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) theme.

## Customisations

Beyond the original template, this repo includes:

- **Publication filtering** — multi-select CCF-A / CCF-B / CORE A* / First Author and single-select topic filters, with OR logic across rank filters and live DOM re-sorting
- **Standalone portals** — separate GitHub Pages sites for [Publications](https://www.taolinwei.com/publications/), [Talks](https://www.taolinwei.com/talks/), and [Projects](https://www.taolinwei.com/projects/)
- **Profile link buttons** — pill-style buttons with SVG icons for Google Scholar, GitHub, CV, and LinkedIn
- **CV source** — LaTeX source in `Linwei-CV/` with a `compile.sh` script that outputs directly to `assets/CV.pdf`
- **Visual refresh** — system font stack, red accent (`#c0392b`), increased masthead font size

## CV

LaTeX source is in `Linwei-CV/`. To update and publish:

```bash
bash Linwei-CV/compile.sh
git add assets/CV.pdf && git commit -m "update CV" && git push
```
