/*
 * Sponsorship history lookup. Reads the per-employer summaries built by
 * data/build_lca.py from the Department of Labor's H-1B (LCA) and
 * green-card (PERM) disclosure data.
 * norm(), FAMILIES and familyOf() must stay identical to the Python versions.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LCA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SUFFIX = { INC: 1, INCORPORATED: 1, LLC: 1, LLP: 1, LP: 1, LTD: 1, LIMITED: 1, CORP: 1, CORPORATION: 1, CO: 1,
    COMPANY: 1, PLC: 1, NA: 1, PC: 1, PLLC: 1, USA: 1, US: 1, HOLDINGS: 1, HOLDING: 1, GROUP: 1, THE: 1 };

  function norm(name) {
    var s = String(name || "").toUpperCase().replace(/&/g, " AND ");
    s = s.replace(/\bL\s*L\s*C\b/g, "LLC").replace(/\bL\s*\.?\s*P\b\.?/g, "LP").replace(/\bN\s*\.?\s*A\b\.?/g, "NA");
    var t = s.replace(/[^A-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
    while (t.length && t[0] === "THE") t.shift();
    while (t.length > 1 && SUFFIX[t[t.length - 1]]) t.pop();
    if (t.length > 1 && t[t.length - 1] === "AND") t.pop();
    return t.join(" ");
  }

  // Role families, checked in order.
  var FAMILIES = [
    ["solutions", /solutions? (consultant|engineer|analyst|architect|specialist|strategist)|sales engineer|pre.?sales|implementation (consultant|specialist|manager|analyst|engineer|lead)|customer success|value (consultant|engineer|advisor)|forward deployed|deployment strategist|technical account manager/i],
    ["gtm", /revenue operations|sales operations|go.to.market|\bgtm\b|revops|sales strategy|deal desk|commercial operations|partnerships?|partner (operations|manager|program)|business development/i],
    ["eng", /software|security analyst|systems analyst|it analyst|developer|programmer|architect|devops|engineer/i],
    ["risk", /risk|compliance|fraud|\baml\b|\bkyc\b|audit|regulatory|trust (and|&) safety/i],
    ["ds", /data scien|machine learning|statistician|quantitative|\bquant\b|decision scien/i],
    ["product", /product manager|product management|product operations|product strategy|product owner|product lead/i],
    ["strategy", /strateg|strat ?ops|business operations|biz ?ops|operations analyst|operations associate|operations manager|consultant|management analyst|chief of staff|special projects/i],
    ["analyst", /data analyst|business analyst|analytics|insight|business intelligence|\bbi\b|reporting analyst|research analyst|market research|product analyst|marketing analyst|pricing analyst|analyst/i],
    ["marketing", /marketing|growth|brand manager|lifecycle/i],
    ["finance", /financ|fp&a|accountant|accounting|investment|treasury|valuation/i]
  ];
  var LABEL = { analyst: "data & business analyst", strategy: "strategy & operations", risk: "risk & compliance",
    gtm: "GTM, revenue ops & partnerships", ds: "data science & quant", finance: "finance", eng: "engineering",
    product: "product", solutions: "solutions & customer success", marketing: "marketing & growth", other: "other" };

  function familyOf(title) {
    for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i][1].test(title || "")) return FAMILIES[i][0];
    return "other";
  }

  var base = "data/lca/";
  var cache = {};
  function getJSON(file, fallback) {
    return fetch(base + file).then(function (r) { return r.ok ? r.json() : fallback; }).catch(function () { return fallback; });
  }
  function shard(key) {
    var id = key.slice(0, 2).replace(/ /g, "_").toLowerCase();
    if (!cache[id]) cache[id] = getJSON(id + ".json", {});
    return cache[id];
  }
  var metaP = null;
  function meta() { return metaP || (metaP = getJSON("meta.json", null)); }

  var FIELDS = 8;   // per family: [last 12 mo, new hires, transfers in, entry level, NYC metro, median wage, prior 12 mo, 12 mo before]

  // queries: brand name, or a list of legal-name queries. "=KEY" matches that normalized name only;
  // anything else also matches longer names that start with it ("Capital One" → "CAPITAL ONE SERVICES").
  function lookup(queries) {
    var qs = (Array.isArray(queries) ? queries : [queries]).filter(Boolean).map(function (q) {
      var exact = /^=/.test(q);
      return { exact: exact, key: exact ? q.slice(1).trim() : norm(q) };
    }).filter(function (q) { return q.key.length >= 2; });
    if (!qs.length) return Promise.resolve(null);
    return Promise.all(qs.map(function (q) { return shard(q.key); })).then(function (shards) {
      var agg = { n: 0, y: [0, 0, 0], f: {}, k: [0, 0, 0], m: 0, pm: [0, 0, 0], pf: {}, names: [], matched: [] };
      var seen = {}, titles = {}, wageSum = {}, wageN = {};
      qs.forEach(function (q, i) {
        var d = shards[i];
        Object.keys(d).forEach(function (key) {
          if (seen[key]) return;
          if (!(key === q.key || (!q.exact && key.indexOf(q.key + " ") === 0))) return;
          seen[key] = 1;
          var e = d[key], j;
          for (j = 0; j < 3; j++) { agg.y[j] += e.y[j]; agg.k[j] += e.k[j]; agg.pm[j] += (e.pm || [0, 0, 0])[j]; }
          agg.m += e.m;
          agg.matched.push({ key: key, n: e.y[2], all: e.y[0] + e.y[1] + e.y[2], names: e.names });
          Object.keys(e.f).forEach(function (fam) {
            var src = e.f[fam], dst = agg.f[fam] || (agg.f[fam] = [0, 0, 0, 0, 0, 0, 0, 0]);
            for (j = 0; j < FIELDS; j++) if (j !== 5) dst[j] += src[j];
            if (src[5] && src[0]) { wageSum[fam] = (wageSum[fam] || 0) + src[5] * src[0]; wageN[fam] = (wageN[fam] || 0) + src[0]; }
          });
          Object.keys(e.pf || {}).forEach(function (fam) { agg.pf[fam] = (agg.pf[fam] || 0) + e.pf[fam]; });
          e.t.forEach(function (t) {
            var id = t[3] + "|" + t[0].toLowerCase();
            var x = titles[id] || (titles[id] = { title: t[0], n: 0, wage: 0, fam: t[3], ws: 0, wn: 0 });
            x.n += t[1]; if (t[2]) { x.ws += t[2] * t[1]; x.wn += t[1]; x.wage = Math.round(x.ws / x.wn); }
          });
        });
      });
      Object.keys(wageSum).forEach(function (fam) { agg.f[fam][5] = Math.round(wageSum[fam] / wageN[fam]); });
      agg.n = agg.y[2];
      agg.matched.sort(function (a, b) { return b.all - a.all; });
      agg.names = agg.matched.slice(0, 3).map(function (m) { return m.names[0]; });
      agg.titles = Object.keys(titles).map(function (id) { return titles[id]; }).sort(function (a, b) { return b.n - a.n; });
      return agg;
    });
  }

  // Everything the page shows about one role family at one employer.
  function role(rec, title) {
    var fam = familyOf(title || ""), v = (rec && rec.f[fam]) || [0, 0, 0, 0, 0, 0, 0, 0];
    return { fam: fam, label: LABEL[fam], n: v[0], fresh: v[1], transfer: v[2], entry: v[3], metro: v[4], wage: v[5], prev: v[6], prev2: v[7],
      perm: (rec && rec.pf[fam]) || 0,
      titles: rec ? rec.titles.filter(function (t) { return t.fam === fam; }) : [] };
  }

  return { norm: norm, familyOf: familyOf, LABEL: LABEL, lookup: lookup, role: role, meta: meta,
    setBase: function (b) { base = b; cache = {}; metaP = null; } };
});
