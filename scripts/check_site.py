#!/usr/bin/env python3
"""Validate generated local links, fragment targets, assets, and demo removal."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, sys, re
root=Path('_site').resolve()
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=set(); self.h1=0; self.text=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.add(a['id'])
        if tag=='h1':self.h1+=1
        for key in ('href','src'):
            if key in a:self.refs.append(a[key])
    def handle_data(self,data):self.text.append(data)
errors=[]; pages={}
for f in root.rglob('*.html'):
    parser=Page(); parser.feed(f.read_text());pages[f]=parser
for f,page in pages.items():
    text=' '.join(page.text)
    if re.search(r'Write your biography|You R\. Name|Albert Einstein|555 your office|Add image here|Month DD|Your City',text,re.I):errors.append(f'Placeholder: {f.relative_to(root)}')
    # Redirects legitimately have no H1.
    if not f.name.startswith('google') and page.h1 != 1 and 'http-equiv="refresh"' not in f.read_text():errors.append(f'H1 count {page.h1}: {f.relative_to(root)}')
    for ref in page.refs:
        u=urlsplit(ref)
        if u.scheme and u.scheme not in ('http','https'):continue
        if u.netloc and u.netloc!='raiedahmed-lab.github.io':continue
        if not u.path:target=f
        else:target=(root/unquote(u.path.lstrip('/'))) if u.path.startswith('/') else (f.parent/unquote(u.path))
        if target.is_dir():target=target/'index.html'
        if not target.exists():errors.append(f'{f.relative_to(root)} -> missing {ref}');continue
        if u.fragment and target.suffix=='.html' and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{f.relative_to(root)} -> missing fragment {ref}')
for route in ['index.html','research/index.html','research/soil-transfer/index.html','research/kaolin-stabilization/index.html','research/water-infrastructure/index.html','publications/index.html','about/index.html','hobbies/index.html','about.html','cv/index.html','assets/resume.pdf','sitemap.xml','404.html']:
    if not (root/route).is_file():errors.append('Missing required route: '+route)
if (root/'assets/resume.pdf').exists() and hashlib.sha256((root/'assets/resume.pdf').read_bytes()).digest()!=hashlib.sha256(Path('assets/resume.pdf').read_bytes()).digest():errors.append('CV changed during build')
if errors:
    print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} HTML pages; internal links, fragments, assets, required routes, one H1, demo scan, CV integrity.')
