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
    renderFeed();
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
    var where = meta && (meta.locs && meta.locs.length ? meta.locs.join("; ") : meta.location) || "";
    var place = Roles.locClass(where, meta && meta.remote), dir = Roles.classify(title);
    var html = '<div class="verdict v-' + r.verdict + '"><div class="verdict-word">' + WORD[r.verdict] + "</div>" +
      '<p class="verdict-line">' + esc(r.headline) + "</p>" +
      (title ? '<p class="verdict-role">' + esc(title) + (company ? " at " + esc(company) : "") + (meta.url ? ' <a href="' + esc(meta.url) + '" target="_blank" rel="noopener">Open posting</a>' : "") + "</p>" : "") +
      "</div>";
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
  $("check-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = $("jd").value.trim();
    if (!raw) { $("check-msg").textContent = "Paste a posting or a job link first."; $("jd").focus(); return; }
    var link = /^https?:\/\/\S+$/.test(raw) ? SS.parseBoardUrl(raw) : null;
    if (/^https?:\/\/\S+$/.test(raw) && !(link && link.id)) {
      $("check-msg").textContent = "That link isn’t a Greenhouse, Lever or Ashby job page. Open the posting, copy its text, and paste it here.";
      return;
    }
    if (link) {
      $("check-msg").textContent = "Fetching the posting…"; $("check-btn").disabled = true;
      fetchOne(link).then(function (j) { j.h1bQuery = aliasFor(link.slug) || j.company; runCheck(j.text, j); })
        .catch(function (err) { $("check-msg").textContent = "Couldn’t load that posting (" + err.message + "). Copy its text and paste it instead."; })
        .then(function () { $("check-btn").disabled = false; });
      return;
    }
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
  var showing = { apply: true, ask: true, skip: false };
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
  function renderScan() {
    var counts = { apply: 0, ask: 0, skip: 0 }, places = { nyc: 0, remote: 0, other: 0 };
    scanJobs.forEach(function (j) { places[LOC_GROUP[j.loc || "unknown"]]++; if (locVisible(j)) counts[j.r.verdict]++; });
    Object.keys(counts).forEach(function (v) { $("n-" + v).textContent = counts[v]; });
    Object.keys(places).forEach(function (v) { $("n-loc-" + v).textContent = places[v]; });
    $("scan-results").hidden = !scanJobs.length;
    var rows = scanJobs.filter(function (j) { return showing[j.r.verdict] && locVisible(j); })
      .sort(function (a, b) {
        return ORDER[a.r.verdict] - ORDER[b.r.verdict] || (a.dir ? a.dir.tier : 9) - (b.dir ? b.dir.tier : 9) ||
          LOC_RANK[a.loc || "unknown"] - LOC_RANK[b.loc || "unknown"] || roleCount(b.h1b, b.title) - roleCount(a.h1b, a.title) ||
          ((b.h1b && b.h1b.n) || 0) - ((a.h1b && a.h1b.n) || 0) || (b.isNew - a.isNew) || (b.posted - a.posted);
      });
    $("jobs").querySelector("tbody").innerHTML = rows.map(function (j) {
      var reason = Core.reason(j.r);
      var d = j.posted ? new Date(j.posted).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
      return '<tr class="row-' + j.r.verdict + '"><td><span class="tag t-' + j.r.verdict + '">' + WORD[j.r.verdict] + "</span></td>" +
        '<td class="role"><a href="' + esc(j.url) + '" target="_blank" rel="noopener">' + esc(j.title) + "</a>" + (j.isNew ? ' <span class="new">new</span>' : "") +
        '<span class="sub">' + esc(j.company) + (j.locs && j.locs.length ? ", " + esc(j.locs[0]) + (j.locs.length > 1 ? " +" + (j.locs.length - 1) + " more" : "") : "") + (d ? ". Posted " + d : "") + "</span>" +
        (j.dir ? '<span class="dir dir-t' + j.dir.tier + '">' + esc(j.dir.label) + "</span>" : "") + "</td>" +
        "<td>" + (j.r.pay ? payText(j.r.pay) : '<span class="muted">—</span>') + "</td>" +
        "<td>" + (j.r.years ? j.r.years.min + "+" : '<span class="muted">—</span>') + "</td>" +
        "<td>" + (j.h1b ? "<b>" + num(j.h1b.n) + '</b><span class="sub">' + h1bSub(j) + "</span>" : '<span class="muted">—</span>') + "</td>" +
        '<td class="why">' + esc(reason) + ' <button type="button" class="link-btn details" data-id="' + esc(j.id) + '">Details</button></td></tr>';
    }).join("") || '<tr><td colspan="6" class="muted">Nothing in the selected groups. Turn on another filter above.</td></tr>';
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
  $("jobs").addEventListener("click", function (e) {
    var btn = e.target.closest(".details"); if (!btn) return;
    var j = scanJobs.filter(function (x) { return x.id === btn.dataset.id; })[0]; if (!j) return;
    $("dlg-title").textContent = j.title;
    var body = $("dlg-body"); body.innerHTML = '<div class="dlg-verdict"></div><h3>The posting, marked up</h3><div class="posting-text"></div>';
    renderVerdict(j.r, j, body.querySelector(".dlg-verdict"), j.h1b, j.h1b === undefined ? "none" : "done");
    body.querySelector(".posting-text").innerHTML = renderPosting(j.r);
    $("job-dialog").showModal();
  });
  $("dlg-close").addEventListener("click", function () { $("job-dialog").close(); });
  $("job-dialog").addEventListener("click", function (e) { if (e.target === this) this.close(); });

  // ---------- export ----------
  function visibleRows() {
    return scanJobs.filter(function (j) { return showing[j.r.verdict] && locVisible(j); })
      .sort(function (a, b) { return ORDER[a.r.verdict] - ORDER[b.r.verdict] || (a.dir ? a.dir.tier : 9) - (b.dir ? b.dir.tier : 9); });
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
      return [j.company, j.title, (j.locs || [j.location]).join("; "), '=HYPERLINK("' + j.url.replace(/"/g, "") + '","link")', "", today(), "", "", note(j), "", j.r.pay ? payText(j.r.pay) : ""]
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
  var feed = null, feedTexts = null;
  var feedShow = Object.assign({ hours: 24, apply: true, ask: true, skip: false, nyc: true, remote: true, other: false, t1: true, t2: true, t3: false }, load("feed", {}));
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
  function feedVisible(j) { return feedInWindow(j) && feedShow[j.verdict] && feedShow[LOC_GROUP[j.loc || "unknown"]] && feedShow[feedTier(j)]; }
  function feedRows() {
    return feed.jobs.filter(feedVisible).sort(function (a, b) {
      return ORDER[a.verdict] - ORDER[b.verdict] || feedSenior(a) - feedSenior(b) || feedTier(a).localeCompare(feedTier(b)) || LOC_RANK[a.loc || "unknown"] - LOC_RANK[b.loc || "unknown"] || b.when - a.when;
    });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : "#"; }
  function feedH1b(j) {
    var h = j.h1b;
    if (!h) return "";
    if (!h.n && !h.prev) return "No H-1B filings in three years";
    return "<b>" + num(h.n) + "</b> H-1B filings last year" + (h.fam ? ", <b>" + num(h.role) + "</b> for " + esc(h.fam) + " roles" + (h.role ? " (" + num(h.roleNew) + " new to the company)" : "") : "") +
      (h.perm ? " · " + num(h.perm) + " green-card cases" : "");
  }
  function renderFeed() {
    if (!feed) return;
    Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
      var on = Number(b.dataset.hours) === feedShow.hours;
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on));
    });
    var inWin = feed.jobs.filter(feedInWindow), n = {};
    ["apply", "ask", "skip", "nyc", "remote", "other", "t1", "t2", "t3"].forEach(function (k) { n[k] = 0; });
    inWin.forEach(function (j) {
      var place = LOC_GROUP[j.loc || "unknown"], tier = feedTier(j);
      n[place]++; n[tier]++;
      if (feedShow[place] && feedShow[tier]) n[j.verdict]++;
    });
    Object.keys(n).forEach(function (k) { $("fn-" + k).textContent = n[k]; });
    Array.prototype.forEach.call(document.querySelectorAll(".feed-filter"), function (b) {
      b.classList.toggle("is-on", !!feedShow[b.dataset.k]); b.setAttribute("aria-pressed", String(!!feedShow[b.dataset.k]));
    });
    var day = feed.jobs.filter(function (j) { return Date.now() - j.when <= 864e5 && j.verdict !== "skip" && feedShow[LOC_GROUP[j.loc || "unknown"]] && feedShow[feedTier(j)]; }).length;
    $("tab-new-n").textContent = day ? day : "";
    var p = feed.profile || {}, mine = ["needsSponsorship", "salaryFloor", "maxYears", "yearsGrace", "requireH1b"].every(function (k) { return (p[k] || 0) == (profile[k] || 0); });
    var old = Date.now() - feed.now > 26 * 36e5;
    $("feed-meta").innerHTML = "Last scan " + ago(feed.now) + " · " + (feed.boards.total - feed.boards.failed.length) + " company job boards, " + num(feed.boards.rows) + " open roles read · " +
      "judged with " + (p.needsSponsorship ? "sponsorship needed, " : "") + "base pay from " + k(p.salaryFloor) + ", up to " + p.maxYears + " years" + (p.yearsGrace ? " (" + (p.maxYears + 1) + " = ask)" : "") + "." +
      (mine ? "" : ' <span class="feed-note">Your limits above are different. Open Details on a role to see it judged with yours.</span>') +
      (old ? ' <span class="feed-note">The scan runs three times a day; this one is older than a day, so the schedule may be paused.</span>' : "");
    var rows = feedRows();
    $("feed-list").innerHTML = rows.map(function (j) {
      // The location that put the role in your list comes first.
      var locs = (j.locs || []).slice().sort(function (a, b) { return LOC_RANK[Roles.locClass(a)] - LOC_RANK[Roles.locClass(b)]; });
      var dir = Roles.byId[j.dir], where = locs.slice(0, 2).join("; ") + (locs.length > 2 ? " +" + (locs.length - 2) + " more" : "");
      var facts = [j.pay ? payText({ lo: j.pay[0], hi: j.pay[1] }) + " base" : "Pay not listed",
        j.years ? j.years[0] + (j.years[1] ? "–" + j.years[1] : "+") + " yrs" : "Years not listed", j.mode, j.degree].filter(Boolean);
      var flag = feedSenior(j) ? '<span class="fj-flag">Senior title, years not stated</span>' : "";
      return '<li class="fj fj-' + j.verdict + '"><div class="fj-side"><span class="tag t-' + j.verdict + '">' + WORD[j.verdict] + '</span><span class="fj-when">' + feedWhen(j) + "</span></div>" +
        '<div class="fj-main"><h3 class="fj-title"><a href="' + esc(safeUrl(j.url)) + '" target="_blank" rel="noopener">' + esc(j.title) + "</a></h3>" +
        '<p class="fj-co"><b>' + esc(j.company) + "</b>" + (where ? " · " + esc(where) : "") + "</p>" +
        '<p class="fj-facts">' + facts.map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("") + flag + "</p>" +
        (j.skills && j.skills.length ? '<p class="fj-skills">' + j.skills.map(esc).join(" · ") + "</p>" : "") +
        '<p class="fj-why">' + esc(j.why || "") + (j.why && j.h1b ? ". " : "") + '<span class="muted">' + feedH1b(j) + "</span></p></div>" +
        '<div class="fj-end">' + (dir ? '<span class="dir dir-t' + dir.tier + '">' + esc(dir.label) + "</span>" : "") +
        '<button type="button" class="link-btn feed-details" data-id="' + esc(j.id) + '">Details</button></div></li>';
    }).join("");
    $("feed-body").hidden = false; $("feed-copy").hidden = false;
    $("feed-empty").hidden = rows.length > 0;
    if (!rows.length) $("feed-empty").innerHTML = "<p>" + (inWin.length ? "Nothing in the selected groups. " + inWin.length + " new role" + (inWin.length > 1 ? "s" : "") + " in this window are hidden by the filters above."
      : "No new roles in your directions in this window. Try a longer one.") + "</p>";
  }
  function loadFeed() {
    fetch(FEED_BASE + "latest.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      if (!j || !Array.isArray(j.jobs)) throw new Error("bad data");
      feed = j; renderFeed();
    }).catch(function () {
      $("feed-meta").textContent = "";
      $("feed-empty").hidden = false;
      $("feed-empty").innerHTML = "<p>The automatic scan has no results to show yet. It runs three times a day; until the first run finishes, use <b>Scan job boards</b> to scan now.</p>";
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), function (b) {
    b.addEventListener("click", function () { feedShow.hours = Number(b.dataset.hours); save("feed", feedShow); renderFeed(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".feed-filter"), function (b) {
    b.addEventListener("click", function () { feedShow[b.dataset.k] = !feedShow[b.dataset.k]; save("feed", feedShow); renderFeed(); });
  });
  $("feed-list").addEventListener("click", function (e) {
    var btn = e.target.closest(".feed-details"); if (!btn || !feed) return;
    var j = feed.jobs.filter(function (x) { return x.id === btn.dataset.id; })[0]; if (!j) return;
    $("dlg-title").textContent = j.title;
    var body = $("dlg-body"); body.innerHTML = '<p class="muted">Loading the posting…</p>';
    $("job-dialog").showModal();
    feedTexts = feedTexts || fetch(FEED_BASE + "texts.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    Promise.all([feedTexts, LCA.lookup(j.query || j.company)]).then(function (got) {
      var text = got[0][j.id], rec = got[1];
      if (!text) throw new Error("no text");
      var r = withH1b(SS.analyze(text, profile), rec, j.title);
      body.innerHTML = '<div class="dlg-verdict"></div><h3>The posting, marked up</h3><div class="posting-text"></div>';
      renderVerdict(r, { title: j.title, company: j.company, url: safeUrl(j.url), locs: j.locs, remote: j.remote }, body.querySelector(".dlg-verdict"), rec, "done");
      body.querySelector(".posting-text").innerHTML = renderPosting(r);
    }).catch(function () {
      feedTexts = null;
      body.innerHTML = '<p>Couldn’t load the saved posting text. <a href="' + esc(safeUrl(j.url)) + '" target="_blank" rel="noopener">Open the posting</a> and paste it under “Check one posting”.</p>';
    });
  });
  $("feed-copy").addEventListener("click", function () {
    var rows = feed ? feedRows() : [];
    if (!rows.length) { $("feed-msg").textContent = "Nothing to copy with the current filters."; return; }
    // Same columns as the tracker: Company, Title, Location, Link, Status, Date, Interview Stage, Interviewer, Notes, Week, Salary
    var tsv = rows.map(function (j) {
      var h = j.h1b, noteText = "SponsorScope: " + WORD[j.verdict] + (j.why ? " (" + j.why + ")" : "") +
        (h ? ". H-1B filings last 12 mo: " + h.n + (h.fam ? ", " + h.role + " this role type, " + h.roleNew + " new to the company" : "") + "; green-card cases: " + h.perm : "");
      return [j.company, j.title, (j.locs || []).join("; "), '=HYPERLINK("' + safeUrl(j.url).replace(/"/g, "") + '","link")', "", today(), "", "", noteText, "", j.pay ? payText({ lo: j.pay[0], hi: j.pay[1] }) : ""]
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
