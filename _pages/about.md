---
layout: about
title: Home
permalink: /
subtitle: M.S. student in Civil Engineering · Graduate Research Assistant<br>Georgia Southern University · Statesboro, Georgia
profile:
  align: right
  image: headshot.jpg
  image_circular: false
selected_papers: false
social: true
announcements:
  enabled: false
latest_posts:
  enabled: false
---

<span id="about-me"></span>
<p class="research-kicker">ENGINEERING · DATA · DECISIONS</p>
<h2 class="research-headline">Engineering decisions<br>from imperfect data.</h2>

I investigate how engineering data and machine learning can support more reliable infrastructure decisions. At Georgia Southern University, I work with [Dr. Ram Krishna Mazumder](https://scholars.georgiasouthern.edu/en/persons/ram-krishna-mazumder/) on sewer condition assessment, water-network performance, and water infrastructure affordability in Georgia.

My earlier research examined cross-regional soil-strength prediction and clay stabilization. Across these projects, I ask: **what can we learn from limited observations, and what do we need to know before using a model's predictions?**

<p class="research-actions"><a class="btn btn-sm z-depth-0" href="{{ '/research/' | relative_url }}">Explore my research →</a> <a href="{{ '/assets/resume.pdf' | relative_url }}">Download CV (PDF)</a></p>

<span id="current-research"></span>
<section class="selected-work" aria-labelledby="selected-research">
<h2 id="selected-research">Selected research</h2>
<p class="section-intro">Completed studies and the questions guiding my current work.</p>
{% assign selected = site.projects | sort: 'importance' %}
{% for project in selected %}
{% include research-row.liquid project=project %}
{% endfor %}
</section>

<span id="-publications"></span><span id="publications"></span><span id="selected-publications"></span>
<h2>Selected publications</h2>
<div class="publications">{% bibliography --query @*[selected=true] %}</div>
<p><a href="{{ '/publications/' | relative_url }}">All publications and research contributions →</a></p>

<span id="get-in-touch"></span>
<section class="collaboration-note">
<h2>Let's connect</h2>
<p>I welcome conversations about cross-regional geotechnical prediction, infrastructure condition assessment, and water-system resilience and affordability.</p>
<p><a href="mailto:raiedahmednishat@gmail.com">Email me</a> · <a href="{{ '/about/' | relative_url }}">More about my background</a></p>
</section>

<span id="-news"></span><span id="recent-updates"></span>
<p class="latest-update"><strong>August 2026</strong> · Began my M.S. and Graduate Research Assistantship at Georgia Southern University.</p>
