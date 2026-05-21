# Dongmei Gao — Personal Website

Personal academic portfolio for [Dongmei Gao](https://gdongmei.github.io), PhD student at Aalto University researching developer experience and low-code platforms.

## Stack

- React 18 (via CDN, no build step)
- Babel standalone for JSX transpilation
- Pure CSS with CSS custom properties
- Hosted on GitHub Pages

## Structure

| File | Purpose |
|---|---|
| `index.html` | Entry point |
| `data.jsx` | All site content (bio, publications, news, education, experience) |
| `components.jsx` | Reusable UI components |
| `app.jsx` | Page layout and section assembly |
| `styles.css` | All styles |
| `images/` | Portrait and publication images |

## Local development

Serve the root directory with any static file server, e.g.:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Updating content

All content lives in `data.jsx`. Edit the relevant constant (`SITE`, `STATS`, `NEWS`, `PUBS`, `EDU`, `WORK`) and push to `main` — GitHub Pages deploys automatically.
