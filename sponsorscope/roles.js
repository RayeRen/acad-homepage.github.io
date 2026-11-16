/*
 * Role directions and locations: what kind of job a title is, and where it is.
 * Titles are only a starting point, so the patterns are checked from the most
 * specific direction to the most generic one; the tier says how high a match
 * ranks in a scan (1 = look at these first).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Roles = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // [id, tier, label, title pattern]. Order = match order, specific first.
  var DIRECTIONS = [
    ["risk", 2, "Risk, fraud & compliance", /risk (strategy|analy|operations|manager|associate)|fraud|trust (&|and) safety|compliance (analy|automation|strategy|operations|associate)|payments risk|credit risk|\baml\b|financial crimes|ai governance/i],
    ["pricing", 1, "Pricing & monetization", /pricing|monetization|commercial strategy|revenue growth|revenue strategy|deal strategy/i],
    ["finance", 2, "Strategic finance & FP&A", /strategic finance|fp&a|financial planning|finance (&|and) strategy|commercial finance|revenue finance|finance analyst|financial analyst/i],
    ["gtm", 1, "GTM & revenue operations", /\bgtm\b|go.to.market|revenue operations|rev ?ops|sales (strategy|operations|ops)\b|revenue intelligence|commercial excellence|commercial operations|deal desk/i],
    ["ai", 1, "AI deployment & automation", /\bai (solutions?|implementation|deployment|operations|enablement|strategist|evaluation|adoption|business|program)|applied ai|deployment strategist|forward deployed|automation (specialist|analyst|strategist|lead|manager)|\bllm\b/i],
    ["pmm", 2, "Product marketing & commercialization", /product marketing|commercialization|marketing strategy/i],
    ["product", 1, "Product operations & strategy", /product operations|product ops|product strategy|associate product manager|\bapm\b|product manager|product (&|and) strategy/i],
    ["customer", 1, "Customer strategy & commercial ops", /customer (strategy|operations|success (operations|strategy|ops)|experience strategy|insights)|\bcs (strategy|operations|ops)\b|retention|lifecycle (strategy|operations)|business development strategy/i],
    ["solutions", 1, "Solutions & value consulting", /solutions? (consultant|analyst|strategist|specialist|engineer)|value (consultant|engineer|advisor)|implementation (consultant|specialist|manager|analyst)|product solutions|business value|sales engineer/i],
    ["partnerships", 2, "Partnerships & channel strategy", /partnerships?|partner (operations|strategy|program|manager)|channel strategy|ecosystem/i],
    ["transformation", 2, "Business transformation & programs", /business transformation|process improvement|strategic projects|business process|program analyst|operational excellence|business systems|strategic initiatives/i],
    ["founder", 3, "Founder's office & generalist", /founder'?s? (associate|office)|chief of staff|special projects|generalist|founding (associate|analyst|operator)/i],
    ["rotational", 3, "Rotational & graduate programs", /rotational|management trainee|graduate program|leadership development program|new grad/i],
    ["invest", 3, "Investment research & corporate finance", /investment (analyst|associate)|portfolio (analyst|operations)|equity research|corporate finance/i],
    ["research", 2, "Business research & market intelligence", /strategic insights|market intelligence|competitive intelligence|business research|corporate strategy|market research|research analyst/i],
    ["dds", 2, "Applied & decision data science", /decision scientist|data scientist|advanced analytics/i],
    ["stratops", 1, "Strategy & business operations", /strategy (&|and) operations|business operations|biz ?ops|strat ?ops|business strategy|strategy (analyst|associate|manager|lead)|strategy (&|and) planning|operations strategy|strategic operations|strategic planning|\bstrategy\b/i],
    ["analytics", 1, "Product, growth & customer analytics", /product analy|growth (analy|strategy|operations)|marketing analy|commercial analy|data analyst|business analyst|business intelligence|analytics|insights (analyst|associate|manager)|operations analyst/i],
    ["consulting", 2, "Economic & management consulting", /economic consult|associate consultant|strategy consultant|analytics consultant|management consult|research associate|consultant|consulting analyst/i]
  ];
  var BY_ID = {};
  DIRECTIONS.forEach(function (d) { BY_ID[d[0]] = { id: d[0], tier: d[1], label: d[2] }; });

  // First matching direction, or null. `on` (optional) limits the search to enabled ids.
  function classify(title, on) {
    for (var i = 0; i < DIRECTIONS.length; i++) {
      var d = DIRECTIONS[i];
      if (on && !on[d[0]]) continue;
      if (d[3].test(title || "")) return BY_ID[d[0]];
    }
    return null;
  }
  function list() {
    return DIRECTIONS.map(function (d) { return BY_ID[d[0]]; }).sort(function (a, b) { return a.tier - b.tier || a.label.localeCompare(b.label); });
  }
  function defaults() {   // tiers 1 and 2 on, tier 3 off
    var on = {};
    DIRECTIONS.forEach(function (d) { if (d[1] < 3) on[d[0]] = true; });
    return on;
  }

  // ---------- where the job is ----------
  var NYC = /\bnew york\b|\bnyc\b|\bmanhattan\b|\bbrooklyn\b|\bqueens\b|long island city|,\s*ny\b|\bny\s*(\(|-|,|$)/i;
  var UPSTATE = /albany|buffalo|rochester|syracuse|ithaca|binghamton|saratoga|poughkeepsie/i;
  var NJ = /jersey city|hoboken|newark|fort lee|weehawken|secaucus|new jersey|,\s*nj\b/i;
  var REMOTE = /remote|anywhere|distributed|work from home|\bwfh\b/i;
  var LOC_LABEL = { nyc: "New York City", nj: "New Jersey commute", remote: "Remote", other: "Other U.S. cities", unknown: "Location not listed" };

  // locs: a string or list of strings. A job open in several cities counts as the best one for you.
  function locClass(locs, remoteFlag) {
    var s = (Array.isArray(locs) ? locs : [locs]).filter(Boolean).join(" | ");
    if (NYC.test(s) && !(UPSTATE.test(s) && !/new york city|\bnyc\b|manhattan|brooklyn/i.test(s))) return "nyc";
    if (NJ.test(s)) return "nj";
    if (remoteFlag || REMOTE.test(s)) return "remote";
    return s.trim() ? "other" : "unknown";
  }

  return { classify: classify, list: list, defaults: defaults, byId: BY_ID, locClass: locClass, LOC_LABEL: LOC_LABEL,
    LOC_DEFAULT: { nyc: true, nj: true, remote: true, other: false, unknown: true } };
});
