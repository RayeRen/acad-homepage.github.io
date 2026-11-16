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
| `app.js`, `app.css`, `index.html` | The page: check one posting, or scan company job boards. |
| `boards.js` | Preset company job boards (Greenhouse, Lever, Ashby public feeds). |
| `data/build_lca.py` | Builds `data/lca/*.json` from the Department of Labor LCA and PERM disclosure files. |
| `eval/` | Hand-labeled sentences, blind test sets and the scoring script. |

No server, no API key, no build step. Job-board feeds are read directly
from the browser; your limits and the list of roles you have already seen
stay in your own browser storage.

## Rebuild the sponsorship data

The data covers three back-to-back 12-month periods ending with the newest
month in the files. Each `LCA_Disclosure_Data_FY*_Q*.xlsx` file holds one
quarter, so three years needs 12 of them; each `PERM_Disclosure_Data_*.xlsx`
file holds its fiscal year to date. Download them from
https://www.dol.gov/agencies/eta/foreign-labor/performance (file locations on
that page change from quarter to quarter), put them in one folder, then:

```bash
pip install python-calamine
python3 data/build_lca.py path/to/that/folder
```

The script buckets rows by decision date, counts each case number once, and
prints the periods and totals it built.

## Test

```bash
node eval/unit_tests.js
node eval/run_eval.js test_round2.json --misses
```

Not legal or immigration advice.
