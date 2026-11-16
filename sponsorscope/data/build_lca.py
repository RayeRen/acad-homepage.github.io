"""Builds the sponsorship lookup files the tool reads.

Sources (U.S. Department of Labor, OFLC performance data):
  - LCA_Disclosure_Data_FY*_Q*.xlsx   H-1B labor condition applications.
    Each file holds ONE quarter of decisions, so three years needs 12 files.
  - PERM_Disclosure_Data_*.xlsx       green-card labor certifications.
    Each file is cumulative for its fiscal year.

Rows are bucketed by DECISION_DATE, never by file name, into three
back-to-back 12-month periods that end with the newest month found. The
most recent period carries the detail (role family, new hires, entry-level
wage levels, NYC-metro worksites, titles, wages); the two before it give
the trend.

Kept: H-1B filings whose status starts with "Certified"; PERM cases whose
status starts with "Certified". Duplicate case numbers are counted once.

Output: lca/<shard>.json, one shard per first two characters of the
normalized employer name, so the page only downloads the slice it needs.

Usage: python3 build_lca.py <folder containing the .xlsx files>
"""
import datetime, json, os, re, shutil, statistics, sys
from collections import defaultdict, Counter
from python_calamine import CalamineWorkbook

SUFFIX = {"INC", "INCORPORATED", "LLC", "LLP", "LP", "LTD", "LIMITED", "CORP", "CORPORATION", "CO",
          "COMPANY", "PLC", "NA", "PC", "PLLC", "USA", "US", "HOLDINGS", "HOLDING", "GROUP", "THE"}

def norm(name):
    s = (name or "").upper().replace("&", " AND ")
    s = re.sub(r"\bL\s*L\s*C\b", "LLC", s)
    s = re.sub(r"\bL\s*\.?\s*P\b\.?", "LP", s)
    s = re.sub(r"\bN\s*\.?\s*A\b\.?", "NA", s)
    s = re.sub(r"[^A-Z0-9]+", " ", s).split()
    while s and s[0] == "THE": s = s[1:]
    while len(s) > 1 and s[-1] in SUFFIX: s = s[:-1]
    if len(s) > 1 and s[-1] == "AND": s = s[:-1]
    return " ".join(s)

# Role families, checked in order. Mirrors FAMILIES in lca.js — keep the two identical.
FAMILIES = [
    ("solutions", r"solutions? (consultant|engineer|analyst|architect|specialist|strategist)|sales engineer|pre.?sales|implementation (consultant|specialist|manager|analyst|engineer|lead)|customer success|value (consultant|engineer|advisor)|forward deployed|deployment strategist|technical account manager"),
    ("gtm", r"revenue operations|sales operations|go.to.market|\bgtm\b|revops|sales strategy|deal desk|commercial operations|partnerships?|partner (operations|manager|program)|business development"),
    ("eng", r"software|security analyst|systems analyst|it analyst|developer|programmer|architect|devops|engineer"),
    ("risk", r"risk|compliance|fraud|\baml\b|\bkyc\b|audit|regulatory|trust (and|&) safety"),
    ("ds", r"data scien|machine learning|statistician|quantitative|\bquant\b|decision scien"),
    ("product", r"product manager|product management|product operations|product strategy|product owner|product lead"),
    ("strategy", r"strateg|strat ?ops|business operations|biz ?ops|operations analyst|operations associate|operations manager|consultant|management analyst|chief of staff|special projects"),
    ("analyst", r"data analyst|business analyst|analytics|insight|business intelligence|\bbi\b|reporting analyst|research analyst|market research|product analyst|marketing analyst|pricing analyst|analyst"),
    ("marketing", r"marketing|growth|brand manager|lifecycle"),
    ("finance", r"financ|fp&a|accountant|accounting|investment|treasury|valuation"),
]
FRX = [(k, re.compile(p, re.I)) for k, p in FAMILIES]
def family(title):
    for k, rx in FRX:
        if rx.search(title or ""): return k
    return "other"

def shard_of(key):
    return key[:2].replace(" ", "_").lower()

UNIT = {"Year": 1, "Hour": 2080, "Week": 52, "Bi-Weekly": 26, "Month": 12}

# New York City commuting area, by worksite county (falls back to city when the county is blank).
METRO_COUNTY = {"NY": {"NEW YORK", "KINGS", "QUEENS", "BRONX", "RICHMOND", "WESTCHESTER", "NASSAU"},
                "NJ": {"HUDSON", "BERGEN", "ESSEX", "UNION", "MIDDLESEX", "MORRIS", "PASSAIC", "SOMERSET"}}
METRO_CITY = {"NY": {"NEW YORK", "NEW YORK CITY", "NYC", "MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "LONG ISLAND CITY", "STATEN ISLAND", "WHITE PLAINS"},
              "NJ": {"JERSEY CITY", "HOBOKEN", "NEWARK", "FORT LEE", "WEEHAWKEN", "SECAUCUS", "EDISON", "ISELIN", "PARSIPPANY", "MORRISTOWN", "NEW BRUNSWICK", "PISCATAWAY"}}
def in_metro(state, county, city):
    st = str(state or "").strip().upper()
    if st not in METRO_COUNTY: return False
    co = re.sub(r"\s+COUNTY$", "", str(county or "").strip().upper())
    if co: return co in METRO_COUNTY[st]
    return str(city or "").strip().upper() in METRO_CITY[st]

def month_of(d):
    """Months since year 0, or None."""
    if isinstance(d, (datetime.date, datetime.datetime)): return d.year * 12 + d.month - 1
    m = re.match(r"(\d{4})-(\d{2})", str(d or ""))
    return int(m.group(1)) * 12 + int(m.group(2)) - 1 if m else None

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return 0.0

def rows(path):
    it = CalamineWorkbook.from_path(path).get_sheet_by_index(0).iter_rows()
    h = next(it)
    return {c: i for i, c in enumerate(h)}, it

def read_lca(path, seen):
    ix, it = rows(path)
    out = []
    g = lambda r, c: r[ix[c]] if c in ix else None
    for r in it:
        if r[ix["VISA_CLASS"]] != "H-1B" or not str(r[ix["CASE_STATUS"]]).startswith("Certified"): continue
        case = r[ix["CASE_NUMBER"]]
        if case in seen: continue
        seen.add(case)
        name = str(r[ix["EMPLOYER_NAME"]] or "").strip(); key = norm(name)
        mo = month_of(r[ix["DECISION_DATE"]])
        if not key or mo is None: continue
        title = str(r[ix["JOB_TITLE"]] or "").strip()
        w = num(g(r, "WAGE_RATE_OF_PAY_FROM")) * UNIT.get(g(r, "WAGE_UNIT_OF_PAY"), 0)
        kind = "new" if num(g(r, "NEW_EMPLOYMENT")) > 0 else "xfer" if num(g(r, "CHANGE_EMPLOYER")) > 0 else "cont"
        out.append((key, name, mo, title, kind, str(g(r, "PW_WAGE_LEVEL") or "").strip() in ("I", "II"),
                    in_metro(g(r, "WORKSITE_STATE"), g(r, "WORKSITE_COUNTY"), g(r, "WORKSITE_CITY")),
                    int(w) if 15000 < w < 2_000_000 else 0))
    return out

def read_perm(path, seen):
    ix, it = rows(path)
    ncol = "EMP_BUSINESS_NAME" if "EMP_BUSINESS_NAME" in ix else "EMPLOYER_NAME"
    out = []
    for r in it:
        if not str(r[ix["CASE_STATUS"]]).startswith("Certified"): continue
        case = r[ix["CASE_NUMBER"]]
        if case in seen: continue
        seen.add(case)
        name = str(r[ix[ncol]] or "").strip(); key = norm(name)
        mo = month_of(r[ix["DECISION_DATE"]])
        if not key or mo is None: continue
        out.append((key, name, mo, str(r[ix["JOB_TITLE"]] or "").strip()))
    return out

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
def label(m): return "%s %d" % (MONTHS[m % 12], m // 12)
def period_label(end): return label(end - 11) + " – " + label(end)

def main(folder):
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(".xlsx"))
    lca_files = [f for f in files if f.upper().startswith("LCA_DISCLOSURE")]
    perm_files = [f for f in files if f.upper().startswith("PERM_DISCLOSURE")]
    lca, perm, seen = [], [], set()
    for f in lca_files:
        got = read_lca(os.path.join(folder, f), seen); lca += got
        print(f, len(got), flush=True)
    seen = set()
    for f in perm_files:
        got = read_perm(os.path.join(folder, f), seen); perm += got
        print(f, len(got), flush=True)

    end = max(r[2] for r in lca)                    # newest decision month
    def period(mo):                                 # 2 = newest 12 months, 1, 0 = the two before
        back = (end - mo) // 12
        return 2 - back if 0 <= back <= 2 else None
    # A period only counts if the files cover it (one empty month is allowed: Oct 2025 was a federal shutdown).
    have = Counter(r[2] for r in lca)
    full = [sum(have.get(end - 12 * (2 - p) - i, 0) > 0 for i in range(12)) >= 11 for p in range(3)]
    phave = Counter(r[2] for r in perm)
    pfull = [sum(phave.get(end - 12 * (2 - p) - i, 0) > 0 for i in range(12)) >= 11 for p in range(3)]

    emp = defaultdict(lambda: {"names": Counter(), "y": [0, 0, 0], "fy": defaultdict(lambda: [0, 0, 0]),
                               "kind": Counter(), "metro": 0,
                               "fam": defaultdict(lambda: {"new": 0, "xfer": 0, "lv": 0, "metro": 0, "w": []}),
                               "titles": defaultdict(list), "old_titles": defaultdict(list),
                               "pm": [0, 0, 0], "pmf": Counter()})
    for key, name, mo, title, kind, entry, metro, w in lca:
        p = period(mo)
        if p is None: continue
        e = emp[key]; fam = family(title)
        e["names"][name] += 1; e["y"][p] += 1; e["fy"][fam][p] += 1
        tkey = (fam, title.title() if title.isupper() else title)
        if p == 2:
            e["kind"][kind] += 1; e["metro"] += metro
            d = e["fam"][fam]
            if kind in d: d[kind] += 1
            d["lv"] += entry; d["metro"] += metro
            if w: d["w"].append(w)
            e["titles"][tkey].append(w)
        elif p == 1:
            e["old_titles"][tkey].append(w)
    for key, name, mo, title in perm:
        p = period(mo)
        if p is None: continue
        e = emp[key]
        if not e["names"]: e["names"][name] += 1
        e["pm"][p] += 1
        if p == 2: e["pmf"][family(title)] += 1

    def top_titles(titles):
        by_fam = defaultdict(list)
        for (fam, t), ws in titles.items(): by_fam[fam].append((t, ws))
        out = []
        for fam, items in by_fam.items():
            merged = defaultdict(list)                       # "Data Analyst" and "data analyst" are one title
            shown = {}
            for t, ws in items:
                k = t.lower(); merged[k] += ws; shown.setdefault(k, t)
            for k, ws in sorted(merged.items(), key=lambda kv: -len(kv[1]))[:3]:
                good = [w for w in ws if w]
                out.append([shown[k], len(ws), int(statistics.median(good)) if good else 0, fam])
        out.sort(key=lambda t: -t[1])
        return out

    shards = defaultdict(dict)
    for key, e in emp.items():
        fams = {}
        for fam, ys in e["fy"].items():
            d = e["fam"].get(fam, {"new": 0, "xfer": 0, "lv": 0, "metro": 0, "w": []})
            # [last 12 mo, new hires, transfers in, entry-level, NYC metro, median wage, prior 12 mo, 12 mo before that]
            fams[fam] = [ys[2], d["new"], d["xfer"], d["lv"], d["metro"],
                         int(statistics.median(d["w"])) if d["w"] else 0, ys[1], ys[0]]
        rec = {"names": [nm for nm, _ in e["names"].most_common(3)], "y": e["y"], "f": fams,
               "k": [e["kind"]["new"], e["kind"]["xfer"], e["kind"]["cont"]], "m": e["metro"],
               "t": top_titles(e["titles"] or e["old_titles"])}
        if any(e["pm"]): rec["pm"] = e["pm"]
        if e["pmf"]: rec["pf"] = dict(e["pmf"])
        shards[shard_of(key)][key] = rec

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lca")
    if os.path.isdir(out): shutil.rmtree(out)
    os.makedirs(out)
    for s, d in shards.items():
        with open(os.path.join(out, s + ".json"), "w") as fh:
            json.dump(d, fh, separators=(",", ":"))
    totals = [sum(e["y"][p] for e in emp.values()) for p in range(3)]
    ptotals = [sum(e["pm"][p] for e in emp.values()) for p in range(3)]
    meta = {"period": period_label(end),
            "periods": [period_label(end - 24), period_label(end - 12), period_label(end)],
            "full": full, "filings": totals, "permFull": pfull, "perm": ptotals,
            "employers": len(emp), "built": datetime.date.today().isoformat(),
            "source": "U.S. Department of Labor, OFLC disclosure data",
            "files": lca_files + perm_files}
    with open(os.path.join(out, "meta.json"), "w") as fh:
        json.dump(meta, fh, indent=1)
    print(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
