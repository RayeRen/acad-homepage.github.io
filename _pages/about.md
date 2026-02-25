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

Currently, I am pursuing a Ph.D. in Computer Science at the School of Data Science, The Chinese University of Hong Kong, Shenzhen, supervised by [Prof. Juexiao Zhou (周觉晓)](https://www.joshuachou.ink/about/). I received my Bachelor's degree in Software Engineering from Dalian University of Technology, supervised by [Prof. Junxin Chen (陈俊鑫)](https://faculty.dlut.edu.cn/chenjunxin/zh_CN/index.htm).

My research interest includes Multimodal Fusion, AI4H(Artificial Intelligence for Healthcare) and Healthcare Agents.


# 🔥 News
{% for news in site.data.news %}
- *{{ news.date }}*: &nbsp; {{ news.content }}
{% endfor %}

# 📖 Educations
{% for edu in site.data.educations %}
- *{{ edu.date }}*, {{ edu.role }} at {{ edu.institution }}, {{ edu.location }}.
{% endfor %}

# 📝 Publications 

{% if site.data.publications %}
{% for pub in site.data.publications %}
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">{{ pub.venue }}</div><img src='{{ pub.image }}' alt="sym" width="100%" loading="lazy"></div></div>
<div class='paper-box-text' markdown="1">

[{{ pub.title }}]({{ pub.paper_url }})

{{ pub.authors }}

[**Project**]({{ pub.project_url }}) <strong><span class='show_paper_citations' data='{{ pub.citation }}'></span></strong>
- {{ pub.excerpt }}
</div>
</div>
{% endfor %}
{% endif %}

<!-- Example of hardcoded publication entry (commented out):
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2016</div><img src='images/500x300.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">
<!-- <div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2016</div><img src='images/500x300.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1"> -->

<!-- [Deep Residual Learning for Image Recognition](https://openaccess.thecvf.com/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf)

**Kaiming He**, Xiangyu Zhang, Shaoqing Ren, Jian Sun

[**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
</div>
</div>
-->

# 🎖 Honors and Awards
{% for honor in site.data.honors %}
- *{{ honor.date }}* {{ honor.name }}
{% endfor %}


# 👨‍🏫 Teaching

{% if site.data.teaching %}
{% for teach in site.data.teaching %}
- *{{ teach.date }}*, {{ teach.content }} {% if teach.links %} | {% for link in teach.links %}[\[{{ link.text }}\]]({{ link.url }}){% endfor %}{% endif %}
{% endfor %}
{% endif %}

<!-- Example of hardcoded teaching entry (commented out):
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) 
-->
