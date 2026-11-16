(function () {
  "use strict";
  var SS = window.SponsorScope;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- storage (best effort: private windows can refuse it) ----------
  function load(key, fallback) {
    try { var v = localStorage.getItem("ss:" + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) { try { localStorage.setItem("ss:" + key, JSON.stringify(value)); } catch (e) { /* ignore */ } }

  var DEFAULT_KW = "";   // extra title words, on top of the role directions
  var DEFAULT_NOT = "Software Engineer, Data Engineer, Machine Learning Engineer, Director, Head of, Principal, Staff, Vice President, Intern";
  // Page defaults: $105k base, up to 3 years, and a role asking 4 is "ask" rather than "skip".
  var APP_DEFAULTS = Core.DEFAULTS;
  var savedProfile = load("profile", null);
  var profile = Object.assign({}, APP_DEFAULTS, savedProfile && savedProfile.v === 2 ? savedProfile : {});
  var dirsOn = load("dirs", null) || Roles.defaults();
  var locShow = Object.assign({ nyc: true, remote: true, other: false }, load("loc", {}));

  // ---------- small helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function k(v) { return SS.fmtMoney(v); }
  function payText(p) { return p ? k(p.lo) + (p.hi !== p.lo ? "–" + k(p.hi) : "") : "Not listed"; }
  function yearsText(y) { return y ? y.min + (y.max ? "–" + y.max : "+") + " yrs" : "Not listed"; }
  var WORD = { apply: "Apply", ask: "Ask first", skip: "Skip" };
  var LEVEL_CLASS = { skip: "skip", ask: "ask", good: "good", info: "info" };
  var EXPLAIN = {
    no_sponsorship: "The posting says it will not sponsor a work visa. If you will need H-1B later, this role is closed to you even while you are on OPT.",
    authorized_no_sponsor: "They want people who can work without sponsorship now and later. OPT alone does not meet that.",
    citizens_only: "Only U.S. citizens or green-card holders can be hired here, usually because of export-control or government contract rules.",
    clearance: "A U.S. security clearance requires citizenship, so this role is closed to visa holders.",
    authorization_unclear: "OPT counts as authorized today, but the posting does not say whether they will file H-1B later. Companies often decide this on the application form or in the final round.",
    perm_posting: "Phrases like “experience in the job offered” and “foreign equivalent” are typical of green-card labor-certification ads, which are usually written for someone already in the job. Apply only if it is a strong fit, and do not count on it.",
    sponsorship_offered: "The posting says sponsorship is possible. Confirm it covers this level and location before you commit time.",
    everify: "The employer uses E-Verify, which every STEM OPT employer must.",
    no_h1b: "The Department of Labor shows no certified H-1B filings under this company name in the last three years. If it files under a different legal name, enter that name below.",
    h1b_stopped: "The company has sponsored before but shows no certified H-1B filings in the last 12 months. That can mean a hiring freeze or a policy change, so ask before you invest time.",
    h1b_not_role: "The company does sponsor, but last year none of its filings were for this kind of role. Worth asking the recruiter directly.",
    h1b_renewals: "Every filing for this kind of role kept an existing employee on H-1B. None brought in a new hire, so new sponsorship here is unproven.",
    h1b_falling: "Fewer filings than the year before. One year can be noise, but it is worth a question to the recruiter.",
    h1b_ok: "Counts come from certified H-1B labor condition applications filed with the Department of Labor.",
    years_over: "The posting's stated minimum is above your limit.",
    years_ok: "Within your experience limit.",
    pay_below: "Even the top of the stated range is under your pay floor.",
    pay_ok: "At or above your pay floor."
  };
  var SPONSOR_FACT = {
    denied: "Says no sponsorship", restricted: "Citizens or clearance only", offered: "Says sponsorship is possible",
    unclear: "Asks for work authorization, silent on sponsorship", silent: "Not mentioned"
  };

  function h1bLinks(company, title, rec) {
    var c = encodeURIComponent(company || "");
    var t = encodeURIComponent((title || "").replace(/\(.*?\)|,.*$/g, "").trim());
    return '<a href="https://www.e-verify.gov/e-verify-employer-search" target="_blank" rel="noopener">E-Verify employer search</a>' +
           '<a href="https://www.myvisajobs.com/Search_Visa_Sponsor.aspx?N=' + c + '" target="_blank" rel="noopener">MyVisaJobs</a>' +
           '<a href="https://h1bdata.info/index.php?em=' + c + '&job=' + t + '&city=&year=all+years" target="_blank" rel="noopener">H1BData for this title</a>';
  }


  // ---------- marks: applied / not interested (kept in this browser) ----------
  var marks = load("marks", {});
  (function () { var cut = Date.now() - 365 * 864e5; Object.keys(marks).forEach(function (id) { if (!marks[id] || !(marks[id].t > cut)) delete marks[id]; }); })();
  var MARK_WORD = { a: "Applied", n: "Not interested" };
  function markOf(id) { return marks[id] ? marks[id].s : ""; }
  function setMark(m, s) {
    if (!s || markOf(m.id) === s) delete marks[m.id];
    else marks[m.id] = { s: s, t: Date.now(), co: m.company, ti: m.title };
    save("marks", marks);
  }

  // ---------- interview prep: searches, not scraped content ----------
  function cleanCo(c) { return String(c || "").replace(/[,.\s]+(inc|llc|corp|corporation|co|ltd|plc|holdings)\.?$/i, "").replace(/\s+/g, " ").trim(); }
  function cleanTitle(t) { return String(t || "").replace(/\(.*?\)/g, "").replace(/\s+[-–—|:].*$/, "").replace(/,.*$/, "").replace(/\s+/g, " ").trim(); }
  function prepLinks(company, title, skills) {
    var c = cleanCo(company), t = cleanTitle(title), who = c ? '"' + c + '" ' : "";
    var google = function (q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); };
    var ask = "I'm interviewing for the " + (title || "role") + (company ? " position at " + company : "") + "." +
      (skills && skills.length ? " The posting mentions " + skills.slice(0, 6).join(", ") + "." : "") +
      " Describe the likely interview structure (rounds, who I meet, what each round tests), give me 15 realistic questions with what a strong answer covers, and a one-week prep plan. Say which parts you are confident about and which are guesses.";
    return [
      ["Glassdoor interview reviews", "what candidates posted", google("site:glassdoor.com/Interview " + who + t + " interview questions")],
      ["Reddit threads", "r/cscareerquestions, r/consulting and more", google("site:reddit.com " + who + t + " interview")],
      ["Blind", "anonymous posts from employees", google("site:teamblind.com " + who + t + " interview")],
      ["Process and rounds, any site", "a general search", google(who + t + " interview process rounds questions")],
      ["Ask Claude for a prep plan", "opens a new chat with this role filled in", "https://claude.ai/new?q=" + encodeURIComponent(ask)]
    ];
  }
  function prepMenu(company, title, skills) {
    if (!company && !title) return "";
    return '<details class="menu"><summary class="btn">Interview prep</summary><div class="menu-pop">' +
      prepLinks(company, title, skills).map(function (l) {
        return '<a href="' + esc(l[2]) + '" target="_blank" rel="noopener">' + esc(l[0]) + "<span>" + esc(l[1]) + "</span></a>";
      }).join("") + '<p class="menu-note">These open searches. What you find is other people’s accounts, not confirmed.</p></div></details>';
  }
  document.addEventListener("click", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll("details.menu[open]"), function (d) { if (!d.contains(e.target)) d.removeAttribute("open"); });
  });

  // ---------- reading a posting from any link ----------
  var READER = "https://r.jina.ai/";
  var BLOCKED = /just a moment|access denied|enable javascript|verify you are (a )?human|captcha|sign in to (see|view|continue)|log in to (see|view|continue)|403 forbidden|are you a robot/i;
  function timed(url, ms) {
    var ctl = typeof AbortController === "function" ? new AbortController() : null, t = ctl && setTimeout(function () { ctl.abort(); }, ms);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }, function (e) { clearTimeout(t); throw e; });
  }
  function tidyMarkdown(s) {
    return String(s).replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/(\*\*|__)/g, "")
      .replace(/^#{1,6}\s*/gm, "").replace(/^\s*[*+-]\s+/gm, "• ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function htmlToText(html) {
    var prep = String(html).replace(/<\/(p|div|li|h\d|tr|ul|ol)>|<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "• ");
    var t = new DOMParser().parseFromString("<body>" + prep + "</body>", "text/html").body.textContent;
    if (/<\/?(p|div|li|br|ul|strong)\b/i.test(t)) return htmlToText(t);     // description stored with escaped tags
    return t.replace(/[ \t ]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function fromReader(raw) {
    var title = (/^Title:\s*(.*)$/m.exec(raw) || [])[1] || "", i = raw.indexOf("Markdown Content:");
    var body = tidyMarkdown(i >= 0 ? raw.slice(i + 17) : raw);
    if (body.length < 300 || BLOCKED.test(body.slice(0, 800))) throw new Error("the page had no readable posting");
    return { text: body.slice(0, 40000), pageTitle: title.trim() };
  }
  function fromHtml(html) {
    var doc = new DOMParser().parseFromString(html, "text/html"), job = null;
    Array.prototype.forEach.call(doc.querySelectorAll('script[type="application/ld+json"]'), function (s) {
      try {
        (function walk(v) {
          if (job || !v) return;
          if (Array.isArray(v)) return v.forEach(walk);
          if (typeof v === "object") { if ([].concat(v["@type"] || []).indexOf("JobPosting") >= 0) job = v; else if (v["@graph"]) walk(v["@graph"]); }
        })(JSON.parse(s.textContent));
      } catch (e) { /* not JSON */ }
    });
    if (job && job.description) {
      var text = htmlToText(job.description), sal = job.baseSalary && job.baseSalary.value, loc = [].concat(job.jobLocation || [])[0];
      if (sal && sal.minValue && sal.maxValue && !/\$\s?\d/.test(text)) text += "\n\nThe base salary range for this role is $" + Math.round(sal.minValue) + " - $" + Math.round(sal.maxValue) + ".";
      var addr = loc && loc.address;
      return { text: text, title: job.title, company: job.hiringOrganization && job.hiringOrganization.name,
        loc: addr ? [addr.addressLocality, addr.addressRegion].filter(Boolean).join(", ") : "" };
    }
    Array.prototype.forEach.call(doc.querySelectorAll("script,style,nav,header,footer,noscript,svg"), function (n) { n.remove(); });
    var body = (doc.body ? doc.body.textContent : "").replace(/[ \t ]+/g, " ").replace(/\s*\n\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (body.length < 300 || BLOCKED.test(body.slice(0, 800))) throw new Error("the page had no readable posting");
    return { text: body.slice(0, 40000), pageTitle: (doc.title || "").trim() };
  }
  function readUrl(url) {
    return timed(READER + url, 30000).then(fromReader).catch(function () {
      return timed("https://api.allorigins.win/raw?url=" + encodeURIComponent(url), 20000).then(fromHtml);
    });
  }
  function knownCompany(s) {
    var hay = " " + String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ", best = null;
    window.SS_BOARDS.forEach(function (g) {
      g.items.forEach(function (b) {
        var n = b[2].toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (n.length >= 3 && hay.indexOf(" " + n + " ") >= 0 && (!best || n.length > best.n.length)) best = { n: n, name: b[2], q: b[4] || b[2] };
      });
    });
    return best;
  }
  function hostCompany(url) {
    var u, m; try { u = new URL(url); } catch (e) { return ""; }
    var h = u.hostname.replace(/^www\./, ""), seg = u.pathname.split("/").filter(Boolean);
    if ((m = /^([a-z0-9-]+)\.wd\d+\.myworkdayjobs\.com$/i.exec(h))) return prettySlug(m[1]);
    if (/(^|\.)(smartrecruiters\.com|workable\.com|jobvite\.com|breezy\.hr)$/i.test(h)) return seg[0] ? prettySlug(seg[0]) : "";
    if ((m = /^(?:careers|jobs)-([a-z0-9-]+)\.icims\.com$/i.exec(h))) return prettySlug(m[1]);
    if (/(linkedin|indeed|glassdoor|ziprecruiter|monster|builtin|wellfound|angel)\./i.test(h)) return "";
    var parts = h.split(".").filter(function (p) { return !/^(careers?|jobs?|apply|boards?|recruiting|talent|join|work|www\d*|en|us|hire|workforcenow|ats)$/i.test(p); });
    return parts.length >= 2 ? prettySlug(parts[parts.length - 2]) : "";
  }
  function cleanPageTitle(t) {
    t = String(t || "").split(/\s+[|\-–—]\s+/)[0].replace(/\s+(at|@)\s+.+$/i, "").replace(/^Job Application for\s+/i, "").trim();
    return /^(careers?|jobs?|job details?|apply|home)$/i.test(t) ? "" : t;
  }
  function titleCompany(t) {
    var m = /\s(?:at|@)\s+([^|\-–—]+?)(?:\s+[|\-–—]\s+.*)?$/i.exec(t || "");
    if (m) return m[1].trim();
    var parts = String(t || "").split(/\s+[|\-–—]\s+/);
    var last = parts.length > 1 ? parts[parts.length - 1].trim() : "";
    return last && last.split(/\s+/).length <= 3 && !/careers?|jobs?|apply|workday|greenhouse|lever/i.test(last) ? last : "";
  }

  // ---------- sponsorship history (Department of Labor LCA and PERM data) ----------
  var PERIOD = "the last 12 months", PERIODS = ["two years ago", "the year before", "the last 12 months"];
  var num = Core.num;
  function pct(a, b) { return b ? Math.round(a / b * 100) + "%" : "0%"; }
  function roleCount(rec, title) { return rec ? LCA.role(rec, title).n : 0; }
  function withH1b(r, rec, title) { return Core.withH1b(r, rec, title, profile); }
  function tile(big, label, detail) {
    return '<div class="sp-tile"><b>' + big + '</b><span class="sp-k">' + label + "</span>" + (detail ? '<span class="sp-d">' + detail + "</span>" : "") + "</div>";
  }
  function yearRow(label, v) {
    return "<tr><th scope=\"row\">" + label + "</th><td>" + num(v[0]) + "</td><td>" + num(v[1]) + "</td><td><b>" + num(v[2]) + "</b></td></tr>";
  }
  // What the posting says is one thing; what the company has actually filed is another. This is the second.
  function h1bFact(rec, state, title, company, saysEverify) {
    var links = '<p class="h1b-links">' + h1bLinks(company, title, rec) + "</p>";
    var input = '<label class="h1b-other">Files under another legal name? <input type="text" class="h1b-co" placeholder="e.g. Maplebear for Instacart" aria-label="Legal company name for the filing lookup"></label>';
    if (state === "loading") return '<p class="h1b-sum muted">Checking Department of Labor filings…</p>';
    if (state === "none") return '<p class="h1b-sum muted">Add the company name to see its sponsorship history.</p><label class="h1b-other">Company <input type="text" class="h1b-co" placeholder="Company name" aria-label="Company name for the filing lookup"></label>';
    if (!rec) return '<p class="h1b-sum muted">Couldn’t load the filing data. Check it here instead:</p>' + links;
    var all = rec.y[0] + rec.y[1] + rec.y[2], perm = rec.pm[1] + rec.pm[2];
    if (!all && !perm) return '<p class="h1b-sum"><b>No certified H-1B or green-card filings</b> under this name in the last three years.</p>' + input + links;

    var ro = LCA.role(rec, title), named = ro.fam !== "other", newIn = rec.k[0] + rec.k[1];
    var change = rec.y[1] ? Math.round((rec.n - rec.y[1]) / rec.y[1] * 100) : null;
    var html = '<div class="sp"><div class="sp-tiles">';
    html += tile(num(rec.n), "H-1B filings, " + esc(PERIOD), change === null ? "none the year before" : (change > 0 ? "up " + change + "%" : change < 0 ? "down " + (-change) + "%" : "level") + " on the year before (" + num(rec.y[1]) + ")");
    if (named) html += tile(num(ro.n), "for " + esc(ro.label) + " roles",
      ro.n ? (ro.fresh + ro.transfer) + " new to the company, " + ro.entry + " at entry wage levels (I–II)" + (ro.wage ? ", typical base " + k(ro.wage) : "")
           : (ro.prev + ro.prev2 ? (ro.prev + ro.prev2) + " in the two years before" : "none in three years"));
    if (rec.n) html += tile(pct(newIn, rec.n), "of filings brought someone new in", num(rec.k[0]) + " new hires, " + num(rec.k[1]) + " moved from another employer, " + num(rec.k[2]) + " extensions or amendments");
    if (rec.n) html += tile(num(rec.m), "at New York City area worksites", pct(rec.m, rec.n) + " of last year’s filings" + (named && ro.n ? ", " + ro.metro + " in this role type" : ""));
    html += tile(num(rec.pm[2]), "green-card cases certified, " + esc(PERIOD), num(rec.pm[1]) + " the year before" + (named && ro.perm ? ", " + ro.perm + " for " + esc(ro.label) + " roles" : ""));
    html += "</div>";

    html += '<table class="sp-years"><caption>Certified H-1B filings by 12-month period</caption><thead><tr><td></td>' +
      PERIODS.map(function (p) { return '<th scope="col">' + esc(p) + "</th>"; }).join("") + "</tr></thead><tbody>" + yearRow("All roles", rec.y) +
      (named ? yearRow(esc(ro.label.charAt(0).toUpperCase() + ro.label.slice(1)) + " roles", [ro.prev2, ro.prev, ro.n]) : "") + "</tbody></table>";

    var same = ro.titles.slice(0, 5), list = same.length ? same : rec.titles.slice(0, 4);
    if (list.length) html += '<p class="sp-h">' + (same.length ? "Titles it filed for in this role type" : "Titles it filed for most") + '</p><ul class="h1b-titles">' + list.map(function (t) {
      return "<li>" + esc(t.title) + ' <span class="muted">' + t.n + " filing" + (t.n > 1 ? "s" : "") + (t.wage ? ", " + k(t.wage) + " median base" : "") + "</span></li>";
    }).join("") + "</ul>";

    html += '<p class="sp-ev"><b>E-Verify.</b> ' + (saysEverify ? "This posting says the employer uses E-Verify. " : "") +
      "The STEM OPT extension needs an E-Verify employer. Search the official list for “" + esc(rec.names[0] || company) + "”; there is no public feed to check it automatically.</p>";
    html += '<p class="h1b-names muted">Filed as ' + rec.names.map(esc).join("; ") + ". One filing is a request to employ one person, not an approved visa.</p>" + input + links + "</div>";
    return html;
  }

  // ---------- limits ----------
  function renderLimits() {
    $("lim-sponsor").textContent = profile.needsSponsorship ? "Needs sponsorship" : "No sponsorship needed";
    $("lim-years").textContent = "Up to " + profile.maxYears + " years asked" + (profile.yearsGrace ? " (" + (profile.maxYears + 1) + " = ask)" : "");
    $("lim-pay").textContent = profile.salaryFloor > 0 ? "Base pay from " + k(profile.salaryFloor) : "Any pay";
    $("lim-h1b").textContent = profile.requireH1b ? "Company files H-1Bs" : "Any company";
    $("f-h1b").checked = !!profile.requireH1b;
    $("f-sponsor").checked = !!profile.needsSponsorship;
    $("f-years").value = profile.maxYears;
    $("f-years-hard").value = profile.yearsHard ? "1" : "0";
    $("f-years-grace").value = profile.yearsGrace ? "1" : "0";
    $("f-pay").value = profile.salaryFloor;
    $("f-pay-hard").value = profile.salaryHard ? "1" : "0";
  }
  $("edit-limits").addEventListener("click", function () {
    var f = $("limits-form"), open = f.hidden;
    f.hidden = !open; this.setAttribute("aria-expanded", String(open));
    if (open) $("f-years").focus();
  });
  $("limits-form").addEventListener("submit", function (e) {
    e.preventDefault();
    profile = {
      needsSponsorship: $("f-sponsor").checked,
      maxYears: Math.max(0, parseInt($("f-years").value || "0", 10)),
      yearsHard: $("f-years-hard").value === "1",
      yearsGrace: $("f-years-grace").value === "1" ? 1 : 0,
      salaryFloor: Math.max(0, parseInt($("f-pay").value || "0", 10)),
      salaryHard: $("f-pay-hard").value === "1",
      requireH1b: $("f-h1b").checked,
      v: 2
    };
    save("profile", profile); renderLimits();
    $("limits-form").hidden = true; $("edit-limits").setAttribute("aria-expanded", "false");
    if (lastCheck) runCheck(lastCheck.text, lastCheck.meta);
    if (scanJobs.length) { scanJobs.forEach(function (j) { j.r = withH1b(SS.analyze(j.text, profile), j.h1b, j.title); }); renderScan(); }
    renderFeed(true);
  });
  $("reset-limits").addEventListener("click", function () {
    profile = Object.assign({}, APP_DEFAULTS); save("profile", profile); renderLimits();
  });

  // ---------- tabs ----------
  var tabs = [$("tab-new"), $("tab-check"), $("tab-scan")];
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      $(x.getAttribute("aria-controls")).hidden = !on;
    });
    save("tab3", t.id);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; selectTab(n); n.focus(); }
    });
  });

  // ---------- job-board fetching ----------
  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status === 404 ? "not found" : "HTTP " + r.status); return r.json(); });
  }
  var normalize = Core.normalize;
  function fetchBoard(ats, slug, name) {
    if (ats === "greenhouse") return getJSON("https://boards-api.greenhouse.io/v1/boards/" + slug + "/jobs?content=true").then(function (j) { return j.jobs.map(function (x) { return normalize(ats, slug, name, x); }); });
    if (ats === "lever") return getJSON("https://api.lever.co/v0/postings/" + slug + "?mode=json").then(function (j) { return j.map(function (x) { return normalize(ats, slug, name, x); }); });
    return getJSON("https://api.ashbyhq.com/posting-api/job-board/" + encodeURIComponent(slug) + "?includeCompensation=true").then(function (j) { return (j.jobs || []).map(function (x) { return normalize(ats, slug, name, x); }); });
  }
  function prettySlug(s) { return String(s || "").replace(/usa$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function fetchOne(p) {
    var name = prettySlug(p.slug);
    if (p.ats === "greenhouse") {
      if (!p.slug) return Promise.reject(new Error("This link only has a job number. Open the posting, copy its text, and paste that instead."));
      return getJSON("https://boards-api.greenhouse.io/v1/boards/" + p.slug + "/jobs/" + p.id).then(function (x) { return normalize("greenhouse", p.slug, name, x); });
    }
    if (p.ats === "lever") return getJSON("https://api.lever.co/v0/postings/" + p.slug + "/" + p.id).then(function (x) { return normalize("lever", p.slug, name, x); });
    return fetchBoard("ashby", p.slug, name).then(function (jobs) {
      var j = jobs.filter(function (x) { return x.id === "ab:" + p.id; })[0];
      if (!j) throw new Error("That job is no longer on the board.");
      return j;
    });
  }

  // ---------- rendering a verdict ----------
  function renderPosting(r) {
    var marks = [];
    r.findings.forEach(function (f) {
      if (f.level === "info" && f.code !== "everify") return;
      var lv = f.level === "info" ? "good" : f.level;
      f.evidence.forEach(function (e) { marks.push({ s: e.start, e: e.end, lv: lv, code: f.code }); });
    });
    marks.sort(function (a, b) { return a.s - b.s || (a.lv === "skip" ? -1 : 1); });
    var out = "", pos = 0;
    marks.forEach(function (m) {
      if (m.s < pos) return;
      out += esc(r.text.slice(pos, m.s)) + '<mark class="m-' + m.lv + '" data-code="' + m.code + '">' + esc(r.text.slice(m.s, m.e)) + "</mark>";
      pos = m.e;
    });
    return out + esc(r.text.slice(pos));
  }

  function renderVerdict(r, meta, target, rec, state, onCompany) {
    var company = (meta && meta.company) || "";
    var title = (meta && meta.title) || "";
    var rawWhere = meta && (meta.locs && meta.locs.length ? meta.locs.join("; ") : meta.location) || "";
    var where = shortLoc(rawWhere) ? (meta && meta.locs && meta.locs.length ? meta.locs.map(shortLoc).filter(Boolean).join("; ") : shortLoc(rawWhere)) : "";
    var place = Roles.locClass(rawWhere, meta && meta.remote), dir = Roles.classify(title);
    var html = '<div class="verdict v-' + r.verdict + '"><div class="verdict-word">' + WORD[r.verdict] + "</div>" +
      '<p class="verdict-line">' + esc(r.headline) + "</p>" +
      (title && !meta.compact ? '<p class="verdict-role">' + esc(title) + (company ? " at " + esc(company) : "") + (meta.url ? ' <a href="' + esc(meta.url) + '" target="_blank" rel="noopener">Open posting</a>' : "") + "</p>" : "") +
      "</div>";
    if (!meta.compact && (title || company)) html += '<div class="verdict-tools">' + prepMenu(company, title, meta.skills) + "</div>";
    html += '<dl class="facts">' +
      "<div><dt>Sponsorship</dt><dd>" + SPONSOR_FACT[r.sponsorship] + "</dd></div>" +
      "<div><dt>Experience asked</dt><dd>" + yearsText(r.years) + "</dd></div>" +
      "<div><dt>Base pay</dt><dd>" + payText(r.pay) + "</dd></div>" +
      (where ? "<div><dt>Location</dt><dd>" + esc(where) + (place !== "other" && place !== "unknown" ? ' <span class="muted">(' + Roles.LOC_LABEL[place] + ")</span>" : "") + "</dd></div>" : "") +
      (dir ? "<div><dt>Role direction</dt><dd>" + esc(dir.label) + ' <span class="muted">(tier ' + dir.tier + ")</span></dd></div>" : "") +
      '<div class="fact-h1b"><dt>Sponsorship history' + (company ? " for " + esc(company) : "") + '</dt><dd>' +
      h1bFact(rec, state, title, company, r.findings.some(function (f) { return f.code === "everify"; })) + "</dd></div></dl>";
    var shown = r.findings.filter(function (f) { return f.code !== "years_ok" && f.code !== "pay_ok" && f.code !== "h1b_ok"; });
    if (shown.length) {
      html += '<ul class="finding-list">' + shown.map(function (f) {
        var ev = f.evidence.slice(0, 2).map(function (e) { return "<q>" + esc(e.text.length > 240 ? e.text.slice(0, 237) + "…" : e.text) + "</q>"; }).join("");
        return '<li class="f-' + LEVEL_CLASS[f.level] + '"><strong>' + esc(f.title) + "</strong><p>" + (EXPLAIN[f.code] || "") + "</p>" + ev + "</li>";
      }).join("") + "</ul>";
    }
    if (r.verdict !== "skip" && profile.needsSponsorship && (r.sponsorship === "unclear" || r.sponsorship === "silent")) {
      html += '<div class="ask-box"><strong>Ask before the first interview.</strong> The posting does not settle sponsorship, so it is worth one message to the recruiter:' +
        '<blockquote id="ask-text">Hi, I’m very interested in the ' + esc(title || "role") + '. I’m on F-1 OPT now and would need H-1B sponsorship later. Is this position open to candidates who will need sponsorship?</blockquote>' +
        '<button type="button" class="btn copy-ask">Copy message</button></div>';
    }
    target.innerHTML = html;
    var co = target.querySelector(".h1b-co");
    if (co && onCompany) co.addEventListener("change", function () { if (co.value.trim()) onCompany(co.value.trim()); });
    var cp = target.querySelector(".copy-ask");
    if (cp) cp.addEventListener("click", function () { copy(target.querySelector("blockquote").textContent, cp, "Copied"); });
  }

  // ---------- check one posting ----------
  var lastCheck = null;
  function runCheck(text, meta) {
    lastCheck = { text: text, meta: meta || {} };
    var r = SS.analyze(text, profile);
    var res = $("result");
    res.hidden = false;
    meta = Object.assign({}, meta || {});
    meta.skills = Core.summarize(r.text).skills;
    if (!meta.title) {
      var first = (r.text.split("\n").filter(function (l) { return l.trim(); })[0] || "").trim();
      if (first && first.length <= 90 && !/[.!?]$/.test(first)) meta.title = first;
    }
    var zone = $("verdict-zone");
    var show = function (company, query) {
      var m = Object.assign({}, meta, { company: company });
      if (!company) { renderVerdict(r, m, zone, null, "none", show); return; }
      renderVerdict(r, m, zone, null, "loading", show);
      var token = (lastCheck.token = {});
      LCA.lookup(query || company).then(function (rec) {
        if (lastCheck.token !== token) return;
        renderVerdict(withH1b(r, rec, m.title), m, zone, rec, "done", show);
      });
    };
    show(meta.company, meta.h1bQuery);
    $("posting-text").innerHTML = renderPosting(r);
    $("check-msg").textContent = "";
    $("verdict-zone").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
  function readAny(url) {
    $("check-msg").textContent = "Reading the page…"; $("check-btn").disabled = true;
    readUrl(url).then(function (got) {
      var host = ""; try { host = new URL(url).hostname.replace(/^www\./, ""); } catch (e) { /* ignore */ }
      var known = knownCompany(host + " " + (got.company || "") + " " + (got.pageTitle || ""));
      var company = got.company || (known && known.name) || hostCompany(url) || titleCompany(got.pageTitle) || "";
      var meta = { title: got.title || cleanPageTitle(got.pageTitle), company: company, url: url, locs: got.loc ? [got.loc] : [],
        h1bQuery: known && known.name === company ? known.q : company };
      runCheck(got.text, meta);
      $("check-msg").textContent = "Read " + num(got.text.length) + " characters from " + host + (company ? ". Company guessed as " + company + "; change it under Sponsorship history if that is wrong." : ". Add the company name under Sponsorship history to see its filings.");
    }).catch(function (err) {
      $("check-msg").textContent = "Couldn’t read that page (" + (err && err.message || "no answer") + "). Some sites block automatic readers. Open the posting, copy its text, and paste it here instead.";
    }).then(function () { $("check-btn").disabled = false; });
  }
  $("check-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = $("jd").value.trim();
    if (!raw) { $("check-msg").textContent = "Paste a posting or a job link first."; $("jd").focus(); return; }
    var isUrl = /^https?:\/\/\S+$/.test(raw);
    var link = isUrl ? SS.parseBoardUrl(raw) : null;
    if (link && link.id) {
      $("check-msg").textContent = "Fetching the posting…"; $("check-btn").disabled = true;
      fetchOne(link).then(function (j) { j.h1bQuery = aliasFor(link.slug) || j.company; runCheck(j.text, j); })
        .catch(function (err) { $("check-msg").textContent = "Couldn’t load that posting (" + err.message + "). Copy its text and paste it instead."; })
        .then(function () { $("check-btn").disabled = false; });
      return;
    }
    if (isUrl) { readAny(raw); return; }
    runCheck(raw, {});
  });

  var EXAMPLES = {
    deny: "Business Analyst, Payments\nNew York, NY\n\nWhat you'll do\n• Build dashboards that track authorization rates and chargebacks across card networks.\n• Partner with Risk and Product on pricing experiments.\n\nWhat we're looking for\n• 1-3 years of experience in analytics, consulting, or finance.\n• Strong SQL and one of Python or R.\n\nThe base salary range for this role is $95,000 - $125,000.\n\nPlease note that for this position, we are not able to consider candidates who currently or in the future will require visa sponsorship.",
    unclear: "Strategy & Operations Associate\nSan Francisco, CA (Hybrid)\n\nYou will own weekly business reviews and help leadership decide where to invest.\n\nAbout you\n• 2+ years in consulting, banking, or a strategy role.\n• Comfortable building models in Excel and SQL.\n\nOur expected base pay range for this position is $110,000 - $140,000.\n\nApplicants must be currently authorized to work in the United States on a full-time basis.",
    silent: "Data Analyst, Growth\nRemote (US)\n\nYou will design A/B tests, size opportunities, and turn messy event data into decisions.\n\nRequirements\n• 2-4 years of experience in product or marketing analytics.\n• Experience with experimentation and causal inference.\n\nCompensation: $100K - $130K. We participate in E-Verify."
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-example]"), function (b) {
    b.addEventListener("click", function () { $("jd").value = EXAMPLES[b.dataset.example]; runCheck($("jd").value, {}); });
  });

  function aliasFor(slug) {
    var hit = null;
    window.SS_BOARDS.forEach(function (g) { g.items.forEach(function (b) { if (b[1] === slug) hit = b[4] || b[2]; }); });
    return hit;
  }

  // ---------- scan job boards ----------
  var custom = load("customBoards", []);
  var selected = load("boardsOn", null);
  function allBoards() {
    var groups = window.SS_BOARDS.slice();
    if (custom.length) groups = groups.concat([{ group: "Added by you", items: custom }]);
    return groups;
  }
  function key(b) { return b[0] + ":" + b[1]; }
  function renderBoards() {
    if (!selected) { selected = {}; allBoards().forEach(function (g) { g.items.forEach(function (b) { if (b[3]) selected[key(b)] = true; }); }); }
    $("board-list").innerHTML = allBoards().map(function (g) {
      return '<div class="board-group"><p class="board-group-name">' + esc(g.group) + "</p>" + g.items.map(function (b) {
        return '<label class="board"><input type="checkbox" value="' + key(b) + '"' + (selected[key(b)] ? " checked" : "") + "> " + esc(b[2]) + "</label>";
      }).join("") + "</div>";
    }).join("");
  }
  $("board-list").addEventListener("change", function (e) {
    if (e.target.type === "checkbox") { if (e.target.checked) selected[e.target.value] = true; else delete selected[e.target.value]; save("boardsOn", selected); }
  });
  $("boards-all").addEventListener("click", function () { allBoards().forEach(function (g) { g.items.forEach(function (b) { selected[key(b)] = true; }); }); save("boardsOn", selected); renderBoards(); });
  $("boards-none").addEventListener("click", function () { selected = {}; save("boardsOn", selected); renderBoards(); });
  $("board-add").addEventListener("click", function () {
    var p = SS.parseBoardUrl($("board-url").value);
    if (!p || !p.slug) { $("board-msg").textContent = "Paste a careers link from job-boards.greenhouse.io, jobs.lever.co or jobs.ashbyhq.com."; return; }
    $("board-msg").textContent = "Checking that board…";
    fetchBoard(p.ats, p.slug, prettySlug(p.slug)).then(function (jobs) {
      var b = [p.ats, p.slug, prettySlug(p.slug), true];
      if (!custom.some(function (c) { return key(c) === key(b); })) custom.push(b);
      selected[key(b)] = true; save("customBoards", custom); save("boardsOn", selected); renderBoards();
      $("board-url").value = ""; $("board-msg").textContent = "Added " + b[2] + " (" + jobs.length + " open roles).";
    }).catch(function () { $("board-msg").textContent = "No public job board answered at that link."; });
  });

  $("kw").value = load("kw2", DEFAULT_KW);
  $("kw-not").value = load("kwNot", DEFAULT_NOT);
  function renderDirs() {
    var tiers = { 1: "Tier 1 · look at these first", 2: "Tier 2 · read each posting", 3: "Tier 3 · opportunistic" };
    $("dir-list").innerHTML = [1, 2, 3].map(function (t) {
      return '<div class="board-group"><p class="board-group-name">' + tiers[t] + "</p>" + Roles.list().filter(function (d) { return d.tier === t; }).map(function (d) {
        return '<label class="board"><input type="checkbox" value="' + d.id + '"' + (dirsOn[d.id] ? " checked" : "") + "> " + esc(d.label) + "</label>";
      }).join("") + "</div>";
    }).join("");
  }
  $("dir-list").addEventListener("change", function (e) {
    if (e.target.type === "checkbox") { if (e.target.checked) dirsOn[e.target.value] = true; else delete dirsOn[e.target.value]; save("dirs", dirsOn); }
  });
  $("dirs-all").addEventListener("click", function () { Roles.list().forEach(function (d) { dirsOn[d.id] = true; }); save("dirs", dirsOn); renderDirs(); });
  $("dirs-default").addEventListener("click", function () { dirsOn = Roles.defaults(); save("dirs", dirsOn); renderDirs(); });
  $("days").value = String(load("days", 3));

  var isUS = Core.isUS;
  function terms(s) { return s.split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean); }

  var scanJobs = [];
  var showing = { apply: true, ask: true, skip: false, hidden: false };
  var LOC_GROUP = { nyc: "nyc", nj: "nyc", remote: "remote", other: "other", unknown: "nyc" };   // unlisted locations stay visible
  var LOC_RANK = { nyc: 0, nj: 1, remote: 2, unknown: 3, other: 4 };
  function locVisible(j) { return locShow[LOC_GROUP[j.loc || "unknown"]]; }
  var seen = load("seen", {});

  $("scan-form").addEventListener("submit", function (e) {
    e.preventDefault();
    save("kw2", $("kw").value); save("kwNot", $("kw-not").value); save("days", parseInt($("days").value, 10));
    var anyDir = Object.keys(dirsOn).length > 0;
    var boards = [];
    allBoards().forEach(function (g) { g.items.forEach(function (b) { if (selected[key(b)]) boards.push(b); }); });
    if (!boards.length) { $("progress").hidden = false; $("progress-text").textContent = "Select at least one company."; return; }
    var want = terms($("kw").value), not = terms($("kw-not").value);
    var days = parseInt($("days").value, 10), since = days ? Date.now() - days * 864e5 : 0, usOnly = $("us-only").checked;
    scanJobs = []; var done = 0, failed = [];
    $("scan-btn").disabled = true; $("progress").hidden = false; $("scan-empty").hidden = true;
    var tick = function () {
      $("progress-bar").style.width = Math.round(done / boards.length * 100) + "%";
      $("progress-text").textContent = done < boards.length ? "Read " + done + " of " + boards.length + " job boards…"
        : "Read " + boards.length + " job boards" + (failed.length ? " (" + failed.join(", ") + " did not answer)" : "") + ".";
    };
    tick();
    var queue = boards.slice();
    function worker() {
      var b = queue.shift(); if (!b) return Promise.resolve();
      var mine = [];
      return fetchBoard(b[0], b[1], b[2]).then(function (jobs) {
        jobs.forEach(function (j) {
          var t = j.title.toLowerCase();
          var dir = Roles.classify(j.title, dirsOn);
          // A role is in if its title fits a selected direction or one of your extra words. With neither set, everything is in.
          if ((anyDir || want.length) && !dir && !want.some(function (w) { return t.indexOf(w) >= 0; })) return;
          if (not.some(function (w) { return t.indexOf(w) >= 0; })) return;
          j.dir = dir || Roles.classify(j.title);
          if (since && j.posted && j.posted < since) return;
          if (usOnly && !isUS(j)) return;
          // One row per role: the same title posted in several cities is merged.
          var dup = mine.filter(function (x) { return x.company === j.company && x.title === j.title; })[0];
          if (dup) { if (j.location && dup.locs.indexOf(j.location) < 0) dup.locs.push(j.location); return; }
          j.locs = j.location ? [j.location] : [];
          j.isNew = !seen[j.id];
          mine.push(j);
        });
        return mine.length ? LCA.lookup(b[4] || b[2]) : null;
      }).then(function (rec) {
        mine.forEach(function (j) { j.loc = Roles.locClass(j.locs, j.remote); j.h1b = rec; j.r = withH1b(SS.analyze(j.text, profile), rec, j.title); scanJobs.push(j); });
      }).catch(function () { failed.push(b[2]); }).then(function () { done++; tick(); renderScan(); return worker(); });
    }
    Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
      $("scan-btn").disabled = false;
      scanJobs.forEach(function (j) { seen[j.id] = Date.now(); });
      var cutoff = Date.now() - 90 * 864e5; Object.keys(seen).forEach(function (id) { if (seen[id] < cutoff) delete seen[id]; });
      save("seen", seen);
      if (!scanJobs.length) { $("scan-empty").hidden = false; $("scan-empty").innerHTML = "<p>No roles matched. Try a longer time window, more companies, or broader title words.</p>"; $("scan-results").hidden = true; }
    });
  });

  var ORDER = { apply: 0, ask: 1, skip: 2 };
  function h1bSub(j) {
    var ro = LCA.role(j.h1b, j.title);
    return ro.fam === "other" ? "total" : ro.n + " in role type" + (ro.n ? ", " + (ro.fresh + ro.transfer) + " new" : "");
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : "#"; }
  function chip(s) { return s ? "<span>" + esc(s) + "</span>" : ""; }
  // "New York, New York, United States of America" -> "New York, NY"; country names only add width.
  function shortLoc(s) {
    return String(s || "").replace(/,?\s*\(?\b(United States of America|United States|USA|U\.S\.A?\.?)\b\)?/gi, "").replace(/\s+-\s+/g, ", ").replace(/^New York, New York\b/i, "New York, NY").replace(/\s{2,}/g, " ").replace(/[,\s]+$/, "").trim();
  }
  function whereText(locs) {
    locs = (locs || []).map(shortLoc).filter(Boolean).slice().sort(function (a, b) { return LOC_RANK[Roles.locClass(a)] - LOC_RANK[Roles.locClass(b)]; });
    return locs.slice(0, 2).join("; ") + (locs.length > 2 ? " +" + (locs.length - 2) + " more" : "");
  }
  function factsOf(pay, years, mode, degree) {
    return [pay ? payText(pay) + " base" : "Pay not listed", years ? yearsText(years) : "Years not listed", mode, degree].filter(Boolean);
  }
  var QA_A = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var QA_N = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  // One card for a role, whether it came from the daily scan or from a scan you ran yourself.
  function cardHTML(m, selected) {
    var mk = markOf(m.id);
    return '<li class="job j-' + m.verdict + (mk ? " is-" + mk : "") + (selected ? " is-sel" : "") + '" data-id="' + esc(m.id) + '">' +
      '<button type="button" class="job-open" data-id="' + esc(m.id) + '" aria-current="' + (selected ? "true" : "false") + '">' +
        '<span class="job-line"><span class="tag t-' + m.verdict + '">' + WORD[m.verdict] + "</span>" +
          (mk ? '<span class="mk-badge mk-badge-' + mk + '">' + MARK_WORD[mk] + "</span>" : "") +
          (m.isNew ? '<span class="new">new</span>' : "") + '<span class="job-when">' + esc(m.when) + "</span></span>" +
        '<span class="job-title">' + esc(m.title) + "</span>" +
        '<span class="job-co"><b>' + esc(m.company) + "</b>" + (m.where ? " · " + esc(m.where) : "") + "</span>" +
        '<span class="job-facts">' + m.facts.map(chip).join("") + (m.senior ? '<span class="fj-flag">Senior title, years not stated</span>' : "") + "</span>" +
        '<span class="job-why">' + esc(m.why || "") + (m.h1b ? '<span class="muted">' + (m.why ? " · " : "") + esc(m.h1b) + "</span>" : "") + "</span>" +
      "</button>" +
      '<span class="job-qa"><button type="button" class="qa qa-a" data-mk="a" data-id="' + esc(m.id) + '" aria-pressed="' + (mk === "a") + '" aria-label="Applied" title="Applied (a)">' + QA_A + "</button>" +
      '<button type="button" class="qa qa-n" data-mk="n" data-id="' + esc(m.id) + '" aria-pressed="' + (mk === "n") + '" aria-label="Not interested" title="Not interested (x)">' + QA_N + "</button></span></li>";
  }
  var models = {};      // id -> card model, so a click anywhere can find its role
  function detailHead(m) {
    var mk = markOf(m.id);
    return '<div class="dt-head"><button type="button" class="link-btn dt-back">← All roles</button>' +
      '<h2 class="dt-title">' + esc(m.title) + "</h2>" +
      '<p class="dt-co"><b>' + esc(m.company) + "</b>" + (m.where ? " · " + esc(m.where) : "") + (m.when ? ' · <span class="muted">' + esc(m.when) + "</span>" : "") + "</p>" +
      '<p class="dt-chips">' + m.facts.map(chip).join("") + (m.dir ? '<span class="dir dir-t' + m.dir.tier + '">' + esc(m.dir.label) + "</span>" : "") +
        (m.skills && m.skills.length ? '<span class="dt-skills">' + m.skills.map(esc).join(" · ") + "</span>" : "") + "</p>" +
      '<div class="dt-actions"><a class="btn btn-primary" href="' + esc(m.url) + '" target="_blank" rel="noopener">Open posting ↗</a>' +
        '<button type="button" class="btn mk" data-mk="a" data-id="' + esc(m.id) + '" aria-pressed="' + (mk === "a") + '">' + QA_A + " Applied</button>" +
        '<button type="button" class="btn mk" data-mk="n" data-id="' + esc(m.id) + '" aria-pressed="' + (mk === "n") + '">' + QA_N + " Not interested</button>" +
        prepMenu(m.company, m.title, m.skills) + "</div></div>";
  }
  function fillDetail(target, m) {
    var tok = (target._tok = {});
    target.innerHTML = detailHead(m) + '<div class="dt-body"><p class="muted">Loading the posting…</p></div>';
    var body = target.querySelector(".dt-body");
    Promise.all([m.text(), m.rec()]).then(function (got) {
      if (target._tok !== tok) return;
      var r = withH1b(SS.analyze(got[0], profile), got[1], m.title);
      body.innerHTML = '<div class="dlg-verdict"></div><h3>The posting, marked up</h3>' +
        '<p class="legend"><span class="key key-skip">rules you out</span><span class="key key-ask">needs a check</span><span class="key key-good">works for you</span></p><div class="posting-text"></div>';
      renderVerdict(r, { title: m.title, company: m.company, url: m.url, locs: m.locs, remote: m.remote, compact: true, skills: m.skills }, body.querySelector(".dlg-verdict"), got[1], "done");
      body.querySelector(".posting-text").innerHTML = renderPosting(r);
    }).catch(function () {
      if (target._tok !== tok) return;
      body.innerHTML = '<p>Couldn’t load the saved posting text. <a href="' + esc(m.url) + '" target="_blank" rel="noopener">Open the posting</a> and paste it under “Check a posting”.</p>';
    });
  }
  function syncMarks() {
    Array.prototype.forEach.call(document.querySelectorAll(".mk, .qa"), function (b) { b.setAttribute("aria-pressed", String(markOf(b.dataset.id) === b.dataset.mk)); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mk]"); if (!b) return;
    var m = models[b.dataset.id]; if (!m) return;
    setMark(m, b.dataset.mk); syncMarks(); renderFeed(); renderScan();
  });

  function scanModel(j) {
    var s = j.sum || (j.sum = Core.summarize(j.text));
    return (models[j.id] = { id: j.id, verdict: j.r.verdict, title: j.title, company: j.company, locs: j.locs || [], where: whereText(j.locs), remote: j.remote,
      when: j.posted ? "Posted " + new Date(j.posted).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "", isNew: j.isNew,
      facts: factsOf(j.r.pay, j.r.years, s.mode, s.degree), skills: s.skills, why: Core.reason(j.r), dir: j.dir, url: safeUrl(j.url),
      h1b: j.h1b ? num(j.h1b.n) + " H-1B filings · " + h1bSub(j) : "",
      text: function () { return Promise.resolve(j.text); }, rec: function () { return Promise.resolve(j.h1b); } });
  }
  function scanRows() {
    return scanJobs.filter(function (j) { return showing[j.r.verdict] && locVisible(j) && (showing.hidden || !markOf(j.id)); })
      .sort(function (a, b) {
        return ORDER[a.r.verdict] - ORDER[b.r.verdict] || (a.dir ? a.dir.tier : 9) - (b.dir ? b.dir.tier : 9) ||
          LOC_RANK[a.loc || "unknown"] - LOC_RANK[b.loc || "unknown"] || roleCount(b.h1b, b.title) - roleCount(a.h1b, a.title) ||
          ((b.h1b && b.h1b.n) || 0) - ((a.h1b && a.h1b.n) || 0) || (b.isNew - a.isNew) || (b.posted - a.posted);
      });
  }
  function renderScan() {
    var counts = { apply: 0, ask: 0, skip: 0 }, places = { nyc: 0, remote: 0, other: 0 }, marked = 0;
    scanJobs.forEach(function (j) { places[LOC_GROUP[j.loc || "unknown"]]++; if (markOf(j.id)) marked++; if (locVisible(j)) counts[j.r.verdict]++; });
    Object.keys(counts).forEach(function (v) { $("n-" + v).textContent = counts[v]; });
    Object.keys(places).forEach(function (v) { $("n-loc-" + v).textContent = places[v]; });
    $("n-hidden").textContent = marked;
    $("scan-results").hidden = !scanJobs.length;
    $("scan-list").innerHTML = scanRows().map(function (j) { return cardHTML(scanModel(j), false); }).join("") ||
      '<li class="empty-row muted">Nothing in the selected groups. Turn on another filter above.</li>';
  }
  Array.prototype.forEach.call(document.querySelectorAll("#scan-results .filter"), function (b) {
    var set = b.dataset.loc ? locShow : showing, key = b.dataset.loc || b.dataset.f;
    b.classList.toggle("is-on", !!set[key]);
    b.setAttribute("aria-pressed", String(!!set[key]));
    b.addEventListener("click", function () {
      set[key] = !set[key];
      b.classList.toggle("is-on", set[key]); b.setAttribute("aria-pressed", String(set[key]));
      if (b.dataset.loc) save("loc", locShow);
      renderScan();
    });
  });
  $("scan-list").addEventListener("click", function (e) {
    var btn = e.target.closest(".job-open"); if (!btn) return;
    var m = models[btn.dataset.id]; if (!m) return;
    $("dlg-title").textContent = m.title;
    fillDetail($("dlg-body"), m);
    $("job-dialog").showModal();
  });
  $("dlg-close").addEventListener("click", function () { $("job-dialog").close(); });
  $("job-dialog").addEventListener("click", function (e) { if (e.target === this) this.close(); });
  $("dlg-body").addEventListener("click", function (e) { if (e.target.closest(".dt-back")) $("job-dialog").close(); });

  // ---------- export ----------
  function visibleRows() {
    return scanRows();
  }
  function note(j) {
    var top = j.r.findings.filter(function (f) { return f.level === j.r.verdict; })[0];
    return "SponsorScope: " + WORD[j.r.verdict] + (top ? " (" + top.title + ")" : j.r.sponsorship === "silent" ? " (silent on sponsorship)" : "") +
      (j.h1b ? ". H-1B filings last 12 mo: " + j.h1b.n + ", " + roleCount(j.h1b, j.title) + " this role type, " + (j.h1b.k[0] + j.h1b.k[1]) + " new hires; green-card cases: " + j.h1b.pm[2] : "");
  }
  var today = function () { var d = new Date(); return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear(); };
  function copy(text, btn, done) {
    var ok = function () { var o = btn.textContent; btn.textContent = done; setTimeout(function () { btn.textContent = o; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
    function fallback() { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); ok(); } catch (e) { /* ignore */ } t.remove(); }
  }
  $("copy-sheet").addEventListener("click", function () {
    var rows = visibleRows();
    if (!rows.length) { $("export-msg").textContent = "Nothing to copy with the current filters."; return; }
    // Same columns as the tracker: Company, Title, Location, Link, Status, Date, Interview Stage, Interviewer, Notes, Week, Salary
    var tsv = rows.map(function (j) {
      return [j.company, j.title, (j.locs || [j.location]).join("; "), '=HYPERLINK("' + j.url.replace(/"/g, "") + '","link")', markOf(j.id) === "a" ? "Applied" : "", today(), "", "", note(j), "", j.r.pay ? payText(j.r.pay) : ""]
        .map(function (c) { return String(c).replace(/[\t\n]/g, " "); }).join("\t");
    }).join("\n");
    copy(tsv, $("copy-sheet"), "Copied " + rows.length + " rows");
    $("export-msg").textContent = "Click the first empty Company cell in your sheet and paste. Links show as “link”.";
  });
  $("dl-csv").addEventListener("click", function () {
    var rows = visibleRows();
    var q = function (c) { c = String(c == null ? "" : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; };
    var csv = ["Verdict,Company,Title,Role direction,Tier,Location,Link,Base pay,Min years,Sponsorship,H-1B filings (12 mo),H-1B filings for this role type,H-1B new hires and transfers (12 mo),H-1B filings the year before,Green-card cases (12 mo),Note,Posted"].concat(rows.map(function (j) {
      return [WORD[j.r.verdict], j.company, j.title, j.dir ? j.dir.label : "", j.dir ? j.dir.tier : "", (j.locs || [j.location]).join("; "), j.url, j.r.pay ? payText(j.r.pay) : "", j.r.years ? j.r.years.min : "",
        SPONSOR_FACT[j.r.sponsorship], j.h1b ? j.h1b.n : "", j.h1b ? roleCount(j.h1b, j.title) : "", j.h1b ? j.h1b.k[0] + j.h1b.k[1] : "", j.h1b ? j.h1b.y[1] : "", j.h1b ? j.h1b.pm[2] : "",
        note(j), j.posted ? new Date(j.posted).toISOString().slice(0, 10) : ""].map(q).join(",");
    })).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "sponsorscope-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---------- new roles from the daily scan ----------
  // The scan runs on a schedule (scan/daily.js) and publishes its results to a branch of the repository.
  var FEED_BASE = window.SS_FEED_BASE || "https://raw.githubusercontent.com/ChengWu-Data/chengwu-data.github.io/sponsorscope-scan/";
  var feed = null, feedTextsP = null, selectedId = null, shownId = null, lastIds = [];
  var feedShow = Object.assign({ hours: 24, view: "inbox", sort: "best", apply: true, ask: true, skip: false, nyc: true, remote: true, other: false, t1: true, t2: true, t3: false }, load("feed", {}));
  feedShow.q = "";
  function wide() { return window.matchMedia("(min-width: 1101px)").matches; }
  function ago(ms) {
    var h = (Date.now() - ms) / 36e5;
    if (h < 1) return "under an hour ago";
    if (h < 36) return Math.round(h) + (Math.round(h) === 1 ? " hour ago" : " hours ago");
    return Math.round(h / 24) + " days ago";
  }
  function feedTier(j) { var d = Roles.byId[j.dir]; return "t" + (d ? d.tier : 3); }
  // A senior-sounding title often hides the years a posting does not state, so those sort below the rest and say so.
  var SENIOR = /\b(senior|sr\.?|lead|group|manager,? (ii|iii|2|3)|(ii|iii|iv)$)\b/i;
  function feedSenior(j) { return SENIOR.test(j.title) && !j.years ? 1 : 0; }
  function feedWhen(j) { return (j.posted && Math.abs(j.posted - j.when) < 1000 ? "Posted " : "First seen ") + ago(j.when); }
  function feedInWindow(j) { return Date.now() - j.when <= feedShow.hours * 36e5; }
  function feedHay(j) { return j._h || (j._h = [j.title, j.company, (j.skills || []).join(" "), (j.locs || []).join(" "), j.why].join(" ").toLowerCase()); }
  function feedQ(j) { var q = feedShow.q.toLowerCase().split(/\s+/).filter(Boolean); return q.every(function (w) { return feedHay(j).indexOf(w) >= 0; }); }
  // Which view a role belongs to: your unmarked list, what you applied to, what you passed on, or all of them.
  function feedInView(j) {
    var mk = markOf(j.id), v = feedShow.view;
    if (v === "applied") return mk === "a";
    if (v === "no") return mk === "n";
    return feedInWindow(j) && (v === "all" || !mk);
  }
  function feedFacet(j) { return feedShow.view === "applied" || feedShow.view === "no" || (feedShow[j.verdict] && feedShow[LOC_GROUP[j.loc || "unknown"]] && feedShow[feedTier(j)]); }
  function feedRows() {
    var by = {
      best: function (a, b) { return ORDER[a.verdict] - ORDER[b.verdict] || feedSenior(a) - feedSenior(b) || feedTier(a).localeCompare(feedTier(b)) || LOC_RANK[a.loc || "unknown"] - LOC_RANK[b.loc || "unknown"] || b.when - a.when; },
      "new": function (a, b) { return b.when - a.when; },
      pay: function (a, b) { return (b.pay ? b.pay[1] : 0) - (a.pay ? a.pay[1] : 0) || b.when - a.when; }
    };
    var marked = feedShow.view === "applied" || feedShow.view === "no";
    return feed.jobs.filter(function (j) { return feedInView(j) && feedFacet(j) && feedQ(j); })
      .sort(marked ? function (a, b) { return marks[b.id].t - marks[a.id].t; } : by[feedShow.sort] || by.best);
  }
  function feedH1bShort(j) {
    var h = j.h1b;
    if (!h) return "";
    if (!h.n && !h.prev) return "No H-1B filings in three years";
    return num(h.n) + " H-1B filings last year" + (h.fam && h.role ? ", " + num(h.role) + " for " + h.fam + " roles" : "");
  }
  function feedModel(j) {
    if (j._m) return j._m;
    var dir = Roles.byId[j.dir];
    return (models[j.id] = j._m = { id: j.id, verdict: j.verdict, title: j.title, company: j.company, locs: j.locs || [], where: whereText(j.locs), remote: j.remote,
      when: feedWhen(j), facts: factsOf(j.pay && { lo: j.pay[0], hi: j.pay[1] }, j.years && { min: j.years[0], max: j.years[1] }, j.mode, j.degree),
      skills: j.skills || [], why: j.why, dir: dir, url: safeUrl(j.url), senior: feedSenior(j), h1b: feedH1bShort(j),
      text: function () {
        feedTextsP = feedTextsP || fetch(FEED_BASE + "texts.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
        return feedTextsP.then(function (t) { if (!t[j.id]) throw new Error("no text"); return t[j.id]; }).catch(function (e) { feedTextsP = null; throw e; });
      },
      rec: function () { return LCA.lookup(j.query || j.company).catch(function () { return null; }); } });
  }
  function showDetail(force) {
    var body = $("detail-body"), j = selectedId && feed && feed.jobs.filter(function (x) { return x.id === selectedId; })[0];
    $("detail-empty").hidden = !!j; body.hidden = !j;
    if (!j) { shownId = null; $("ws").classList.remove("detail-open"); return; }
    if (shownId !== selectedId || force) { fillDetail(body, feedModel(j)); shownId = selectedId; }
  }
  function selectRole(id, open) {
    selectedId = id;
    Array.prototype.forEach.call($("feed-list").children, function (li) {
      var on = li.dataset.id === id; li.classList.toggle("is-sel", on);
      var b = li.querySelector(".job-open"); if (b) b.setAttribute("aria-current", String(on));
    });
    showDetail(false);
    if (open && !wide()) { $("ws").classList.add("detail-open"); $("scrim").hidden = false; $("detail").scrollTop = 0; }
  }
  function renderFeed(force) {
    if (!feed) return;
    Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
      var on = Number(b.dataset.hours) === feedShow.hours;
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".view-btn"), function (b) {
      var on = b.dataset.view === feedShow.view; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on));
    });
    var q = feed.jobs.filter(feedQ), n = { inbox: 0, applied: 0, no: 0, all: 0 }, f = {};
    ["apply", "ask", "skip", "nyc", "remote", "other", "t1", "t2", "t3"].forEach(function (k) { f[k] = 0; });
    q.forEach(function (j) {
      var mk = markOf(j.id), win = feedInWindow(j);
      if (win && !mk) n.inbox++;
      if (win) n.all++;
      if (mk === "a") n.applied++;
      if (mk === "n") n.no++;
      if (feedInView(j)) {
        var place = LOC_GROUP[j.loc || "unknown"], tier = feedTier(j);
        f[place]++; f[tier]++;
        if (feedShow[place] && feedShow[tier]) f[j.verdict]++;
      }
    });
    Object.keys(n).forEach(function (k) { $("vn-" + k).textContent = n[k]; });
    Object.keys(f).forEach(function (k) { $("fn-" + k).textContent = f[k]; });
    Array.prototype.forEach.call(document.querySelectorAll(".feed-filter"), function (b) {
      b.classList.toggle("is-on", !!feedShow[b.dataset.k]); b.setAttribute("aria-pressed", String(!!feedShow[b.dataset.k]));
    });
    var day = feed.jobs.filter(function (j) { return Date.now() - j.when <= 864e5 && !markOf(j.id) && j.verdict !== "skip" && feedShow[LOC_GROUP[j.loc || "unknown"]] && feedShow[feedTier(j)]; }).length;
    $("tab-new-n").textContent = day ? day : "";
    var p = feed.profile || {}, mine = ["needsSponsorship", "salaryFloor", "maxYears", "yearsGrace", "requireH1b"].every(function (k) { return (p[k] || 0) == (profile[k] || 0); });
    var old = Date.now() - feed.now > 26 * 36e5;
    $("feed-meta").innerHTML = ago(feed.now) + " · " + (feed.boards.total - feed.boards.failed.length) + " job boards, " + num(feed.boards.rows) + " open roles read. " +
      "Listed with " + (p.needsSponsorship ? "sponsorship needed, " : "") + "base pay from " + k(p.salaryFloor) + ", up to " + p.maxYears + " years" + (p.yearsGrace ? " (" + (p.maxYears + 1) + " = ask)" : "") + "." +
      (mine ? "" : ' <span class="feed-note">Your limits are different; the detail pane judges the posting with yours.</span>') +
      (old ? ' <span class="feed-note">The scan runs three times a day; this one is over a day old, so the schedule may be paused.</span>' : "");

    var rows = feedRows(), prev = lastIds.indexOf(selectedId);
    lastIds = rows.map(function (j) { return j.id; });
    $("feed-list").innerHTML = rows.map(function (j) { return cardHTML(feedModel(j), j.id === selectedId); }).join("");
    $("feed-count").textContent = rows.length + (rows.length === 1 ? " role" : " roles");
    $("feed-copy").hidden = !rows.length;
    $("feed-empty").hidden = rows.length > 0;
    if (!rows.length) {
      var v = feedShow.view;
      $("feed-empty").innerHTML = "<p>" + (v === "applied" ? "Nothing marked Applied yet. Use the check mark on a role once you have applied."
        : v === "no" ? "Nothing marked Not interested yet."
        : feedShow.q ? "No roles match “" + esc(feedShow.q) + "”."
        : n.all ? "Nothing left in this list with the current filters. " + (n.all - n.inbox) + " role" + (n.all - n.inbox === 1 ? " is" : "s are") + " already marked; the rest are hidden by the filters on the left."
        : "No new roles in your directions in this window. Try a longer one.") + "</p>";
    }
    if (!lastIds.length || lastIds.indexOf(selectedId) < 0) {
      selectedId = wide() && lastIds.length ? lastIds[Math.min(Math.max(prev, 0), lastIds.length - 1)] : null;
      if (selectedId) Array.prototype.forEach.call($("feed-list").children, function (li) { if (li.dataset.id === selectedId) li.classList.add("is-sel"); });
      if (!selectedId) { $("ws").classList.remove("detail-open"); $("scrim").hidden = true; }
    }
    showDetail(force === true);
  }
  function loadFeed() {
    fetch(FEED_BASE + "latest.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      if (!j || !Array.isArray(j.jobs)) throw new Error("bad data");
      feed = j; renderFeed();
    }).catch(function () {
      $("feed-meta").textContent = "No scan results yet.";
      $("feed-empty").hidden = false;
      $("feed-empty").innerHTML = "<p>The automatic scan has no results to show yet. It runs three times a day; until the first run finishes, use <b>Scan boards</b> to scan now.</p>";
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
    b.addEventListener("click", function () { feedShow.hours = Number(b.dataset.hours); save("feed", feedShow); renderFeed(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".view-btn"), function (b) {
    b.addEventListener("click", function () { feedShow.view = b.dataset.view; save("feed", feedShow); renderFeed(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".feed-filter"), function (b) {
    b.addEventListener("click", function () { feedShow[b.dataset.k] = !feedShow[b.dataset.k]; save("feed", feedShow); renderFeed(); });
  });
  $("feed-sort").value = feedShow.sort;
  $("feed-sort").addEventListener("change", function () { feedShow.sort = this.value; save("feed", feedShow); renderFeed(); });
  $("feed-q").addEventListener("input", function () { feedShow.q = this.value.trim(); renderFeed(); });
  $("side-toggle").addEventListener("click", function () {
    var open = $("ws").classList.toggle("side-open"); this.setAttribute("aria-expanded", String(open));
  });
  $("feed-list").addEventListener("click", function (e) {
    var btn = e.target.closest(".job-open"); if (btn) selectRole(btn.dataset.id, true);
  });
  function closeDetail() { $("ws").classList.remove("detail-open"); $("scrim").hidden = true; }
  $("scrim").addEventListener("click", closeDetail);
  $("detail").addEventListener("click", function (e) { if (e.target.closest(".dt-back")) closeDetail(); });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || !feed || $("panel-new").hidden || document.querySelector("dialog[open]")) return;
    var t = e.target; if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
    var i = lastIds.indexOf(selectedId), key = e.key;
    if (key === "Escape") { closeDetail(); return; }
    if (key === "j" || key === "k") {
      var id = lastIds[Math.max(0, Math.min(lastIds.length - 1, i + (key === "j" ? 1 : -1)))]; if (!id) return;
      selectRole(id, false); e.preventDefault();
      Array.prototype.forEach.call($("feed-list").children, function (li) { if (li.dataset.id === id) li.scrollIntoView({ block: "nearest" }); });
    } else if ((key === "a" || key === "x") && selectedId && models[selectedId]) {
      setMark(models[selectedId], key === "a" ? "a" : "n"); syncMarks(); renderFeed(); renderScan();
    } else if (key === "o" && selectedId && models[selectedId]) {
      window.open(models[selectedId].url, "_blank", "noopener");
    }
  });
  $("feed-copy").addEventListener("click", function () {
    var rows = feed ? feedRows() : [];
    if (!rows.length) { $("feed-msg").textContent = "Nothing to copy with the current filters."; return; }
    // Same columns as the tracker: Company, Title, Location, Link, Status, Date, Interview Stage, Interviewer, Notes, Week, Salary
    var tsv = rows.map(function (j) {
      var h = j.h1b, noteText = "SponsorScope: " + WORD[j.verdict] + (j.why ? " (" + j.why + ")" : "") +
        (h ? ". H-1B filings last 12 mo: " + h.n + (h.fam ? ", " + h.role + " this role type, " + h.roleNew + " new to the company" : "") + "; green-card cases: " + h.perm : "");
      return [j.company, j.title, (j.locs || []).join("; "), '=HYPERLINK("' + safeUrl(j.url).replace(/"/g, "") + '","link")', markOf(j.id) === "a" ? "Applied" : "", today(), "", "", noteText, "", j.pay ? payText({ lo: j.pay[0], hi: j.pay[1] }) : ""]
        .map(function (c) { return String(c).replace(/[\t\n]/g, " "); }).join("\t");
    }).join("\n");
    copy(tsv, $("feed-copy"), "Copied " + rows.length + " rows");
    $("feed-msg").textContent = "Click the first empty Company cell in your sheet and paste. Links show as “link”.";
  });

  // ---------- start ----------
  renderLimits();
  renderBoards();
  renderDirs();
  LCA.meta().then(function (m) {
    if (!m || !m.periods) return;
    PERIOD = m.period; PERIODS = m.periods;
    $("foot-period").textContent = ", " + m.periods[0].split(" – ")[0] + " to " + m.period.split(" – ")[1];
    if (lastCheck) runCheck(lastCheck.text, lastCheck.meta);
  });
  loadFeed();
  var mode = (/[?&]mode=(scan|check|new)/.exec(location.search) || [])[1];
  var startTab = mode ? "tab-" + mode : load("tab3", "tab-new");
  if ($(startTab) && startTab !== "tab-new") selectTab($(startTab));
})();
