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

Hi! I’m Haokun Zhao, a master's student at UC San Diego, where I work with [Prof. Rose Yu](https://roseyu.com) and [Prof. Michael K. Gilson](https://gilson.ucsd.edu). I earned my B.E. in Computer Science and Engineering at The Chinese University of Hong Kong, Shenzhen, where I worked with [Prof. Jicong Fan](https://jicongfan.github.io). I’ve also collaborated with [Prof. Chenyu You](https://chenyuyou.me) at Stony Brook University.

My research interests include **generative models for drug discovery**, espacially guidance methods that steer diffusion models across different molecular representations towards desirable properties. I'm also interested in building LLM agents for scientific workflows that connect molecular generation with physics-based evaluation in a more automated loop.

<div class="notice--info" markdown="1">
**📢 I'm actively seeking fully funded Ph.D. positions for Fall 2027 in the U.S.** If my background and research experience align with your interests, please feel free to reach out via email — I would be happy to discuss potential research directions and collaborations. Please see my [CV](https://drive.google.com/file/d/1d-I2wEdpIr5ofKwiyPoEGmq0QgETbhGb/view?usp=sharing) for more details.
</div>

<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->


# 🔥 News
- *2026.10*: &nbsp;🎉🎉 Presented **"Retrosynthetic Accessibility as a Guidance for Masked Discrete Diffusion"** as a poster at the 8th Molecular Machine Learning Conference (MoML 2026) at MIT.
<!-- - *2025.11*:  -->
- *2025.10*: &nbsp;🎉🎉 We released [TimeSeriesScientist](https://y-research-sbu.github.io/TimeSeriesScientist/), the first LLM-driven agentic framework for general time series forecasting.

# 📝 Publications 

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">MoML 2026</div><img src='images/moml.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">
[Synthesizability-Guided Discrete Diffusion Model for Molecular Generation](https://www.moml.mit.edu/2026-posters)
 
**<u>Haokun Zhao</u>**, Sharvaree Vadgama, Kunhuan Liu, Andrew Zhou, Michael K. Gilson, Rose Yu
 
[**8th Molecular Machine Learning Conference (MoML), MIT, 2026**](https://www.moml.mit.edu/2026-posters)
- Guides a *frozen* masked discrete diffusion model toward synthesizable molecules by differentiating through the soft denoised prediction — no retraining of the backbone.
- 2.5× higher joint synthesizability-and-binding success over unguided generation across three protein targets, evaluated with AiZynthFinder and AutoDock-GPU.
</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Preprint 2025</div><img src='images/framework.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[TimeSeriesScientist: A General-Purpose AI Agent for Time Series Analysis](https://arxiv.org/abs/2510.01538)

**<u>Haokun Zhao†</u>**, Xiang Zhang†, Jiaqi Wei†, Yiwei Xu, Yuting He, Siqi Sun, Chenyu You

[**Project**](https://y-research-sbu.github.io/TimeSeriesScientist/) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>
- The first LLM-driven agentic framework for general time series forecasting. 
- Produces clear and rigorous reports that make the entire forecasting workflow transparent and interpretable.

***Pre-print'25***
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Preprint 2025</div><img src='images/framework2.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Medical Test-free Disease Detection Based on Big Data](https://arxiv.org/abs/2512.07856)

**<u>Haokun Zhao†</u>**, Yingzhe Bai†, Qingyang Xu, Lixin Zhou, Luqi Huang, Jicong Fan

- Leverages structured knowledge in electronic health records (EHRs) to enable broad-spectrum disease detection with little to no direct medical testing.
- Greatly reduces the cost and risk of disease detection, enabling large-scale, test-free screening for improved public health.

***Pre-print'25 (Under Review for npj Digital Medicine)***
</div>
</div>

<!-- - [Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet](https://github.com), A, B, C, **CVPR 2020** -->

# 📖 Education
- *2024.09 - 2026.06*, M.S. in Electrical and Computer Engineering, **University of California, San Diego**
- *2020.09 - 2024.07*, B.E. in Computer Science and Engineering, **The Chinese University of Hong Kong, Shenzhen**
- *2022.08 - 2022.12*, Visiting Student, **University of California, Berkeley**

# 🎖 Honors and Awards
- *2024.09*, School of Data Science TA/USTF Award.
- *2021 - 2024*, Dean's List. 

<!-- # 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->

# 💬 Teaching 
- *2023.09 - 2024.05*, Undergraduate Student Teaching Fellow (USTF), [***DDA 3020 Machine Learning***](https://sds.cuhk.edu.cn/en/page/1839)

# 💻 Internships
- *2023.07 - 2023.09*, IPC Engineer Intern, RINO Cloud Technology, Shenzhen.

# 📚 Academic Services
Journal Reviewer
- [IEEE Transactions on Neural Networks and Learning Systems](https://cis.ieee.org/publications/t-neural-networks-and-learning-systems/)
- [Pattern Recognition](https://www.sciencedirect.com/journal/pattern-recognition)