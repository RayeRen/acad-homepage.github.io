---
layout: academic
permalink: /
description: Coco Ke Zou is a Research Fellow at the National University of Singapore studying uncertainty, external validation, and grounded reasoning in medical AI.
redirect_from:
  - /about/
  - /about.html
---
{% assign profile = site.data.profile %}
<div class="wrap home">
  <div class="home-intro" id="about-me">
    <header class="home-identity">
      <h1>{{ profile.name }} <span lang="zh">{{ profile.native_name }}</span></h1>
      <p class="home-affiliation">{{ profile.role }} · <a href="{{ site.author.nusdiscovery }}">{{ profile.affiliation }}</a></p>
      <p class="home-links">
        <a href="{{ '/cv/' | relative_url }}">CV</a>
        <a href="{{ site.author.googlescholar | escape }}">Google Scholar</a>
        <a href="https://github.com/{{ site.author.github }}">GitHub</a>
        <a href="mailto:{{ profile.email }}">Email</a>
      </p>
    </header>
    <img class="home-portrait" src="{{ '/images/ke-zou-450.webp' | relative_url }}" width="450" height="600" fetchpriority="high" alt="Portrait of {{ profile.name }}">
  </div>

  <section class="home-section home-biography" id="research">
    <h2>Biography and research</h2>
    <div id="-educations">{{ profile.bio | markdownify }}</div>
    <p id="roadmap"><strong>I study how medical AI can recognize uncertainty, generalize across populations, and ground its decisions in clinical evidence.</strong> I focus on three questions:</p>
    <ul class="home-research">
      <li id="trustworthy-medical-image-analysis"><a href="{{ '/research/#trustworthy' | relative_url }}"><strong>When should a model defer?</strong></a> I develop uncertainty estimation and calibration methods for medical image analysis.</li>
      <li id="explainable-and-groundable-vlm"><a href="{{ '/research/#explainable' | relative_url }}"><strong>Can clinicians verify a model’s reasoning?</strong></a> I connect diagnostic language to image evidence and study how <a id="agentsagentic-for-specialists" href="{{ '/research/#agents' | relative_url }}">clinical AI agents</a> can verify evidence and escalate uncertain cases.</li>
      <li id="fm-for-generalists"><a href="{{ '/research/#foundation' | relative_url }}"><strong>Does performance transfer across populations?</strong></a> I benchmark medical foundation models on external cohorts and study how much labeled data they need.</li>
    </ul>
  </section>

  <section class="home-section" id="-publications">
    <span id="-selected-publications--means-co-first-author"></span>
    <div id="-experiences">
      <div class="home-section-heading">
        <h2>Featured work</h2>
        <a href="{{ site.author.googlescholar | escape }}" aria-label="All publications on Google Scholar">All publications</a>
      </div>
      {% include featured-projects.html compact=true %}
    </div>
  </section>

  <section class="home-section" id="-news">
    <h2>Recent news</h2>
    {% assign recent_news = site.data.news | slice: 0, 5 %}
    {% assign archive = site.data.news | slice: 5, site.data.news.size %}
    {% include news-items.html items=recent_news %}
    <details class="archive">
      <summary>Earlier updates ({{ archive.size }})</summary>
      {% include news-items.html items=archive %}
    </details>
  </section>

  <section class="home-section" id="-activities">
    <span id="guest-editors"></span><span id="handling-editor"></span><span id="area-chairs"></span><span id="reviewers"></span>
    <h2>Academic activities</h2>
    <ul class="home-activity-list">
      {% for appointment in site.data.record.editorial_appointments %}
        <li><strong>{{ appointment.role | escape }}</strong> · {{ appointment.venue | escape }}</li>
      {% endfor %}
      {% for appointment in site.data.record.conference_appointments %}
        <li><strong>{{ appointment.role | escape }}</strong> · {{ appointment.venue | escape }}</li>
      {% endfor %}
      <li><a href="{{ '/service/#peer-review' | relative_url }}">Journal and conference peer review</a></li>
      <li><a href="{{ '/cv/#projects' | relative_url }}">Research funding</a></li>
      <li id="-academic-visits-and-exchanges"><a href="{{ '/cv/#exchanges' | relative_url }}">Academic visits and exchanges</a></li>
      <li id="-talks"><a id="-talks-and-presentations" href="{{ '/teaching/#talks' | relative_url }}">Talks and presentations</a></li>
    </ul>
    <p><a href="{{ '/service/' | relative_url }}">Full academic service record</a></p>
  </section>

  <section class="home-section" id="-honors-and-awards">
    <h2>Honors and awards</h2>
    <ul class="home-activity-list">
      <li><strong>NUS Medicine Outstanding Research Fellow Award</strong> · First runner-up, 2026</li>
      <li><strong>Best Poster Award</strong> · 13th Medical Imaging Computing Seminar (MICS), 2026</li>
    </ul>
    <p><a href="{{ '/cv/#honors' | relative_url }}">All honors and awards</a></p>
  </section>

  <section class="home-section" id="contact">
    <h2>Contact</h2>
    <p>I welcome collaborations on uncertainty estimation, external validation, and evidence-grounded medical AI.</p>
    <p><a href="mailto:{{ profile.email }}">{{ profile.email }}</a> · <a href="mailto:{{ profile.alternate_email }}">{{ profile.alternate_email }}</a></p>
    <p class="home-links">
      <a href="{{ site.author.nusdiscovery }}">NUS Discovery</a>
      <a href="{{ site.author.orcid }}">ORCID</a>
      <a href="{{ site.author.pubmed }}">PubMed</a>
      <a href="https://www.linkedin.com/in/{{ site.author.linkedin | uri_escape }}">LinkedIn</a>
      <a href="http://s01.flagcounter.com/more/V8">Visitor map</a>
    </p>
  </section>
</div>
