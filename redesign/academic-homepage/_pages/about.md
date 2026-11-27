---
layout: academic
permalink: /
description: Coco Ke Zou is a Research Fellow at the National University of Singapore working on trustworthy medical AI, multimodal foundation models, and clinical agents.
redirect_from:
  - /about/
  - /about.html
---
{% assign profile = site.data.profile %}
<section class="hero" id="about-me">
  <div class="wrap hero-inner">
    <div>
      <p class="eyebrow">{{ profile.role }} · {{ profile.affiliation }}</p>
      <h1>{{ profile.name }} <span lang="zh">{{ profile.native_name }}</span></h1>
      <p class="vision">Building medical AI that clinicians can verify and trust.</p>
      <p class="hero-description">I study how medical AI can recognize uncertainty, ground its reasoning in clinical evidence, and make reliable decisions across patients and settings.</p>
      <div class="actions">
        <a class="button primary" href="{{ '/cv/' | relative_url }}">View CV</a>
        <a class="button" href="{{ site.author.googlescholar | escape }}">Google Scholar</a>
        <a class="button" href="https://github.com/{{ site.author.github }}">GitHub</a>
        <a class="button" href="mailto:{{ profile.email }}">Email</a>
      </div>
    </div>
    <figure class="portrait">
      <img src="{{ profile.portrait | relative_url }}" srcset="{{ '/images/ke-zou-450.webp' | relative_url }} 450w, {{ profile.portrait | relative_url }} 900w" sizes="(max-width: 620px) 280px, (max-width: 850px) 250px, 300px" width="450" height="600" fetchpriority="high" alt="Portrait of {{ profile.name }}">
      <figcaption><a href="{{ site.author.nusdiscovery }}">National University of Singapore</a><span>Singapore</span></figcaption>
    </figure>
  </div>
</section>

<section class="wrap highlights" id="-honors-and-awards" aria-label="Academic highlights">
  {% for item in profile.highlights %}
    <div><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></div>
  {% endfor %}
  <a class="text-link" href="{{ '/cv/#honors' | relative_url }}">All honors</a>
</section>

<section class="wrap section" id="research">
  <header class="section-head"><h2>Research directions</h2></header>
  <div class="research-grid">
    {% for theme in site.data.research %}
      {% case theme.id %}
        {% when "trustworthy" %}{% assign old_anchor = "trustworthy-medical-image-analysis" %}
        {% when "foundation" %}{% assign old_anchor = "fm-for-generalists" %}
        {% when "explainable" %}{% assign old_anchor = "explainable-and-groundable-vlm" %}
        {% when "agents" %}{% assign old_anchor = "agentsagentic-for-specialists" %}
      {% endcase %}
      <a id="{{ old_anchor }}" class="card research-card" href="{{ '/research/#' | append: theme.id | relative_url }}">
        {% include research-icon.html name=theme.icon %}
        <h3>{{ theme.title }}</h3>
        <p>{{ theme.summary }}</p>
        <span class="text-link">Explore research</span>
      </a>
    {% endfor %}
  </div>
</section>

<section class="band" id="-publications">
  <span id="-selected-publications--means-co-first-author"></span>
  <div class="wrap section" id="-experiences">
    <header class="section-head"><h2>Featured work</h2><a class="text-link" href="{{ '/publications/' | relative_url }}">Browse publications</a></header>
    {% include featured-projects.html %}
    <p class="projects-link"><a class="text-link" href="{{ '/cv/#projects' | relative_url }}">Funded projects</a></p>
  </div>
</section>

<section class="wrap section" id="roadmap">
  <header class="section-head"><div><p class="eyebrow">Research roadmap</p><h2>From reliable perception to trustworthy clinical agents</h2></div></header>
  <ol class="roadmap">
    {% for theme in site.data.research %}
      <li><a href="{{ '/research/#' | append: theme.id | relative_url }}"><strong>{{ theme.stage }}</strong></a><p>{{ theme.summary }}</p></li>
    {% endfor %}
  </ol>
</section>

<section class="band" id="-news">
  <div class="wrap section split">
    <div>
      <h2>Recent news</h2>
      {% assign recent_news = site.data.news | slice: 0, 5 %}
      {% assign archive = site.data.news | slice: 5, site.data.news.size %}
      {% include news-items.html items=recent_news %}
      <details class="archive">
        <summary>Earlier updates ({{ archive.size }})</summary>
        {% include news-items.html items=archive %}
      </details>
    </div>
    <aside id="-academic-visits-and-exchanges">
      <h2>International collaboration</h2>
      <p>My work at NUS and visiting doctoral research at A*STAR have been complemented by academic visits and research discussions abroad.</p>
      <ul class="plain exchange-list">
        {% for item in profile.exchanges %}
          <li><strong>{{ item.institution }}</strong><span>{{ item.detail }}</span></li>
        {% endfor %}
      </ul>
      <a class="text-link" href="{{ '/cv/#affiliations' | relative_url }}">Affiliations and training</a>
    </aside>
  </div>
</section>

<section class="wrap section split">
  <div id="-educations">
    <h2>Academic background</h2>
    {{ profile.bio | markdownify }}
    <a class="text-link" href="{{ '/cv/' | relative_url }}">Academic CV</a>
  </div>
  <div id="-activities">
    <span id="guest-editors"></span><span id="handling-editor"></span><span id="area-chairs"></span><span id="reviewers"></span>
    <h2>Academic service</h2>
    <p>Guest editor for IEEE Journal of Biomedical and Health Informatics and Frontiers in Medicine, handling editor for Frontiers in Radiology, and MICCAI area chair in 2025 and 2026.</p>
    <a class="text-link" href="{{ '/service/' | relative_url }}">Editorial appointments and reviewing</a>
    <p id="-talks"><span id="-talks-and-presentations"></span><a class="text-link" href="{{ '/teaching/#talks' | relative_url }}">Talks and presentations</a></p>
  </div>
</section>

<section class="wrap section" id="contact">
  <div class="contact">
    <div>
      <h2>Contact and collaboration</h2>
      <p>I welcome collaborations with clinicians and AI researchers on multimodal learning, visual grounding, uncertainty estimation, benchmarking, and agentic systems.</p>
      <p><a href="mailto:{{ profile.email }}">{{ profile.email }}</a> · <a href="mailto:{{ profile.alternate_email }}">{{ profile.alternate_email }}</a></p>
    </div>
    <div class="profile-links">
      <a href="{{ site.author.nusdiscovery }}">NUS Discovery</a>
      <a href="{{ site.author.orcid }}">ORCID</a>
      <a href="{{ site.author.pubmed }}">PubMed</a>
      <a href="https://www.linkedin.com/in/{{ site.author.linkedin | uri_escape }}">LinkedIn</a>
      <a href="http://s01.flagcounter.com/more/V8">Visitor map</a>
    </div>
  </div>
</section>
