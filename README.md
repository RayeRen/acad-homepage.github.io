# jeffreychou777.github.io

Personal homepage of Junfei Zhou, served by GitHub Pages as plain static files. There is no Jekyll build: `.nojekyll` tells Pages to publish the repository as-is.

## Layout of the repository

| Path | What it is |
| --- | --- |
| `index.html` | The whole page. Edit content here. |
| `assets/style.css` | All styling. Colors, type and spacing are defined as CSS variables at the top. |
| `assets/fonts/` | Self-hosted Latin subsets of Newsreader (headings) and IBM Plex Sans (body), taken from the fontsource packages on jsDelivr. |
| `images/` | Portrait, paper thumbnails and favicons. Keep paper thumbnails around 480 px wide; they are shown at 160 px. |
| `google_scholar_crawler/` | Script that pulls citation counts from Google Scholar. Run by the workflow below. |
| `.github/workflows/google_scholar_crawler.yaml` | Daily job that publishes `gs_data.json` to the `google-scholar-stats` branch. |

## Editing content

Everything lives in `index.html`. Sections use the same two patterns:

- `ul.ledger` rows for dated items (news, honors, experience, education): a `ledger__date` span followed by a `ledger__text` span.
- `li.pub` entries for publications: year, thumbnail, venue line, title, authors, links. Add `data-scholar-title="<exact paper title>"` on the hidden `li` at the end of the links row to get a "Cited by" count filled in automatically.

The sidebar on wide screens lists the sections; add a matching `<a href="#id">` there when you add a section.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Google Scholar citations

The workflow runs every day at 08:00 UTC, on every push to `main`, and on demand from the Actions tab. It needs one repository secret, `GOOGLE_SCHOLAR_ID`, set to the `user=` value from your Scholar profile URL. The page fetches the result through jsDelivr and matches papers by title; if the data is missing or Scholar blocks the crawler, the counts simply stay hidden.

## Visitor map

The footer embeds a [MapMyVisitors](https://mapmyvisitors.com/) widget inside `#visitor-map`. Replace the `<script>` tag there to change or remove it; the container hides itself when empty.

## Acknowledgements

The previous version of this site was built on [RayeRen/acad-homepage.github.io](https://github.com/RayeRen/acad-homepage.github.io); the Scholar crawler comes from that project.
