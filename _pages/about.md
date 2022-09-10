---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

{% include_relative includes/intro.md %}
<!--
If you like the template of this homepage, welcome to star and fork my open-sourced template version [AcadHomepage ![img](https://camo.githubusercontent.com/53898d03ff1cd0d0836068f594079eb170e1cd4930820bc2b3e4e1c9cd3f56d7/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f5261796552656e2f616361642d686f6d65706167652e6769746875622e696f3f7374796c653d736f6369616c)](https://github.com/RayeRen/acad-homepage.github.io). -->

{% include_relative includes/education.md %}

{% include_relative includes/news.md %}

{% include_relative includes/research.md %}

{% include_relative includes/project.md %}

{% include_relative includes/competition.md %}

{% include_relative includes/honors.md %}

{% include_relative includes/others.md %}
