# SponsorScope evaluation

The engine reads one sentence at a time and decides whether it blocks an
international student (no sponsorship, citizens only, clearance), needs a
human check (work authorization asked but sponsorship not mentioned, or a
green-card "PERM" market-test posting), or says nothing that matters.

All sentences come from public Greenhouse, Lever and Ashby job boards,
pulled on 2026-11-10. Labels are my own reading of each sentence. Sentences
about non-US locations and fragments cut mid-sentence were left out.

| Set | Boards | Sentences | How it was used |
| --- | --- | --- | --- |
| `dev_set.json` | 63 | 242 | Rules were written and tuned against this set |
| `test_round1.json` | 42 new | 223 | Labeled blind, then scored once |
| `test_round2.json` | 35 new | 101 | Labeled blind after fixing round 1, then scored once |

## Results

"Skip" is the decision that matters most: telling someone not to apply.
A wrong "skip" costs a real opportunity, so precision is watched as closely
as recall.

| Run | Sentence accuracy | Skip precision | Skip recall |
| --- | --- | --- | --- |
| Round 1, first blind score | 84.3% | 83.1% | 94.2% |
| Round 2, first blind score | 89.1% | 100% | 79.6% |
| Current engine, round 1 set | 97.3% | 99.1% | 96.7% |
| Current engine, round 2 set | 98.0% | 100% | 96.3% |

The first blind scores are the honest ones. The "current engine" rows are
after fixing what each round exposed, so they are regression checks, not
fresh tests.

What each round taught:

- **Round 1:** any mention of ITAR was being read as a citizenship rule, so
  compliance jobs that only *work with* export controls were wrongly skipped.
  Fixed by requiring "U.S. person" or citizen language in the same sentence.
- **Round 2:** short requirement lines such as "US Citizen or Green Card
  Holder" and "Authorized to work in the U.S. now and in the future" were
  missed. Fixed and added as unit tests.

## Run it

```bash
node unit_tests.js
node run_eval.js dev_set.json
node run_eval.js test_round1.json --misses
node run_eval.js test_round2.json --misses
```
