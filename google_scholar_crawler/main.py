import json
import os
from scholarly import scholarly

scholar_id = os.environ.get("GOOGLE_SCHOLAR_ID", "")
if not scholar_id:
    raise ValueError("GOOGLE_SCHOLAR_ID environment variable is not set")

print(f"Fetching data for scholar ID: {scholar_id}")
author = scholarly.search_author_id(scholar_id)
scholarly.fill(author, sections=["basics", "indices", "counts", "publications"])

stats = {
    "citations":    author.get("citedby",    0),
    "citations5y":  author.get("citedby5y",  0),
    "hindex":       author.get("hindex",     0),
    "hindex5y":     author.get("hindex5y",   0),
    "i10index":     author.get("i10index",   0),
    "i10index5y":   author.get("i10index5y", 0),
}

publications = []
for pub in author.get("publications", []):
    bib = pub.get("bib", {})
    publications.append({
        "title":  bib.get("title", ""),
        "year":   bib.get("pub_year", ""),
        "venue":  bib.get("venue", ""),
        "cites":  pub.get("num_citations", 0),
    })

os.makedirs("results", exist_ok=True)

with open("results/gs_data.json", "w") as f:
    json.dump({"stats": stats, "publications": publications}, f, indent=2)

print(f"Done. Total citations: {stats['citations']}, h-index: {stats['hindex']}")
