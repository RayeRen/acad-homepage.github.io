# Provenance
Official starter: https://github.com/alshedivat/al-folio
Starter commit: 929fbf71c5a45b13e9b5a20dfa425ce9e9de7935
Runtime: al_folio_core 1.0.15, with al_icons 1.0.0 and al_folio_upgrade 1.0.3.
Original site baseline: e4bcb4bac6a8b4fc1965609335e416b62f0ed7a8.
MIT license retained. No upstream demo content is published.

This is a personalized user site, not a patch to the upstream starter. The upstream project's restriction on local runtime overrides does not apply to user sites (see its AGENTS.md). Intentional override: assets/css/main.scss retains upstream imports and adds site-owned _sass/_portfolio.scss. A site-owned research-row include renders the curated project summaries.

Intentional publication-layout override: `_layouts/bib.liquid` removes unused citation-badge integrations (the unmodified template parses a citation-plugin tag even when badges are disabled) fixes site-relative case-study links, and uses keyboard-focusable controls for summaries and BibTeX.
