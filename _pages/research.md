---
layout: page
title: Research
permalink: /research/
nav: true
nav_order: 1
description: Learning from limited observations. Connecting predictions to engineering decisions.
redirect_from:
  - /projects/
---

My work connects **data-informed geotechnical assessment** with **water infrastructure condition, performance, and affordability**. The first strand provides completed research and public code; the second is the focus of my current graduate work.

{% assign selected = site.projects | sort: 'importance' %}
{% for project in selected %}{% include research-row.liquid project=project %}{% endfor %}

## Related work in progress

Additional collaborations investigate seismic risk and recovery in Chittagong, a systematic review of soil-strength machine learning, probabilistic slope-stability classification, and interpretable pile-capacity prediction. These remain ongoing studies; completed findings are not claimed here.

See the [publications page]({{ '/publications/' | relative_url }}) for conference contributions and manuscripts under review.
