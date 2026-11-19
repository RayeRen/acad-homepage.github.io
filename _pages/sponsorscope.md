---
layout: default
permalink: /projects/sponsorscope/
title: "SponsorScope case study"
excerpt: "A job inbox that reads tens of thousands of open roles from 228 company boards, finds the sentence that rules out visa holders, and shows the proof. How I researched, built and tested it."
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
.ssc-journey { list-style: none; counter-reset: step; padding: 0; margin: 1.25rem 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; }
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

.ssc .kicker { font-size: .85rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--purple); margin: 0 0 .6rem; }
.ssc-glance { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: .9rem 1.6rem; margin: 0 0 1.25rem; padding: 1.1rem 1.25rem; background: var(--soft); border-radius: 12px; }
.ssc-glance dt { font-size: .78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--purple); margin: 0 0 .2rem; }
.ssc-glance dd { margin: 0; font-size: .95rem; line-height: 1.5; color: var(--ink); }
.ssc-tldr { margin: 0 0 1.5rem; padding: 0; list-style: none; display: grid; gap: .6rem; }
.ssc-tldr li { max-width: none; padding-left: 1rem; border-left: 3px solid var(--purple); line-height: 1.55; }
.ssc-tldr b { color: var(--ink); }
.ssc-flow { list-style: none; counter-reset: flow; display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; padding: 0; margin: 1.25rem 0; }
.ssc-flow li { counter-increment: flow; padding: .8rem .9rem; border-radius: 8px; background: #fff; border: 1px solid var(--rule); font-size: .92rem; line-height: 1.45; max-width: none; }
.ssc-flow li::before { content: counter(flow); display: block; font-weight: 800; color: var(--purple); font-size: .85rem; margin-bottom: .15rem; }
.ssc-flow b { color: var(--ink); display: block; }
.ssc-decision { padding: 1rem 0 1.1rem; border-bottom: 1px solid var(--rule); margin: 0; }
.ssc-decision:last-of-type { border-bottom: 0; }
.ssc-decision dl { margin: .5rem 0 0; display: grid; grid-template-columns: 6.2rem minmax(0, 1fr); gap: .3rem .8rem; font-size: .95rem; line-height: 1.55; }
.ssc-decision dt { font-weight: 700; color: var(--muted); }
.ssc-decision dd { margin: 0; max-width: 62ch; }
@media (max-width: 760px) { .ssc-flow { grid-template-columns: repeat(2, 1fr); } .ssc-journey { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 420px) { .ssc-flow, .ssc-journey { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .ssc-decision dl { grid-template-columns: 1fr; gap: 0; } .ssc-decision dt { margin-top: .5rem; } }
.ssc-pair { margin: 1.25rem 0; display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; align-items: start; }
.ssc-pair img { width: 100%; height: auto; }
@media (max-width: 640px) { .ssc-pair { grid-template-columns: 1fr; } }
</style>

<div class="ssc" markdown="0">

<p class="kicker">Case study · Product and operations · November 2026</p>
<h1>SponsorScope: a job inbox that rules out the roles that can't hire me</h1>
<p class="lede">International students lose weeks to jobs they could never be offered. The reason is usually one sentence near the bottom of the posting, and no job board lets you filter on it. I built a free tool that reads tens of thousands of open roles from 228 company job boards, finds that sentence, checks pay and experience against my own limits, adds the company's H-1B filing history, and shows the exact words behind every verdict.</p>

<div class="ssc-actions">
  <a class="ssc-btn is-primary" href="{{ site.baseurl }}/sponsorscope/">Try it live</a>
  <a class="ssc-btn" href="https://github.com/ChengWu-Data/chengwu-data.github.io/tree/main/sponsorscope">Code and test sets</a>
</div>

<dl class="ssc-glance">
  <div><dt>My role</dt><dd>Sole owner: problem, user research, product decisions, rules, evaluation and data pipeline</dd></div>
  <div><dt>Built with</dt><dd>JavaScript, Node, Python, GitHub Actions. Code written with Claude Code at my direction</dd></div>
  <div><dt>Timeline</dt><dd>November 2026. In daily use for my own job search</dd></div>
  <div><dt>Users</dt><dd>Free, no sign-up, runs in the browser</dd></div>
</dl>

<ul class="ssc-tldr">
  <li><b>Problem.</b> Most postings say nothing about sponsorship, and the answer often comes in the final round or after an offer.</li>
  <li><b>What I found.</b> I read 36 job-seeker posts and counted: the late, expensive surprise is the pain, and people who landed offers applied to hundreds of roles. So the tool had to make volume cheap and rule out early.</li>
  <li><b>What I built.</b> A daily scan of company job boards, a rule engine that cites the sentence behind each verdict, and a lookup over 1.6 million certified H-1B filings.</li>
  <li><b>Proof.</b> 566 hand-labeled sentences in three test sets, two of them blind, and independent re-counts of the filing data from the Department of Labor's raw files.</li>
</ul>

<div class="ssc-facts">
  <div><b>228</b><span>company job boards read by the daily scan, 74 of them Workday sites</span></div>
  <div><b>1,603,208</b><span>certified H-1B filings from 110,060 employers, October 2023 to September 2026</span></div>
  <div><b>566</b><span>real posting sentences I labeled by hand across 140 job boards</span></div>
  <div><b>10 of 137</b><span>analyst-type postings I sampled said anything about sponsorship, so text alone could never be enough</span></div>
</div>

<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/workspace.png" alt="SponsorScope New roles page: filters on the left, a list of new roles with Apply, Ask first and Skip verdicts in the middle, and a detail pane on the right with the selected role's verdict, pay, years asked and the company's H-1B history." loading="lazy">
  <figcaption>The New roles page on real postings from the daily scan: filters, the list, and the full read of the selected role.</figcaption>
</figure>

<h2>The problem</h2>
<p>I am an international student on the path from OPT to H-1B. For every posting I read the whole description, look for sponsorship language, then look up the company's filings by hand. The sentence that matters can sit in one line of legal text, or not be there at all.</p>
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
<p>I didn't have time for interviews, so I read 36 public posts by international job seekers on Xiaohongshu (RedNote), comment threads included, tagged each by pain point, and counted. Twelve were from people still searching, nine from people who had landed offers, and eight were lead-generation posts trading "sponsor lists" for followers.</p>
<div class="ssc-insights">
  <div>
    <h3>The worst cost comes late, not early</h3>
    <p>10 of 36 posts described reaching the final round, or signing an offer, before sponsorship ended it.</p>
    <p class="changed">Design change: the verdict answers "is this worth a week of interviews?", and an unclear posting gets "Ask first" with a ready-to-send recruiter question.</p>
  </div>
  <div>
    <h3>Company-level data is not enough</h3>
    <p>Every how-to post taught the same manual routine: search H-1B filings, then check whether the company sponsors this kind of title. Several noted that one company can sponsor one team and refuse another.</p>
    <p class="changed">Design change: read the specific posting, then show filings for that company and that role type.</p>
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

<h2>How I framed it: a funnel with a qualification step</h2>
<p>Once the research said volume matters, I treated the job search like a pipeline and asked what each stage needs. The mapping below is the product spec I worked from.</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Funnel stage</th><th>What it needs</th><th>What SponsorScope does</th></tr></thead>
  <tbody>
    <tr><td>Find leads</td><td>Wide coverage, fresh every day</td><td>Reads 228 job boards on a schedule and lists what is new in the last 24 hours, 3 days or 7 days</td></tr>
    <tr><td>Qualify</td><td>Rule out early, with a reason</td><td>Apply, Ask first or Skip, judged against my limits, with the source sentence marked</td></tr>
    <tr><td>Research the account</td><td>Signal beyond the posting</td><td>Three years of the company's H-1B and green-card filings, for this role type, not just the company</td></tr>
    <tr><td>Prepare</td><td>Know what the process looks like</td><td>One-click searches for the company's interview process and questions</td></tr>
    <tr><td>Hand off and track</td><td>No retyping</td><td>Copy rows in my tracker's column order; mark roles Applied or Not interested</td></tr>
  </tbody>
</table>
</div>

<h2>Key decisions and trade-offs</h2>
<div class="ssc-decision">
  <h3>Rules I can explain, not a language model</h3>
  <dl>
    <dt>Chose</dt><dd>Readable rules that point to the exact sentence. The tool runs in the browser and is free for anyone.</dd>
    <dt>Rejected</dt><dd>A model call per posting. It covers more phrasings, but needs an API key and a server, costs money per check, and can state a verdict without a reason.</dd>
    <dt>Cost</dt><dd>Coverage. I measured it instead of assuming it (see Results).</dd>
  </dl>
</div>
<div class="ssc-decision">
  <h3>A wrong "Skip" costs more than a wrong "Apply"</h3>
  <dl>
    <dt>Chose</dt><dd>Track precision on "Skip" separately, and send anything ambiguous to "Ask first" instead of forcing a yes or no.</dd>
    <dt>Why</dt><dd>Telling someone to skip a role that was open to them loses a real opportunity; a wrong "Apply" costs one application. It is the threshold trade-off I worked on at Tarte, where I tuned a compliance alert threshold to cut alert volume by about 25% while keeping every material exception in the top-priority tier.</dd>
  </dl>
</div>
<div class="ssc-decision">
  <h3>Company data at the level of the role</h3>
  <dl>
    <dt>Chose</dt><dd>Read three years of Department of Labor filings and report the posting's own role type: how many filings, how many brought in a new hire instead of extending one, how many were at entry wage levels.</dd>
    <dt>Problem</dt><dd>Companies file under legal names. Instacart files as Maplebear and Carta as eShares. I normalize names, keep a short alias list, and always show "Filed as" so the match can be checked.</dd>
    <dt>Why</dt><dd>A company can sponsor engineers and no one else, which is what job seekers kept warning about.</dd>
  </dl>
</div>
<div class="ssc-decision">
  <h3>"New" means first seen by my scan</h3>
  <dl>
    <dt>Chose</dt><dd>Record the moment the scan first sees a role, and use the posted date only when a board gives a precise one.</dd>
    <dt>Why</dt><dd>Workday publishes dates only to the day, so "posted today" can mean any hour. A "last 24 hours" list that quietly included day-old roles would defeat the point.</dd>
    <dt>Cost</dt><dd>The first run has no history, so unseen boards without dates start outside the feed.</dd>
  </dl>
</div>
<div class="ssc-decision">
  <h3>Judge against my limits, not one verdict for everyone</h3>
  <dl>
    <dt>Chose</dt><dd>Limits you set and keep in your browser: whether you need sponsorship, the most years you will apply for, a base-pay floor, and whether to skip companies with no H-1B filings. The daily list uses defaults; opening a role re-judges it with yours.</dd>
    <dt>Why</dt><dd>"Three years is fine, four is worth asking about" is a personal rule. Baking mine into the data would make the tool useful to exactly one person.</dd>
  </dl>
</div>
<div class="ssc-decision">
  <h3>Public feeds only, no scraping, no auto-apply</h3>
  <dl>
    <dt>Chose</dt><dd>The scan reads the public feeds that Greenhouse, Lever, Ashby and SmartRecruiters publish, and the same job-listing endpoints that companies' own Workday careers pages call. It does not scrape LinkedIn and never submits an application.</dd>
    <dt>Why</dt><dd>Scraping would break those sites' terms, and auto-apply removes the human judgment the tool exists to support.</dd>
  </dl>
</div>

<h2>The product</h2>
<p>Three modes, one engine.</p>
<ul>
  <li><strong>New roles</strong> is the first page: filters on the left, the list in the middle, the selected role on the right. Each role carries its verdict, base pay, years asked, skills, work mode and the company's filing history. I can mark roles Applied or Not interested, and every role has an Interview prep menu that opens searches for that company and role on Glassdoor, Reddit and Blind.</li>
  <li><strong>Check a posting</strong> takes pasted text or a job link from almost any careers site.</li>
  <li><strong>Scan boards</strong> pulls every open role from 144 preset companies, or any board I add, live, through the same check.</li>
</ul>
<div class="ssc-pair">
<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/verdict-skip.png" alt="A verdict of Skip for an example posting, with the sentence that says the company will not sponsor visas highlighted in red." loading="lazy">
  <figcaption>A verdict with its evidence. Red marks the sentence that rules you out; green marks the pay and experience lines that fit.</figcaption>
</figure>
<figure>
  <img src="{{ site.baseurl }}/images/sponsorscope/h1b.png" alt="Sponsorship history panel: certified H-1B filings by year, filings for this role type, how many brought in a new hire, and the titles the company filed for." loading="lazy">
  <figcaption>The company's sponsorship history for the role type, with the legal name it was matched to.</figcaption>
</figure>
</div>

<h3>How it runs</h3>
<ol class="ssc-flow">
  <li><b>Job boards</b>A scheduled GitHub Actions job reads 228 boards, three times a day</li>
  <li><b>Rule engine</b>The same code as the page: verdict, pay, years, skills, with the evidence sentence</li>
  <li><b>Feed</b>Static files published to a branch; the page reads them, so there is no server</li>
  <li><b>Filing data</b>1,066 small files built from Department of Labor spreadsheets; a check downloads one, usually under 100 KB</li>
  <li><b>Quarterly refresh</b>A second job checks for each new quarter and refuses a rebuild that lost data</li>
</ol>

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
  <li><strong>Test 2</strong> showed misses on short lines such as "US Citizen or Green Card Holder". Those patterns are now covered and kept as regression tests. After both fixes the engine scores 97–98% on both sets, though they are no longer blind.</li>
</ul>
<h3>Checking it on real output, not only on test sets</h3>
<ul>
  <li><strong>Reading what it actually says.</strong> After the daily scan existed, I read postings from Workday sites and the evidence sentence behind each Skip. That found five misreads. "Visa sponsorship is not being offered" had been read as an offer; "indefinite right to work" was only a question mark; an "executive sponsor" was read as a visa rule; a pay-factors sentence was read as a security clearance; and an E-Verify sentence naming the SSA and DHS was read as sponsorship. Each fix has a regression test, and the evaluation scores did not move.</li>
  <li><strong>Re-counting the data independently.</strong> For Stripe, Ramp and Capital One I counted H-1B filings straight from the Department of Labor's raw spreadsheets, without the tool's code. All three matched exactly. A fourth company was off by one filing.</li>
  <li><strong>Refusing a bad refresh.</strong> The quarterly job rebuilds the data into a temporary folder and keeps the published data if the employer count or latest-year filings swing outside 0.7 to 1.4 times the old values, or if any period is incomplete. It also reports when the Department's site cannot be reached, instead of saying "nothing new".</li>
</ul>
<p>The biggest finding was outside the classifier. Only 10 of 137 analyst-type postings I sampled said anything about sponsorship, so text alone can't settle most cases. That is why I added the filing data. Of the 228 companies the tool now reads, 211 filed at least one H-1B in the last 12 months, and 171 filed for analyst, strategy, risk or GTM roles, the kinds of roles I apply for.</p>
<p class="note">I use SponsorScope for my own daily search. I will add usage numbers here once I have shared it more widely.</p>

<h2>What it can't do yet</h2>
<ul>
  <li><strong>The list filters by title.</strong> A role in one of my 19 directions can still turn out to be off-target once the description is read. Senior-sounding titles with no stated years are ranked lower and flagged.</li>
  <li><strong>Workday coverage is partial.</strong> 74 Workday sites are connected; some large employers do not answer yet.</li>
  <li><strong>A filing is a request, not an approval.</strong> Company history is evidence about the past, not a promise about this role, so "Apply" means "nothing rules you out", and the tool says to ask the recruiter early.</li>
</ul>

<h2>What I'd do next</h2>
<ul>
  <li><strong>Close the loop on results.</strong> Record which verdicts led to interviews, so I can see whether "Apply" roles actually convert better than "Ask first".</li>
  <li>Write each morning's new matches straight into my tracker.</li>
  <li>Let users mark roles where sponsorship was confirmed or refused, which fills the gap that postings leave.</li>
  <li>Offer a version to university career centers, whose international students ask this question every day.</li>
</ul>

<h2>How I built it</h2>
<p>I defined the problem, did the research, wrote the product spec, designed the rules and verdict logic, labeled the test sets, ran the evaluation, and checked the live output. I wrote the code with Claude Code as a pair programmer, and I treated its output the way I would an analyst's: nothing counted until it matched a blind test, an independent re-count, or a real posting I had read myself. The page is plain HTML, CSS and JavaScript with no server. The daily scan is a Node script on a GitHub Actions schedule; the filing data is rebuilt by a Python script from the Department of Labor's public files. The rules, the data build and the evaluation scripts are in the <a href="https://github.com/ChengWu-Data/chengwu-data.github.io/tree/main/sponsorscope">repository</a>.</p>
<p class="note">SponsorScope reads what a posting says. It is not legal or immigration advice.</p>

</div>
