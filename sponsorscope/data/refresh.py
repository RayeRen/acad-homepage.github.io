"""Checks the Department of Labor for a newer quarter of disclosure data and,
if there is one, downloads the files and rebuilds the lookup (build_lca.py).

The Department publishes one H-1B (LCA) file per quarter and one green-card
(PERM) file per fiscal year to date, a month or two after each quarter ends.
File names are predictable, so "is there something new" is a HEAD request
for the next quarter's name. The folder they live in has changed over time,
so each name is tried under every known folder.

Usage:
  python3 refresh.py                 check, and rebuild if a new quarter exists
  python3 refresh.py --check-only    only say whether a new quarter exists
  python3 refresh.py --force         rebuild from the newest files even if nothing is new
  python3 refresh.py --cache DIR     keep downloads in DIR (reused on the next run)

Exit code 0 = finished (new data or not), 2 = the check or the rebuild failed (published data untouched).
In GitHub Actions the result is written to $GITHUB_OUTPUT as new / period / summary.
"""
import json, os, re, shutil, subprocess, sys, tempfile, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
META = os.path.join(HERE, "lca", "meta.json")
BASES = ["https://www.dol.gov/media/", "https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/"]
# Fiscal year 2024 has a second PERM file for cases filed on the new form.
PERM_EXTRA = {2024: ["PERM_Disclosure_Data_New_Form_FY2024_Q4.xlsx"]}
MIN_BYTES = 5_000_000        # a real quarter is 50 MB or more; an error page is a few KB
QUARTERS = 12                # three years of H-1B decisions


def lca_name(fy, q): return "LCA_Disclosure_Data_FY%d_Q%d.xlsx" % (fy, q)
def perm_name(fy, q): return "PERM_Disclosure_Data_FY%d_Q%d.xlsx" % (fy, q)
def step(fy, q, n=1):
    i = fy * 4 + (q - 1) + n
    return i // 4, i % 4 + 1


def find(name):
    """URL and size of a published file, or None."""
    for base in BASES:
        req = urllib.request.Request(base + name, method="HEAD")
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                size = int(r.headers.get("content-length") or 0)
                if r.status == 200 and "spreadsheet" in (r.headers.get("content-type") or "") and size > MIN_BYTES:
                    return base + name, size
        except (urllib.error.URLError, TimeoutError, ValueError):
            continue
    return None


def newest(pattern, files):
    got = [(int(m.group(1)), int(m.group(2))) for m in (re.match(pattern, f) for f in files) if m]
    return max(got) if got else None


def download(url, size, dest):
    if os.path.exists(dest) and os.path.getsize(dest) == size:
        return
    print("downloading", url, "(%d MB)" % (size // 1_000_000), flush=True)
    tmp = dest + ".part"
    with urllib.request.urlopen(url, timeout=600) as r, open(tmp, "wb") as fh:
        shutil.copyfileobj(r, fh, 1 << 20)
    if os.path.getsize(tmp) != size:
        raise IOError("incomplete download: " + url)
    os.replace(tmp, dest)


def output(**kv):
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a") as fh:
            for k, v in kv.items():
                fh.write("%s=%s\n" % (k, v))


def main(argv):
    check_only, force = "--check-only" in argv, "--force" in argv
    cache = argv[argv.index("--cache") + 1] if "--cache" in argv else None
    with open(META) as fh:
        old = json.load(fh)

    have_lca = newest(r"LCA_Disclosure_Data_FY(\d{4})_Q(\d)\.xlsx$", old["files"])
    have_perm = newest(r"PERM_Disclosure_Data_FY(\d{4})_Q(\d)\.xlsx$", old["files"])
    # If even the file already in use cannot be found, the site is unreachable from here; say so
    # instead of reporting "nothing new" forever.
    if not find(lca_name(*have_lca)):
        msg = "Could not reach the Department of Labor files from this machine (the file already in use, %s, was not found)." % lca_name(*have_lca)
        print(msg)
        output(new="false", failed="true", summary=msg)
        return 2
    # Look up to two quarters ahead, so one skipped check never leaves the data a quarter behind.
    new_lca = [q for q in (step(*have_lca, 2), step(*have_lca, 1)) if find(lca_name(*q))]
    new_perm = [q for q in (step(*have_perm, 2), step(*have_perm, 1)) if find(perm_name(*q))]
    if not new_lca and not new_perm and not force:
        print("No new quarter yet. Newest H-1B file: FY%d Q%d." % have_lca)
        output(new="false")
        return 0
    last = max(new_lca) if new_lca else have_lca
    print("Newest H-1B quarter published: FY%d Q%d (had FY%d Q%d)." % (last + have_lca))
    if check_only:
        output(new="true")
        return 0

    # The 12 quarters ending with the newest one, and for every fiscal year they touch, its latest PERM file.
    wanted = []
    for back in range(QUARTERS - 1, -1, -1):
        wanted.append(lca_name(*step(*last, -back)))
    first_fy = step(*last, -(QUARTERS - 1))[0]
    for fy in range(first_fy, last[0] + 1):
        for q in (4, 3, 2, 1):
            if find(perm_name(fy, q)):
                wanted.append(perm_name(fy, q)); break
        wanted += PERM_EXTRA.get(fy, [])

    store = cache or tempfile.mkdtemp(prefix="dol-")
    os.makedirs(store, exist_ok=True)
    work = tempfile.mkdtemp(prefix="dol-build-")
    try:
        for name in wanted:
            hit = find(name)
            if not hit:
                raise IOError("not published: " + name)
            download(hit[0], hit[1], os.path.join(store, name))
            os.symlink(os.path.abspath(os.path.join(store, name)), os.path.join(work, name))
        subprocess.run([sys.executable, os.path.join(HERE, "build_lca.py"), work], check=True, stdout=subprocess.DEVNULL)
        with open(META) as fh:
            new = json.load(fh)
        # A rebuild that lost most of the data is worse than stale data: refuse it.
        problems = []
        if not all(new["full"]): problems.append("an H-1B period is incomplete: %s" % new["full"])
        if not 0.7 < new["employers"] / old["employers"] < 1.4: problems.append("employer count moved from %d to %d" % (old["employers"], new["employers"]))
        if not 0.7 < new["filings"][2] / old["filings"][2] < 1.4: problems.append("latest-year filings moved from %d to %d" % (old["filings"][2], new["filings"][2]))
        if problems:
            raise ValueError("; ".join(problems))
    except Exception as err:                     # leave the published data untouched
        print("Rebuild failed:", err)
        subprocess.run(["git", "-C", HERE, "checkout", "--", "lca"], check=False)
        output(new="true", failed="true", summary=str(err).replace("\n", " "))
        return 2
    finally:
        shutil.rmtree(work, ignore_errors=True)
        if not cache: shutil.rmtree(store, ignore_errors=True)

    summary = "%s: %s H-1B filings over three years, %s employers" % (
        new["period"], format(sum(new["filings"]), ","), format(new["employers"], ","))
    print("Rebuilt.", summary)
    output(new="true", failed="false", period=new["period"], summary=summary)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
