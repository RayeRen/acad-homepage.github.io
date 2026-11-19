// Usage: node run_eval.js [dev_set.json|test_round1.json|test_round2.json] [--misses]
// Scores the engine against the hand-labeled benchmark (dev_set.json by default).
const S = require("../engine.js");
const file = process.argv.find(a => a.endsWith(".json")) || "./dev_set.json";
const bench = require(file.startsWith("/") ? file : "./" + file.replace(/^.*\//, ""));
const MAP = { no_sponsorship: "deny", authorized_no_sponsor: "deny", citizens_only: "restrict", clearance: "restrict",
  authorization_unclear: "unclear", sponsorship_offered: "offer", perm_posting: "perm" };
const PRI = ["deny", "restrict", "perm", "unclear", "offer"];
const verdictOf = l => (l === "deny" || l === "restrict") ? "skip" : (l === "unclear" || l === "perm") ? "ask" : "apply";
let right = 0; const cm = {}; const miss = [];
for (const b of bench) {
  const r = S.analyze(b.sentence, { salaryFloor: 0, maxYears: 99 });
  const labs = r.findings.map(f => MAP[f.code]).filter(Boolean);
  const pred = PRI.find(p => labs.includes(p)) || "none";
  if (pred === b.label) right++; else miss.push(`${b.label} → ${pred} | ${b.sentence.slice(0, 110)}`);
  const k = verdictOf(b.label) + ">" + verdictOf(pred); cm[k] = (cm[k] || 0) + 1;
}
const prf = (cls) => {
  const tp = bench.filter(b => verdictOf(b.label) === cls && cm).length;
  const T = Object.entries(cm);
  const t = T.filter(([k]) => k === cls + ">" + cls).reduce((a, [, v]) => a + v, 0);
  const actual = T.filter(([k]) => k.startsWith(cls + ">")).reduce((a, [, v]) => a + v, 0);
  const predicted = T.filter(([k]) => k.endsWith(">" + cls)).reduce((a, [, v]) => a + v, 0);
  return { recall: t / actual, precision: t / predicted, n: actual };
};
const out = { sentences: bench.length, label_accuracy: right / bench.length, skip: prf("skip"), ask: prf("ask"), confusion: cm };
console.log(JSON.stringify(out, null, 1));
if (process.argv.includes("--misses")) console.log(miss.join("\n"));
