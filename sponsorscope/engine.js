/*
 * SponsorScope engine
 * Turns a job posting's plain text into hard-constraint verdicts with
 * sentence-level evidence. Rule-based on purpose: every verdict can be
 * traced to the exact words that triggered it, and it runs in the browser
 * with no API key and no server.
 *
 * Verdicts:  "skip"  – a hard blocker was found (no sponsorship, citizens only, clearance…)
 *            "ask"   – something needs a human check before investing time
 *            "apply" – nothing in the posting rules you out
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SponsorScope = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var DEFAULT_PROFILE = {
    needsSponsorship: true,   // OPT now, H-1B later
    maxYears: 3,              // posting's minimum years must be <= this
    yearsHard: true,          // over the cap = skip (false = ask)
    yearsGrace: 0,            // this many years over the cap is "ask" instead of the yearsHard outcome
    salaryFloor: 85000,       // base pay floor in USD / year (0 = off)
    salaryHard: true,         // whole range below floor = skip (false = ask)
    requireH1b: true          // company must have certified H-1B filings in the last 12 months
  };

  // ---------- text helpers ----------
  function htmlToText(html) {
    if (!html) return "";
    var s = String(html);
    // Greenhouse returns HTML-escaped HTML; unescape twice is safe for plain text.
    for (var k = 0; k < 2; k++) {
      s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
           .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&");
    }
    s = s.replace(/<\s*(br|\/p|\/li|\/h\d|\/div|\/tr)\s*\/?>/gi, "\n")
         .replace(/<\s*li[^>]*>/gi, "\n• ")
         .replace(/<[^>]+>/g, " ")
         .replace(/ /g, " ")
         .replace(/[ \t]+/g, " ")
         .replace(/\s*\n\s*/g, "\n")
         .replace(/\n{3,}/g, "\n\n");
    return s.trim();
  }

  // Split into sentences but keep character offsets so the UI can highlight in place.
  function sentences(text) {
    var out = [];
    var re = /[^\n.!?;]+(?:[.!?;]+|(?=\n)|$)/g, m;
    // Rejoin decimals / abbreviations by working on a protected copy.
    var prot = text.replace(/(\d)\.(\d)/g, "$1․$2")
                   .replace(/\b(U)\.(S)\./g, "$1․$2․")
                   .replace(/\b(e\.g|i\.e|etc|Inc|Jr|Sr|vs|No)\./gi, function (x) { return x.replace(".", "․"); });
    while ((m = re.exec(prot))) {
      var raw = m[0];
      if (!raw.trim()) { if (re.lastIndex === m.index) re.lastIndex++; continue; }
      var lead = raw.length - raw.replace(/^\s+/, "").length;
      var start = m.index + lead;
      var end = m.index + raw.replace(/\s+$/, "").length;
      if (end > start) out.push({ start: start, end: end, text: text.slice(start, end) });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  var EEO = /regardless of|without regard to|discriminat|protected (class|characteristic|status)|equal (employment )?opportunity|eeo\b|e-?verify and department of justice/i;

  // ---------- authorization / sponsorship rules ----------
  var NEG = "(?:not|unable|cannot|can't|can not|won't|will not|do not|don't|does not|doesn't|is not|are not|no|never|without)";
  var RULES = [
    {
      code: "no_sponsorship", level: "skip",
      title: "No visa sponsorship",
      test: function (s) {
        if (!/sponsor|h-?1b|visa/i.test(s)) return false;
        if (/export licen[cs]e|plan sponsor|event|conference|executive sponsor|mobility cost|premium.processing|casework|petition/i.test(s) && !/(not|unable|no) [^.]{0,30}(visa|immigration|h-?1b)/i.test(s)) return false;
        if (/\bno (visa|immigration|work visa)( ?\/ ?relocation)? (sponsorship|support)/i.test(s)) return true;
        if (/(not able|unable|cannot|can't|can not) to consider (any )?(candidates|applicants|individuals|those) (who|that)[^.]{0,60}(require|need)/i.test(s)) return true;
        if (/(sponsorship|sponsor)[^.]{0,40}\b(is |are |will )?(not|n't) (be )?(available|offered|provided|possible|supported|considered|eligible)/i.test(s)) return true;
        if (/not (be )?eligible for[^.]{0,20}(visa|immigration|h-?1b|employment|work)?[^.]{0,10}sponsorship/i.test(s)) return true;
        if (new RegExp("\\b" + NEG + "\\b[^.]{0,220}\\b(sponsor|sponsorship|h-?1b)", "i").test(s) &&
            !/\b(will|can|able to|happy to|open to|do|does) (provide|offer|consider|support) (visa |immigration |h-?1b )?sponsorship/i.test(s.replace(/\b(un|not |n't |cannot |can't )able to/gi, "X")) &&
            !/whether or not|with or without/i.test(s)) return true;
        if (/without (the need for |requiring |the need of )?(current or future |present or future |now or in the future |any )?(visa |employer |employment |immigration |h-?1b |work )?(visa )?sponsorship/i.test(s)) return true;
        return false;
      }
    },
    {
      code: "citizens_only", level: "skip",
      title: "Citizens / green-card holders only",
      test: function (s) {
        if (EEO.test(s)) return false;
        if (/navigate|familiar|knowledge of|understanding of|experience (with|in)/i.test(s)) return false;
        return /(must|required to|need to|should) (be|hold) (a )?(u\.?s\.? |us |united states )citizen/i.test(s) ||
               /(u\.?s\.?|us|united states) citizen(s|ship)?[^.]{0,30}(only|required|is required|is a requirement|mandatory)/i.test(s) ||
               /(only|exclusively) (open to |available to |for )?(u\.?s\.?|us|united states) citizens/i.test(s) ||
               /(green card|permanent resident)[^.]{0,30}(only|required|is required)/i.test(s) ||
               /restricted to (u\.?s\.?|us|united states)? ?citizens/i.test(s) ||
               /^\s*(u\.?s\.? )?citizenship (is )?(required|mandatory)/i.test(s) || /\b(u\.?s\.?|us|united states) citizenship (is )?(required|mandatory)/i.test(s) ||
               /(u\.?s\.?|us) persons?\b[^.]{0,40}(as defined|only|required|itar|export)/i.test(s) ||
               /(export control|export-controlled|export regulations)[^.]{0,80}(u\.?s\.? person|citizen)/i.test(s) ||
               /(applicant|candidate)s? must be (a )?(\(i\) )?(u\.?s\.?|us) citizen/i.test(s) ||
               /^\W*(u\.?s\.? )?citizenship\W*$/i.test(s) ||
               /\b(u\.?s\.?|us) citizen(ship)?,? (or|and\/or) (green card|permanent resid|lawful permanent)/i.test(s) ||
               /(require[sd]?|requiring) (you |candidates |applicants |the employee )?to be (a )?(u\.?s\.?|us) citizen/i.test(s) ||
               /(u\.?s\.?|us) citizenship[^.]{0,80}(status )?required/i.test(s) ||
               /must be (a )?(u\.?s\.?|us) person/i.test(s) ||
               /permanent (work )?authori[sz]ation/i.test(s);
      }
    },
    {
      code: "clearance", level: "skip",
      title: "Security clearance required",
      test: function (s) {
        if (!/clearance/i.test(s)) return false;
        // Drop parentheticals and trailing "…but TS preferred" clauses, then any remaining preference word means "nice to have".
        var core = s.replace(/\([^)]*\)/g, "")
                    .replace(/[:;,]\s*(with )?(ts\/sci|top secret|sci)[^.;,]*preferred/gi, "")
                    .replace(/\bbut\b[^.]*(preferred|desired)/gi, "");
        if (/(prefer|desired|a plus|nice.to.have|bonus|beneficial|not necessary|not required|advantage|encouraged|other positions|can take|differential|may provide)/i.test(core)) return false;
        if (/(must (hold|have|possess)|active|current) (an? )?(u\.?s\.? )?(dod )?(ts\/?sci|top secret|secret|security)[^.]{0,15}clearance/i.test(core)) return true;
        if (/navigate|navigating|familiar|knowledge of|understanding of|speak|support (public sector )?customers|clearance-related|requirements for|manage|maintain data|process for|documents|trademark|music|talent|ground clearance/i.test(s)) return false;
        return /(security|secret|top secret|ts\/?sci|\bts\b|\bsci\b|dod|poly(graph)?|government|public trust)[^.]{0,25}clearance/i.test(s) ||
               /clearance[^.]{0,25}(secret|ts\/?sci|top secret|poly)/i.test(s) ||
               /^\W*(an )?active clearance/i.test(s) ||
               /(obtain|hold|secure|maintain|eligib\w*)[^.]{0,30}\bclearance/i.test(s) && !/customs|trade|flight|airworth/i.test(s);
      }
    },
    {
      code: "authorized_no_sponsor", level: "skip",
      title: "Must be authorized to work without sponsorship",
      test: function (s) {
        return /authori[sz]ed to work[^.]{0,80}(without|not require|no need for)[^.]{0,40}(sponsor|visa)/i.test(s) ||
               /(now (and|or) in the future|currently or in the future|now or at any time in the future)[^.]{0,60}(without|not (require|need))[^.]{0,30}sponsor/i.test(s) ||
               /authori[sz]ed to work in (the )?(u\.?s\.?|us|united states|usa)[^.]{0,20}now and in the future/i.test(s);
      }
    },
    {
      code: "authorization_unclear", level: "ask",
      title: "Asks for work authorization, silent on sponsorship",
      test: function (s) {
        return (/(authori[sz]ed|eligible|legal right|legally able|right) to (work|be employed) (lawfully )?in (the )?(u\.?s|us|united states)/i.test(s) ||
                /contingent (up)?on (obtaining )?(valid )?(u\.?s\.? )?work authori[sz]ation/i.test(s)) && !/sponsor/i.test(s);
      }
    },
    {
      code: "perm_posting", level: "ask",
      title: "Looks like a green-card (PERM) market-test posting",
      test: function (s) {
        return /experience in (the )?(job|position) offered/i.test(s) ||
               /minimum requirements for (the )?position/i.test(s) ||
               /or related occupation/i.test(s) || /in the alternative, the employer will accept/i.test(s) ||
               (/foreign (degree |educational )?equivalent/i.test(s) && /\b(experience|occupation)\b/i.test(s) && /\d|one|two|three|four|five/i.test(s));
      }
    },
    {
      code: "sponsorship_offered", level: "good",
      title: "Sponsorship mentioned as available",
      test: function (s) {
        if (RULES[0].test(s)) return false;
        if (/sponsorship:\s*(yes|available)/i.test(s)) return true;
        if (/\b(opt|cpt|stem opt)\b(?! ?-?(out|in)\b)[^.]{0,40}(welcome|eligible|accepted|encouraged|considered|candidates)/i.test(s)) return true;
        if (/including (f-?1 students|students (on|using)|candidates (on|using))[^.]{0,20}(opt|cpt|stem)/i.test(s)) return true;
        if (!/visa|immigration|h-?1b|work permit|work authori[sz]ation|green card/i.test(s)) return false;
        return /\b(will|can|able to|happy to|open to|we|may|does|do) (also )?(provide|offer|consider|support|sponsor)\b/i.test(s) ||
               /(visa|h-?1b|immigration) sponsorship[^.]{0,25}(is |are )?(available|offered|provided|supported)/i.test(s) ||
               /we sponsor (visas|h-?1b)/i.test(s) ||
               /(supports?|provides?) (work authori[sz]ation|visa|immigration)( sponsorship)?( and relocation)? for (this|the) (role|position)/i.test(s) ||
               /including (f-?1 students|students (on|using)|candidates (on|using))[^.]{0,20}(opt|cpt|stem)/i.test(s) ||
               /(company|employer) visa sponsorship/i.test(s) ||
               /every reasonable effort to get you a visa/i.test(s);
      }
    },
    {
      code: "everify", level: "info",
      title: "E-Verify employer (needed for STEM OPT)",
      test: function (s) { return /e-?verify/i.test(s) && !/department of justice/i.test(s) || /participates? in e-?verify/i.test(s); }
    }
  ];

  // ---------- years of experience ----------
  var NUMWORD = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  function parseYears(sents) {
    var hits = [];
    sents.forEach(function (st) {
      var s = st.text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*\((\d+)\)/gi, "$2")
                     .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b(?=\+?\s*(?:or more\s*)?(?:years?|yrs?))/gi, function (w) { return NUMWORD[w.toLowerCase()]; });
      if (!/experience|background|track record|tenure/i.test(s)) return;
      if (/(for (nearly|over|more than|almost) \d+ years|every \d+ years|after \d+ years|years? old|\d+ years? (of )?(history|in business))/i.test(s)) return;
      var re = /(\d{1,2})\s*(?:\+|plus)?\s*(?:(?:-|–|—|to)\s*(\d{1,2})\s*\+?)?\s*(?:or more\s*)?(?:years?|yrs?)/gi, m;
      while ((m = re.exec(s))) {
        var a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : null;
        if (a > 25) continue;
        // "PhD: 1-4 years or Master's: 3-5 years" → keep both, the UI shows the sentence
        hits.push({ min: a, max: b, sentence: st });
      }
    });
    if (!hits.length) return null;
    // Binding requirement = the highest minimum among requirement lines that is not a "preferred" line.
    var req = hits.filter(function (h) { return !/(preferred|nice to have|a plus|bonus|ideally)/i.test(h.sentence.text); });
    var pool = req.length ? req : hits;
    var top = pool.reduce(function (a, b) { return b.min > a.min ? b : a; });
    var low = pool.reduce(function (a, b) { return b.min < a.min ? b : a; });
    return { min: top.min, max: top.max, lowest: low.min, sentence: top.sentence, all: hits };
  }

  // ---------- salary ----------
  function money(str, unit) {
    var v = parseFloat(str.replace(/,/g, ""));
    if (/k/i.test(unit || "")) v *= 1000;
    return v;
  }
  function parseSalary(sents) {
    var ranges = [];
    var KEY = /salary|pay|compensation|wage|base|usd|per year|\/yr|annual|ote|earnings|hourly|per hour|range/i;
    sents.forEach(function (st, i) {
      var s = st.text;
      var prev = (sents[i - 1] || {}).text || "", prev2 = (sents[i - 2] || {}).text || "";
      if (!KEY.test(s) && !(/\$\s?\d/.test(s) && (/compensation|salary|pay range|base pay/i.test(prev) || /compensation|salary|pay range|base pay/i.test(prev2)))) return;
      if (/(fertility|stipend|reimburse|hra|401|bonus of|signing|raised|valuation|funding|revenue|run rate|spend|assets|customers)/i.test(s) && !/(base|salary|pay range)/i.test(s)) return;
      var re = /\$\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(k|K)?\b(?:\s*(?:USD|usd))?\s*(?:(?:-|–|—|to)\s*\$?\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(k|K)?)?\s*(\/\s?(?:hr|hour|yr|year)|per (?:hour|year)|an hour|hourly)?/g, m;
      while ((m = re.exec(s))) {
        var lo = money(m[1], m[2]), hi = m[3] ? money(m[3], m[4] || m[2]) : lo;
        var after = s.slice(m.index + m[0].length, m.index + m[0].length + 14);
        if (/^\s*(b|bn|m|mm|million|billion)\b/i.test(after)) continue;
        var hourly = /hr|hour/i.test(m[5] || "") || (hi < 300 && /hour/i.test(s));
        if (hourly) { lo *= 2080; hi *= 2080; }
        if (lo < 20000 || hi > 2000000) continue;
        if (hi < lo) { var t = lo; lo = hi; hi = t; }
        ranges.push({ lo: lo, hi: hi, hourly: hourly, sentence: st });
      }
    });
    if (!ranges.length) return null;
    var lo = Math.min.apply(null, ranges.map(function (r) { return r.lo; }));
    var hi = Math.max.apply(null, ranges.map(function (r) { return r.hi; }));
    var best = ranges.reduce(function (a, b) { return b.hi > a.hi ? b : a; });
    return { lo: lo, hi: hi, sentence: best.sentence, all: ranges };
  }

  function fmtMoney(v) { return "$" + Math.round(v / 1000) + "k"; }

  // ---------- main ----------
  function analyze(input, profile) {
    var p = Object.assign({}, DEFAULT_PROFILE, profile || {});
    var text = /<[a-z][\s\S]*>|&lt;/i.test(input || "") ? htmlToText(input) : String(input || "").replace(/\r/g, "");
    var sents = sentences(text);
    var findings = [];

    RULES.forEach(function (rule) {
      var ev = sents.filter(function (st) { return rule.test(st.text); });
      if (ev.length) findings.push({ code: rule.code, level: rule.level, title: rule.title, evidence: ev });
    });

    var has = function (c) { return findings.some(function (f) { return f.code === c; }); };
    // A specific "without sponsorship" sentence supersedes the softer "authorized to work" one.
    if (has("no_sponsorship") || has("authorized_no_sponsor")) {
      findings = findings.filter(function (f) { return f.code !== "authorization_unclear" && f.code !== "sponsorship_offered"; });
      if (has("no_sponsorship") && has("authorized_no_sponsor")) {
        var a = findings.filter(function (f) { return f.code === "authorized_no_sponsor"; })[0];
        var n = findings.filter(function (f) { return f.code === "no_sponsorship"; })[0];
        a.evidence.forEach(function (e) { if (n.evidence.indexOf(e) < 0) n.evidence.push(e); });
        findings = findings.filter(function (f) { return f.code !== "authorized_no_sponsor"; });
      }
    }
    if (!p.needsSponsorship) {
      findings.forEach(function (f) {
        if (f.code === "no_sponsorship" || f.code === "authorized_no_sponsor" || f.code === "authorization_unclear") f.level = "info";
      });
    }

    var years = parseYears(sents);
    if (years) {
      var over = years.min > p.maxYears;
      var near = over && years.min <= p.maxYears + (p.yearsGrace || 0);
      findings.push({
        code: over ? "years_over" : "years_ok",
        level: over ? (p.yearsHard && !near ? "skip" : "ask") : "good",
        title: over ? ("Asks for " + years.min + "+ years (your cap: " + p.maxYears + ")")
                    : ("Experience: " + years.min + (years.max ? "–" + years.max : "+") + " years"),
        evidence: [years.sentence]
      });
    }

    var pay = parseSalary(sents);
    if (pay) {
      var below = p.salaryFloor > 0 && pay.hi < p.salaryFloor;
      var spans = p.salaryFloor > 0 && !below && pay.lo < p.salaryFloor;
      findings.push({
        code: below ? "pay_below" : "pay_ok",
        level: below ? (p.salaryHard ? "skip" : "ask") : "good",
        title: (below ? "Pay tops out under your floor: " : "Base pay: ") + fmtMoney(pay.lo) + (pay.hi !== pay.lo ? "–" + fmtMoney(pay.hi) : "") +
               (spans ? " (low end under your floor)" : ""),
        evidence: [pay.sentence]
      });
    }

    var levels = findings.map(function (f) { return f.level; });
    var verdict = levels.indexOf("skip") >= 0 ? "skip" : levels.indexOf("ask") >= 0 ? "ask" : "apply";

    var sponsorship = has("no_sponsorship") || has("authorized_no_sponsor") ? "denied"
                    : has("citizens_only") || has("clearance") ? "restricted"
                    : has("sponsorship_offered") ? "offered"
                    : has("authorization_unclear") ? "unclear" : "silent";

    var order = { skip: 0, ask: 1, good: 2, info: 3 };
    var rank = ["no_sponsorship", "authorized_no_sponsor", "citizens_only", "clearance", "authorization_unclear", "perm_posting",
                "sponsorship_offered", "years_over", "pay_below", "years_ok", "pay_ok", "everify"];
    findings.sort(function (a, b) { return order[a.level] - order[b.level] || rank.indexOf(a.code) - rank.indexOf(b.code); });

    return {
      verdict: verdict,
      sponsorship: sponsorship,
      years: years ? { min: years.min, max: years.max } : null,
      pay: pay ? { lo: pay.lo, hi: pay.hi } : null,
      findings: findings,
      text: text,
      headline: headline(verdict, findings, sponsorship)
    };
  }

  function headline(verdict, findings, sponsorship) {
    var top = findings.filter(function (f) { return f.level === verdict || (verdict === "apply" && f.level === "good"); })[0];
    if (verdict === "skip") return top.title + ".";
    if (verdict === "ask") return top.title + " — confirm before you spend time on interviews.";
    if (sponsorship === "offered") return "Sponsorship is mentioned as available, and nothing else rules you out.";
    return "Nothing in this posting rules you out. It is silent on sponsorship, so check the company's H-1B history.";
  }

  // ---------- job-board APIs (all CORS-enabled, no key) ----------
  function parseBoardUrl(url) {
    var m;
    url = String(url || "").trim();
    if ((m = url.match(/greenhouse\.io\/(?:embed\/job_board\?for=)?([\w-]+)(?:\/jobs\/(\d+))?/i))) return { ats: "greenhouse", slug: m[1], id: m[2] || null };
    if ((m = url.match(/[?&]gh_jid=(\d+)/i))) return { ats: "greenhouse", slug: null, id: m[1] };
    if ((m = url.match(/jobs\.lever\.co\/([\w-]+)(?:\/([\w-]{36}))?/i))) return { ats: "lever", slug: m[1], id: m[2] || null };
    if ((m = url.match(/jobs\.ashbyhq\.com\/([\w.%-]+)(?:\/([\w-]{36}))?/i))) return { ats: "ashby", slug: decodeURIComponent(m[1]), id: m[2] || null };
    return null;
  }

  return {
    DEFAULT_PROFILE: DEFAULT_PROFILE,
    analyze: analyze,
    headline: headline,
    htmlToText: htmlToText,
    sentences: sentences,
    parseYears: parseYears,
    parseSalary: parseSalary,
    parseBoardUrl: parseBoardUrl,
    fmtMoney: fmtMoney
  };
});
