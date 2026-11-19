# SponsorScope

Checks a job posting for anything that rules out candidates who need visa
sponsorship, then compares experience and pay against your own limits.
Every verdict highlights the sentence it came from.

- Live: https://chengwu-data.github.io/sponsorscope/
- Case study: https://chengwu-data.github.io/projects/sponsorscope/

## Files

| File | What it does |
| --- | --- |
| `engine.js` | The rules for reading a posting. Works in the browser and in Node (`require("./engine.js")`). |
| `roles.js` | Role directions (which kind of job a title is, in three priority tiers) and location groups. |
| `lca.js` | Looks up a company's sponsorship history: H-1B filings by year, by role type, new hires vs extensions, NYC-area worksites, green-card cases. |
| `core.js` | What the page and the daily scan share: reading each job board's format, the U.S. location check, folding filing history into the verdict, the short skills summary. |
| `app.js`, `app.css`, `index.html` | The page: new roles from the daily scan, check one posting, or scan company job boards now. |
| `boards.js` | Preset company job boards (Greenhouse, Lever, Ashby public feeds). |
| `scan/daily.js` | The daily scan. Runs in GitHub Actions, reads every board, and publishes the new roles. |
| `scan/boards-daily.json` | Boards only the daily scan reads: Workday sites and large SmartRecruiters boards. |
| `data/build_lca.py` | Builds `data/lca/*.json` from the Department of Labor LCA and PERM disclosure files. |
| `data/refresh.py` | Checks for a newer quarter of that data, downloads it and runs the build. |
| `eval/` | Hand-labeled sentences, blind test sets and the scoring script. |

The page itself has no server, no API key and no build step. Job-board feeds
are read directly from the browser; your limits and the list of roles you
have already seen stay in your own browser storage.

## The daily scan

`.github/workflows/sponsorscope-scan.yaml` runs `scan/daily.js` three times a
day. It reads every board in `boards.js` and `scan/boards-daily.json`, keeps
the roles whose title fits a role direction, judges each one with the same
rules as the page, and force-pushes three files to the `sponsorscope-scan`
branch: `latest.json` (roles first seen in the last 7 days), `texts.json`
(their posting text) and `state.json` (when each role was first seen). The
page reads the first two from that branch, so nothing is committed to `main`.

A role is "new" from the moment the scan first sees it on a board, or from
the board's own posted date when that is recent. Workday sites are read in
full once a week; on other runs reading stops once a newest-first site
reaches roles older than three days.

To run it by hand: open the repository's Actions tab, choose "SponsorScope
daily scan", then "Run workflow". Or locally:

```bash
node scan/daily.js --out /tmp/scan            # everything, a few minutes the first time
node scan/daily.js --out /tmp/scan --match "^(Stripe|Citi)$"
```

To add a Workday company, add a line to `scan/boards-daily.json` with its
host, tenant and site, taken from its careers URL
(`https://<host>.myworkdayjobs.com/<site>`; the tenant is the first part of
the host).

## Rebuild the sponsorship data

The data covers three back-to-back 12-month periods ending with the newest
month in the files. Each `LCA_Disclosure_Data_FY*_Q*.xlsx` file holds one
quarter, so three years needs 12 of them; each `PERM_Disclosure_Data_*.xlsx`
file holds its fiscal year to date.

`.github/workflows/sponsorscope-data.yaml` checks for a newer quarter twice a
month. When there is one it rebuilds the data, pushes it to the
`sponsorscope-data-update` branch and opens an issue with a link to review
and merge. To do the same by hand:

```bash
pip install python-calamine
python3 data/refresh.py --cache path/to/a/folder   # downloads about 1.3 GB the first time
```

Or download the files yourself from
https://www.dol.gov/agencies/eta/foreign-labor/performance, put them in one
folder, and run `python3 data/build_lca.py path/to/that/folder`.

The build buckets rows by decision date, counts each case number once, and
prints the periods and totals it built.

## Test

```bash
node eval/unit_tests.js
node eval/run_eval.js eval/test_round2.json --misses
```

Not legal or immigration advice.
