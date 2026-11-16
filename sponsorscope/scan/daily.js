#!/usr/bin/env node
/*
 * SponsorScope daily scan. Runs on a schedule in GitHub Actions (see
 * .github/workflows/sponsorscope-scan.yaml), not in the browser.
 *
 * It reads every company job board the tool knows (boards.js and
 * boards-daily.json), keeps the roles whose title fits one of the role
 * directions, judges each with the same rules as the page (engine.js) and
 * the company's filing history (data/lca), and writes:
 *
 *   latest.json   roles first seen in the last 7 days, newest first
 *   texts.json    the posting text of those roles, for the Details view
 *   state.json    when each role was first seen, so tomorrow's run knows what is new
 *
 * "New" means new to the board: a role counts from the moment this scan
 * first sees it, or from the board's own posted date when that is recent.
 *
 * Usage: node daily.js --out <folder> [--only greenhouse,lever,ashby,smartrecruiters,workday] [--match <company regex>]
 * No dependencies; needs Node 18 or newer for fetch.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const SS = require(path.join(ROOT, "engine.js")), LCA = require(path.join(ROOT, "lca.js"));
const Roles = require(path.join(ROOT, "roles.js")), Core = require(path.join(ROOT, "core.js"));

const DAY = 864e5;
const FEED_DAYS = 7;          // how long a role stays in the feed
const KEEP_DAYS = 60;         // how long a vanished role is remembered
const TEXT_MAX = 16000;       // characters of posting text kept per role
const WD_PAGE = 20, WD_MAX_PAGES = 100, WD_BUDGET = 120000;   // Workday: page size, most pages per site, most milliseconds per site
const UA = "SponsorScope-daily-scan/1.0 (+https://chengwu-data.github.io/sponsorscope/)";
const PROFILE = Core.DEFAULTS;

function arg(name, fallback) { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : fallback; }
const OUT = path.resolve(arg("out", "scan-out"));
const ONLY = arg("only", "") ? arg("only", "").split(",") : null;
const MATCH = arg("match", "") ? new RegExp(arg("match", ""), "i") : null;
const NOW = Number(arg("now", 0)) || Date.now();

LCA.setLoader(function (file) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "data", "lca", file), "utf8")); } catch (e) { return null; }
});

// ---------- network ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchJSON(url, opts, tries) {
  tries = tries || 3;
  for (let n = 1; ; n++) {
    try {
      const r = await fetch(url, Object.assign({ signal: AbortSignal.timeout(45000) }, opts, {
        headers: Object.assign({ accept: "application/json", "user-agent": UA }, opts && opts.headers) }));
      if (r.ok) return await r.json();
      if (r.status !== 429 && r.status < 500) throw Object.assign(new Error("HTTP " + r.status), { final: true });
      throw new Error("HTTP " + r.status);
    } catch (e) {
      if (e.final || n >= tries) throw e;
      await sleep(1500 * n * n);
    }
  }
}
async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async function () {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  }));
}

// ---------- boards ----------
function loadBoards() {
  const win = {};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "boards.js"), "utf8"), { window: win });
  const extra = JSON.parse(fs.readFileSync(path.join(__dirname, "boards-daily.json"), "utf8"));
  const out = [];
  win.SS_BOARDS.forEach((g) => g.items.forEach((b) => out.push({ ats: b[0], slug: b[1], name: b[2], query: b[4] || b[2], key: b[0] + ":" + b[1] })));
  extra.smartrecruiters.forEach((b) => out.push({ ats: "smartrecruiters", slug: b[0], name: b[1], query: b[2] || b[1], key: "smartrecruiters:" + b[0] }));
  extra.workday.forEach((b) => out.push({ ats: "workday", host: b[1], tenant: b[2], site: b[3], name: b[0], query: b[4] || b[0], key: "workday:" + b[2] + "/" + b[3] }));
  return out.filter((b) => (!ONLY || ONLY.indexOf(b.ats) >= 0) && (!MATCH || MATCH.test(b.name)));
}

// Each lister returns { rows, complete }. A row has id, title, location and either the
// posting text or a load() that fetches it; complete = the whole board was read.
async function listSimple(b) {
  const url = b.ats === "greenhouse" ? "https://boards-api.greenhouse.io/v1/boards/" + b.slug + "/jobs?content=true"
    : b.ats === "lever" ? "https://api.lever.co/v0/postings/" + b.slug + "?mode=json"
    : "https://api.ashbyhq.com/posting-api/job-board/" + encodeURIComponent(b.slug) + "?includeCompensation=true";
  const j = await fetchJSON(url);
  const list = b.ats === "greenhouse" ? j.jobs : b.ats === "lever" ? j : (j.jobs || []);
  return { rows: list.map((x) => Core.normalize(b.ats, b.slug, b.name, x)), complete: true };
}

async function listSmartRecruiters(b) {
  const api = "https://api.smartrecruiters.com/v1/companies/" + encodeURIComponent(b.slug) + "/postings";
  const rows = [];
  for (let offset = 0; offset < 3000; offset += 100) {
    const j = await fetchJSON(api + "?limit=100&country=us&offset=" + offset);
    (j.content || []).forEach(function (x) {
      const row = Core.normalize("smartrecruiters", b.slug, b.name, x);
      row.text = "";
      row.load = async function () { return Core.normalize("smartrecruiters", b.slug, b.name, await fetchJSON(api + "/" + x.id)); };
      rows.push(row);
    });
    if (!j.content || j.content.length < 100) break;
  }
  return { rows: rows, complete: true };
}

function wdAge(s) {            // "Posted Today", "Posted Yesterday", "Posted 5 Days Ago", "Posted 30+ Days Ago"
  if (!s) return null;
  if (/today/i.test(s)) return 0;
  if (/yesterday/i.test(s)) return 1;
  const m = /(\d+)\+?\s*days?/i.exec(s);
  return m ? Number(m[1]) : null;
}
function wdUSFacet(facets) {   // the country filter is named differently on every site; the U.S. value is found by its label
  let hit = null;
  (function walk(list, param) {
    (list || []).forEach(function (f) {
      const p = f.facetParameter || param;
      if (f.values) walk(f.values, p);
      if (!hit && f.id && /^(united states( of america)?|usa?)$/i.test((f.descriptor || "").trim())) hit = { param: p, id: f.id };
    });
  })(facets, null);
  return hit;
}
async function listWorkday(b, st) {
  const base = "https://" + b.host + ".myworkdayjobs.com", api = base + "/wday/cxs/" + b.tenant + "/" + b.site;
  const search = (facets, offset) => fetchJSON(api + "/jobs", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ appliedFacets: facets, limit: WD_PAGE, offset: offset, searchText: "" }) });
  let page = await search({}, 0), facets = {};
  const us = wdUSFacet(page.facets);
  if (us) { facets[us.param] = [us.id]; page = await search(facets, 0); }
  // Most sites list newest first, but not all. Once a week every page is read; on other runs
  // reading stops when a newest-first site reaches roles older than three days.
  const full = !st.lastFull || NOW - st.lastFull > 6.5 * DAY;
  const rows = [], have = {}, t0 = Date.now();
  // Only the first page reports the total. Some sites answer past the end by starting over, so the
  // total, repeated roles and a time budget all end the loop.
  const pages = Math.min(WD_MAX_PAGES, Math.ceil((page.total || WD_MAX_PAGES * WD_PAGE) / WD_PAGE));
  let sorted = true, prev = -1, complete = false;
  for (let n = 0; n < pages; n++) {
    const list = (page.jobPostings || []).filter(function (x) { const k = x.externalPath || x.title; if (have[k]) return false; have[k] = 1; return true; });
    let youngest = Infinity;
    list.forEach(function (x) {
      const age = wdAge(x.postedOn);
      if (age != null) { if (age < prev) sorted = false; prev = Math.max(prev, age); youngest = Math.min(youngest, age); }
      const row = { id: "wd:" + b.tenant + "/" + b.site + ":" + ((x.bulletFields || [])[0] || x.externalPath), title: x.title || "",
        location: x.locationsText || "", posted: age == null ? 0 : NOW - age * DAY, dated: age != null,
        url: base + "/" + b.site + x.externalPath, text: "", usOnly: !!us };
      row.load = async function () {
        const d = await fetchJSON(api + x.externalPath);
        const job = Core.normalize("workday", b.site, b.name, { info: d.jobPostingInfo, list: x, base: base + "/" + b.site, key: b.tenant });
        job.id = row.id; job.url = job.url || row.url;
        job.locs = [job.location].concat(job.more || []).filter(Boolean);
        // Without a country filter on the site, keep a role only if one of its locations is in the U.S.
        if (!us && job.country && !/^united states/i.test(job.country) && !(job.more || []).some((l) => /nyc|nj/.test(Roles.locClass(l)))) job.foreign = true;
        delete job.country;
        return job;
      };
      rows.push(row);
    });
    if (list.length < WD_PAGE || n === pages - 1) { complete = (page.total || 0) <= WD_MAX_PAGES * WD_PAGE || n < pages - 1; break; }
    if (!full && sorted && youngest !== Infinity && youngest > 3) break;
    if (Date.now() - t0 > WD_BUDGET) break;
    page = await search(facets, (n + 1) * WD_PAGE);
  }
  if (complete) st.lastFull = NOW;
  return { rows: rows, complete: complete };
}

// ---------- one board ----------
async function scanBoard(b, state, prev, out) {
  const st = state.boards[b.key] || {};
  const known = !!state.boards[b.key];
  const res = b.ats === "workday" ? await listWorkday(b, st) : b.ats === "smartrecruiters" ? await listSmartRecruiters(b) : await listSimple(b);
  const rec = await LCA.lookup(b.query);
  const byTitle = {};
  const seenIds = {};
  await pool(res.rows, 3, async function (row) {
    const dir = Roles.classify(row.title);
    if (!dir || Core.excluded(row.title) || !Core.isUS(row)) return;
    seenIds[row.id] = 1;
    let job = row, mark = state.ids[row.id];
    if (!mark) {
      // First sighting. A site that shows no date in its list is asked for the posting itself.
      if (!row.posted && row.load) { try { job = await row.load(); } catch (e) { return; } }
      // The board's own posted date is used when it has one. Workday gives the day, not the hour
      // ("Posted Yesterday"), so on a board already being watched a role posted in the last two
      // days counts from now, the moment it was first seen. A board read for the first time and
      // showing no date at all starts outside the feed, so its whole backlog is not called new.
      const posted = job.posted || 0, coarse = b.ats === "workday";
      const when = posted ? (known && coarse && NOW - posted < 2.5 * DAY ? NOW : posted) : (known ? NOW : NOW - (FEED_DAYS + 1) * DAY);
      mark = state.ids[row.id] = [Math.min(when, NOW), NOW];
    }
    mark[1] = NOW;
    if (NOW - mark[0] > FEED_DAYS * DAY) return;
    if (!job.text) {
      const was = prev.byId[row.id] || {};
      if (prev.texts[row.id]) job = Object.assign({}, row, { text: prev.texts[row.id], locs: was.locs, remote: was.remote, posted: was.posted || row.posted });
      else if (row.load) { try { job = await row.load(); } catch (e) { return; } }
    }
    if (job.foreign || !job.text) return;
    job.when = mark[0];
    // One entry per role: the same title in several cities is merged.
    const dup = byTitle[job.title];
    const locs = job.locs || (job.location ? [job.location] : []);
    if (dup) { locs.forEach((l) => { if (dup.locs.indexOf(l) < 0) dup.locs.push(l); }); dup.when = Math.max(dup.when, job.when); dup.remote = dup.remote || job.remote; return; }
    job.locs = locs;
    byTitle[job.title] = job;
  });

  Object.keys(byTitle).forEach(function (t) { out.jobs.push(entry(byTitle[t], b, rec)); out.texts[byTitle[t].id] = byTitle[t].text.slice(0, TEXT_MAX); });
  // A board read only in part (or a role this run did not reach) keeps yesterday's entries until they age out.
  if (!res.complete) carryOver(b, prev, seenIds, rec, out);
  state.boards[b.key] = Object.assign(st, { first: st.first || NOW, last: NOW });
  return res.rows.length;
}

function carryOver(b, prev, seenIds, rec, out) {
  prev.jobs.forEach(function (e) {
    if (e.board !== b.key || seenIds[e.id] || NOW - e.when > FEED_DAYS * DAY || !prev.texts[e.id]) return;
    if (!Roles.classify(e.title) || Core.excluded(e.title)) return;      // the title rules may have changed since it was kept
    if (out.jobs.some((x) => x.board === b.key && x.title === e.title)) return;
    out.jobs.push(entry({ id: e.id, title: e.title, company: e.company, url: e.url, locs: e.locs, remote: e.remote, posted: e.posted, when: e.when, text: prev.texts[e.id] }, b, rec));
    out.texts[e.id] = prev.texts[e.id];
  });
}

function entry(job, b, rec) {
  const r = Core.withH1b(SS.analyze(job.text, PROFILE), rec, job.title, PROFILE);
  const dir = Roles.classify(job.title), ro = LCA.role(rec, job.title), sum = Core.summarize(job.text);
  return {
    id: job.id, board: b.key, source: b.ats, company: job.company || b.name, title: job.title, url: job.url,
    locs: job.locs, loc: Roles.locClass(job.locs, job.remote), remote: !!job.remote, dir: dir ? dir.id : "",
    when: job.when, posted: job.posted || 0,
    verdict: r.verdict, why: Core.reason(r), sponsorship: r.sponsorship,
    pay: r.pay ? [r.pay.lo, r.pay.hi] : null, years: r.years ? [r.years.min, r.years.max || null] : null,
    h1b: rec ? { n: rec.n, prev: rec.y[1], role: ro.n, roleNew: ro.fresh + ro.transfer, fam: ro.fam === "other" ? "" : ro.label, perm: rec.pm[2] } : null,
    query: b.query, skills: sum.skills, mode: sum.mode, degree: sum.degree
  };
}

// ---------- run ----------
function readJSON(file, fallback) { try { return JSON.parse(fs.readFileSync(path.join(OUT, file), "utf8")); } catch (e) { return fallback; } }

(async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const state = readJSON("state.json", { v: 1, ids: {}, boards: {} });
  const last = readJSON("latest.json", { jobs: [] });
  const prev = { jobs: last.jobs || [], texts: readJSON("texts.json", {}), byId: {} };
  prev.jobs.forEach((e) => { prev.byId[e.id] = e; });
  const boards = loadBoards(), out = { jobs: [], texts: {} }, failed = [];
  let rowsRead = 0;

  await pool(boards, 6, async function (b) {
    const t0 = Date.now(), before = out.jobs.length;
    try {
      const n = await scanBoard(b, state, prev, out);
      rowsRead += n;
      console.log("  " + b.name + " (" + b.ats + "): " + n + " open roles, " + (Date.now() - t0) + " ms");
    } catch (e) {
      failed.push(b.name);
      console.log("  ! " + b.name + " (" + b.ats + "): " + e.message + ", " + (Date.now() - t0) + " ms");
      carryOver(b, prev, {}, await LCA.lookup(b.query), out);
    }
  });

  if (boards.length > 3 && failed.length > boards.length / 2) {
    console.error("More than half of the boards failed (" + failed.length + " of " + boards.length + "). Keeping the previous results.");
    process.exit(1);
  }
  // Boards left out of this run (--only / --match) keep what they had.
  const ran = {}; boards.forEach((b) => { ran[b.key] = 1; });
  prev.jobs.forEach(function (e) {
    if (!ran[e.board] && NOW - e.when <= FEED_DAYS * DAY && prev.texts[e.id]) { out.jobs.push(e); out.texts[e.id] = prev.texts[e.id]; }
  });

  Object.keys(state.ids).forEach((id) => { if (NOW - state.ids[id][1] > KEEP_DAYS * DAY) delete state.ids[id]; });
  state.updated = NOW;
  out.jobs.sort((a, b) => b.when - a.when || a.company.localeCompare(b.company));
  const meta = (await LCA.meta()) || {};
  const day = out.jobs.filter((j) => NOW - j.when <= DAY);
  const count = (list) => ({ all: list.length, apply: list.filter((j) => j.verdict === "apply").length, ask: list.filter((j) => j.verdict === "ask").length, skip: list.filter((j) => j.verdict === "skip").length });
  const latest = {
    v: 1, generated: new Date(NOW).toISOString(), now: NOW, days: FEED_DAYS,
    profile: { needsSponsorship: PROFILE.needsSponsorship, salaryFloor: PROFILE.salaryFloor, maxYears: PROFILE.maxYears, yearsGrace: PROFILE.yearsGrace, requireH1b: PROFILE.requireH1b },
    h1bPeriod: meta.period || "", boards: { total: boards.length, failed: failed.sort(), rows: rowsRead },
    counts: { day: count(day), week: count(out.jobs) }, jobs: out.jobs
  };
  fs.writeFileSync(path.join(OUT, "latest.json"), JSON.stringify(latest));
  fs.writeFileSync(path.join(OUT, "texts.json"), JSON.stringify(out.texts));
  fs.writeFileSync(path.join(OUT, "state.json"), JSON.stringify(state));

  const line = "Read " + (boards.length - failed.length) + " of " + boards.length + " job boards (" + rowsRead.toLocaleString("en-US") + " open roles). " +
    "In the last 24 hours: " + day.length + " new roles in your directions (" + latest.counts.day.apply + " apply, " + latest.counts.day.ask + " ask first, " + latest.counts.day.skip + " skip). " +
    "In the last 7 days: " + out.jobs.length + ".";
  console.log(line + (failed.length ? "\nDid not answer: " + failed.join(", ") + "." : ""));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "### SponsorScope daily scan\n\n" + line + "\n\n" + (failed.length ? "Did not answer: " + failed.join(", ") + ".\n\n" : "") +
      day.filter((j) => j.verdict !== "skip").slice(0, 40).map((j) => "- **" + j.company + "**: [" + j.title.replace(/[\[\]|]/g, " ") + "](" + j.url + ") · " + j.verdict + (j.pay ? " · $" + Math.round(j.pay[0] / 1000) + "k–$" + Math.round(j.pay[1] / 1000) + "k" : "") + "\n").join(""));
  }
})().catch(function (e) { console.error(e); process.exit(1); });
