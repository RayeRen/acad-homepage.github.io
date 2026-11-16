---
layout: default
permalink: /projects/sponsorscope/
title: "SponsorScope case study"
excerpt: "How I built a tool that reads job postings for visa-sponsorship blockers, and how I tested it."
author_profile: true
---

<style>
.ssc { --ink: #2b2233; --body: #4a4553; --muted: #6e6779; --rule: rgba(109,65,149,.14); --purple: #6d4195; --soft: #f7f2fc;
  --skip: #b42318; --skip-bg: #fde3e1; --ask: #9a5506; --ask-bg: #fdefc8; --good: #0f7b4f; --good-bg: #d9f5e6; color: var(--body); }
  .ssc h1, .ssc h2 { border: 0; }
.ssc h1 { font-size: clamp(2rem, 4.4vw, 2.8rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.08; color: var(--ink); margin: 0 0 1rem; max-width: 18ch; }
.ssc h2 { font-size: 1.55rem; font-weight: 800; letter-spacing: -.01em; color: var(--ink); margin: 3rem 0 .9rem; padding: 0; border: 0; }
.ssc h3 { font-size: 1.08rem; font-weight: 700; color: var(--ink); margin: 0 0 .35rem; }
.ssc p, .ssc li { max-width: 68ch; line-height: 1.7; }
.ssc .lede { font-size: 1.12rem; }
.ssc-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin: 1.5rem 0 2rem; }
.ssc-btn { display: inline-block; padding: .7rem 1.1rem; border-radius: 8px; font-weight: 600; text-decoration: none !important; border: 1px solid var(--purple); color: var(--purple) !important; }
.ssc-btn.is-primary { background: var(--purple); color: #fff !important; }
.ssc-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem 2rem; margin: 0 0 1rem; padding: 1.25rem 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.ssc-facts div { min-width: 0; }
.ssc-facts b { display: block; font-size: 1.9rem; font-weight: 800; color: var(--ink); letter-spacing: -.02em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.ssc-facts span { font-size: .92rem; color: var(--muted); line-height: 1.45; display: block; margin-top: .3rem; }
.ssc figure { margin: 1.5rem 0; }
.ssc figure img { width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 10px; display: block; }
.ssc figcaption { font-family: inherit; font-size: .9rem; color: var(--muted); margin-top: .5rem; max-width: 68ch; }
.ssc-journey { list-style: none; counter-reset: step; padding: 0; margin: 1.25rem 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .6rem; }
.ssc-journey li { counter-increment: step; padding: .8rem .9rem; border-radius: 8px; background: #fff; border: 1px solid var(--rule); font-size: .95rem; line-height: 1.45; max-width: none; }
.ssc-journey li::before { content: counter(step); display: block; font-weight: 800; color: var(--muted); font-size: .85rem; margin-bottom: .2rem; }
.ssc-journey .pain { background: var(--skip-bg); border-color: transparent; color: var(--ink); }
.ssc-journey .pain::before { color: var(--skip); }
.ssc-journey small { display: block; color: var(--skip); font-weight: 600; margin-top: .3rem; }
.ssc-insights { display: grid; gap: 1.25rem; margin: 1rem 0; }
.ssc-insights > div { padding-left: 1rem; border-left: 3px solid var(--purple); }
.ssc-insights p { margin: .2rem 0; }
.ssc-insights .changed { font-size: .95rem; color: var(--purple); font-weight: 600; }
.ssc-decision { margin: 1.25rem 0; }
.ssc-decision p { margin: .25rem 0; }
.ssc table { border-collapse: collapse; width: 100%; font-size: .95rem; margin: 1rem 0; font-variant-numeric: tabular-nums; }
.ssc th, .ssc td { text-align: left; padding: .55rem .7rem; border-bottom: 1px solid var(--rule); vertical-align: top; }
.ssc th { color: var(--muted); font-weight: 600; }
.ssc .table-scroll { overflow-x: auto; }
.ssc mark { padding: 0 .2em; border-radius: 3px; color: var(--ink); }
.ssc .m-skip { background: var(--skip-bg); } .ssc .m-ask { background: var(--ask-bg); } .ssc .m-good { background: var(--good-bg); }
.ssc .note { font-size: .95rem; color: var(--muted); }
</style>

<div class="ssc" markdown="0">

<h1>SponsorScope: reading the fine print so job seekers don't have to</h1>
<p class="lede">International students lose weeks to roles they could never be hired for. The reason is usually written in one sentence near the bottom of the posting, and no job board lets you filter on it. I built a free tool that finds that sentence, checks experience and pay against your own limits, adds the company's H-1B filings from Department of Labor data, and shows the exact words behind every verdict.</p>

<div class="ssc-actions">
  <a class="ssc-btn is-primary" href="{{ site.baseurl }}/sponsorscope/">Try it live</a>
  <a class="ssc-btn" href="https://github.com/ChengWu-Data/chengwu-data.github.io/tree/main/sponsorscope">Code and test sets</a>
</div>

<div class="ssc-facts">
  <div><b>10 of 137</b><span>analyst-type postings I sampled said anything about visa sponsorship in the job description</span></div>
  <div><b>566</b><span>real posting sentences hand-labeled across 140 company job boards</span></div>
  <div><b>100%</b><span>precision on "Skip" in the final blind test: it never told someone to skip a role that was open to them</span></div>
  <div><b>1,611,388</b><span>certified H-1B filings from 110,621 employers built into every check, July 2023 to June 2026</span></div>
</div>

<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/verdict-skip.png" alt="SponsorScope verdict for an example posting: Skip, because one highlighted sentence says the company will not consider candidates who need visa sponsorship." loading="lazy">
  <figcaption>A verdict with its evidence. Red marks the sentence that rules you out; green marks the experience and pay lines that fit.</figcaption>
</figure>

<h2>The problem</h2>
<p>I am an international student on the path from OPT to H-1B, and I check every posting by hand: read the whole description, look for sponsorship language, then look up the company's H-1B filings. Most descriptions say nothing at all. The answer often appears only on the application form or in the final round.</p>
<ol class="ssc-journey">
  <li>Find a role on a job board</li>
  <li>Read the full posting for visa language</li>
  <li class="pain">Look up the company's H-1B history by hand<small>Repeated for every posting</small></li>
  <li>Apply and fill in the form</li>
  <li class="pain">Interview for weeks<small>Sponsorship often comes up only here</small></li>
  <li class="pain">Offer, or an offer withdrawn over sponsorship</li>
</ol>
<p>The real job is not finding roles. It is ruling them out early and with confidence.</p>

<h2>What I learned from job seekers</h2>
<p>I didn't have time for interviews, so I read 36 public posts by international job seekers on Xiaohongshu (RedNote), including the comment threads, tagged each one by pain point, and counted. Twelve were from people still searching, nine from people who had landed offers, and eight were lead-generation posts trading "sponsor lists" for followers.</p>
<div class="ssc-insights">
  <div>
    <h3>The worst cost comes late, not early</h3>
    <p>10 of 36 posts described reaching the final round, or signing an offer, before sponsorship ended it.</p>
    <p class="changed">Design change: the verdict answers "is this worth a week of interviews?", and an unclear posting gets "Ask first" with a ready-to-send recruiter question.</p>
  </div>
  <div>
    <h3>Company-level data is not enough</h3>
    <p>Every how-to post taught the same manual routine: search H-1B filings, then check whether the company sponsors this kind of title. Several noted that one company can sponsor one team and refuse another.</p>
    <p class="changed">Design change: read the specific posting, then link to H-1B filings for that company and title.</p>
  </div>
  <div>
    <h3>People who landed offers applied more, not less</h3>
    <p>Landed posts reported 400 to 965 applications, and one person got a single interview from about 800. My first idea was a tool that helps people apply to fewer roles. The research said otherwise.</p>
    <p class="changed">Design change: the goal became making high volume cheap. A daily scan across many job boards replaced "apply less".</p>
  </div>
  <div>
    <h3>The information is being sold</h3>
    <p>8 of 36 posts offered a "sponsor list" in exchange for a comment or a follow, and each had dozens of replies asking for it.</p>
    <p class="changed">Design change: free, no sign-up, and every verdict shows its source sentence.</p>
  </div>
</div>

<h2>Key decisions and trade-offs</h2>
<div class="ssc-decision">
  <h3>Rules I can explain, not a language model</h3>
  <p>A model call would cover more phrasings, but it needs an API key and a server, costs money per check, and can state a verdict without a reason. I wrote readable rules instead. Every verdict points to the exact sentence, the tool runs entirely in the browser, and it is free for anyone. The cost is coverage, which I measured instead of assuming.</p>
</div>
<div class="ssc-decision">
  <h3>A wrong "Skip" costs more than a wrong "Apply"</h3>
  <p>Telling someone to skip a role that was open to them loses a real opportunity, while a wrong "Apply" costs one application. So I track precision on "Skip" separately, and anything ambiguous lands in "Ask first" instead of being forced into a yes or no. It is the same threshold trade-off I worked on in compliance risk scoring at Tarte.</p>
</div>
<div class="ssc-decision">
  <h3>Public job-board feeds, no scraping, no auto-apply</h3>
  <p>The scanner reads the public feeds that Greenhouse, Lever and Ashby publish for each company. It does not scrape LinkedIn and does not submit applications, which would break those sites' terms and remove the human judgment the tool is meant to support.</p>
</div>
<div class="ssc-decision">
  <h3>Company data at the level of the role, matched to legal names</h3>
  <p>Since most postings say nothing, the tool also reads three years of the Department of Labor's H-1B filing data. Two problems came up. First, companies file under legal names: Instacart files as Maplebear and Carta as eShares. I normalize names, match on the start of the legal name, keep a short list of known aliases, and always show "Filed as" so the user can check the match. Second, a company can sponsor engineers and no one else, which is what the job seekers kept warning about. So the tool reports filings for the posting's own role type, such as data and business analyst roles, how many of those brought in a new hire instead of extending an existing one, and how many were at entry wage levels.</p>
</div>
<div class="ssc-decision">
  <h3>Flagging green-card market-test postings</h3>
  <p>Some postings are written to satisfy the PERM green-card process for someone already in the job. They use legal phrasing such as "experience in the job offered" and "or foreign equivalent". The tool flags these as "Ask first" so people don't count on them.</p>
</div>

<h2>The product</h2>
<p>Two modes, one engine. <strong>Check one posting</strong> takes pasted text or a Greenhouse, Lever or Ashby link. <strong>Scan job boards</strong> pulls every open role from 76 preset companies or any board you add, keeps the titles you care about, runs each through the same check, and sorts Apply, Ask first and Skip. Results copy straight into a Google Sheets tracker.</p>
<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/scan.png" alt="Scan results table with verdict tags, roles, pay, years of experience and the reason for each verdict." loading="lazy">
  <figcaption>A scan across three company boards. Roles that rule you out are hidden by default; the reason column says why.</figcaption>
</figure>
<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/h1b.png" alt="H-1B filings panel for Datadog: 87 certified filings from July 2025 to June 2026, the most-filed titles with median pay, and the legal name used." loading="lazy">
  <figcaption>Every check shows the company's certified H-1B filings for the last 12 months, the titles it filed most, and the legal name the match came from.</figcaption>
</figure>
<p>Verdicts follow your own limits, saved in your browser: whether you need sponsorship, the most years of experience you will apply for, a base-pay floor, and whether to skip companies with no H-1B filings in the last year.</p>

<h2>Results</h2>
<p>I pulled sentences from public job boards and labeled each one by hand: blocks a visa holder, needs a check, or irrelevant. I wrote the rules against one set, then tested twice on companies the rules had never seen, labeling each test set before running the tool on it.</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Run</th><th>Sentences</th><th>Accuracy</th><th>Skip precision</th><th>Skip recall</th></tr></thead>
  <tbody>
    <tr><td>Development set, 63 boards</td><td>242</td><td>99.6%</td><td>100%</td><td>99.1%</td></tr>
    <tr><td>Blind test 1, 42 new boards</td><td>223</td><td>84.3%</td><td>83.1%</td><td>94.2%</td></tr>
    <tr><td>Blind test 2, 35 new boards</td><td>101</td><td>89.1%</td><td>100%</td><td>79.6%</td></tr>
  </tbody>
</table>
</div>
<p>The blind tests are the honest numbers, and each one changed the rules.</p>
<ul>
  <li><strong>Test 1</strong> showed that any mention of ITAR was being read as a citizenship rule, so compliance jobs that only <em>work with</em> export controls were wrongly skipped. The rule now needs "U.S. person" or citizen wording in the same sentence.</li>
  <li><strong>Test 2</strong> showed misses on short lines such as "US Citizen or Green Card Holder". Those patterns are now covered and kept as regression tests. After both fixes the engine scores 97–98% on both test sets, though those sets are no longer blind.</li>
</ul>
<p>The biggest finding was outside the classifier. Only 10 of 137 analyst-type postings I sampled said anything about sponsorship in the description, so text alone can't settle most cases. That is why I added the filing data. Of the 76 preset companies, 73 filed at least one H-1B in the last 12 months, and 61 filed for analyst, strategy, risk or GTM roles, the kinds of roles I apply for.</p>
<p>The filing data is split into 1,061 small files by the first letters of the company name, so a check downloads one of them (most are under 100 KB) instead of 30 MB. Name matching was checked against 4,000 real filings: the browser and the Python build script produce the same result for every one.</p>
<p class="note">I use SponsorScope for my own daily search. I will add usage numbers here once I have shared it more widely.</p>

<h2>What I'd do next</h2>
<ul>
  <li>Run the scan on a schedule and send new matches each morning, written straight into my tracker.</li>
  <li>Cover companies that use Workday and similar systems, which includes most large banks, by running the scan on a server.</li>
  <li>Let users mark roles where sponsorship was confirmed or refused, filling the gap that postings leave.</li>
  <li>Offer a version to university career centers, whose international students ask this question every day.</li>
</ul>

<h2>How I built it</h2>
<p>I defined the problem, did the research, designed the rules and the verdict logic, built and labeled the test sets, and ran the evaluation. I wrote the code with Claude Code as an AI pair programmer. The tool is plain HTML, CSS and JavaScript with no server. The H-1B data is rebuilt by a Python script from the Department of Labor's public files. The rules, the data build and the evaluation scripts are in the <a href="https://github.com/ChengWu-Data/chengwu-data.github.io/tree/main/sponsorscope">repository</a>.</p>
<p class="note">SponsorScope reads what a posting says. It is not legal or immigration advice.</p>

</div>
