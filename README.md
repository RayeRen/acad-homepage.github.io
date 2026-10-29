# Raied Ahmed Nishat — academic website

Production address: https://raiedahmed-lab.github.io/

Personalized official al-folio v1 starter. Runtime layout, typography, dark mode, navigation and publication presentation come from pinned al-folio gems. See UPSTREAM.md for provenance.

## Edit content
- Homepage: `_pages/about.md`
- About: `_pages/profile.md`
- Research overview: `_pages/research.md`
- Case studies: `_projects/*.md`
- Journal publications: `_bibliography/papers.bib`
- Conference and under-review records: `_pages/publications.md`
- Social/contact links: `_data/socials.yml`
- CV (preserved URL): `assets/resume.pdf`
- Site additions to styles: `_sass/_portfolio.scss`

## Local preview
Install Ruby 3.3.5 and Bundler, then:

```sh
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000/. No Node, Python notebook tooling, ImageMagick, API key, analytics account, or extra service is required to build this curated site.

## Checks
```sh
JEKYLL_ENV=production bundle exec jekyll build
python3 scripts/check_site.py
bundle exec al-folio upgrade overrides audit
```

## Deployment
Use **Settings → Pages → Source: GitHub Actions**. The workflow builds branches/PRs and publishes only `main`. Do not choose branch-based Jekyll builds: GitHub's built-in safe builder cannot load the required al-folio plugins. Do not rename this repository or change `url`/empty `baseurl`.

## Maintenance
Keep publication status and collaborator attribution accurate. A new project belongs in `_projects` only when it has a meaningful question and evidence or a clearly stated ongoing scope. Avoid empty sections and demo content. Update the existing CV PDF when a revised source is available.

Preserved legacy assets remain under `images/`. `/about.html` redirects to `/about/`; `/projects/` redirects to `/research/`; `/hobbies/` redirects to the personal section on About. Legacy homepage anchor targets are retained.
