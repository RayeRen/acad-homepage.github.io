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

I am **Chenyi Zi** (资琛义), a Ph.D. student at [HKUST(GZ)](https://www.hkust-gz.edu.cn/), advised by Prof. [Jia Li](https://sites.google.com/view/lijia/courses). My research focuses on **Physical AI**, graph representation learning, and graph prompt learning. I received my bachelor's degree from the Department of Computer Science at the South China University of Technology, advised by Prof. [Shengfeng He](http://www.shengfenghe.com/).

# News
- *2026.08* &nbsp; We released [R<sup>3</sup>-Bench](https://arxiv.org/abs/2608.16033), a benchmark for resource-rational reasoning under shared budgets.
- *2026.05* &nbsp; Our work on learning interaction priors for protein-protein interaction prediction was accepted by **ICML 2026**.
- *2026.04* &nbsp; Our paper [ChannelMTS](https://doi.org/10.1145/3770854.3783957) was accepted by **KDD 2026**.
- *2025.08* &nbsp; We released [NPG-Muse](https://arxiv.org/abs/2508.20373) for scaling long chain-of-thought reasoning with NP-hard graph problems.
- *2024.09* &nbsp; Two papers have been accepted by **NeurIPS 2024**.
- *2024.06* &nbsp; Our ProG: A Graph Prompt Learning [Benchmark](https://arxiv.org/abs/2406.05346) is published. See this [repo](https://github.com/sheldonresearch/ProG).
- *2024.01* &nbsp; One paper has been accepted by **WWW 2024**.
- *2024.01* &nbsp; One paper has been accepted by **ICLR 2024**.
- *2023.09* &nbsp; The [website](https://graphprompt.github.io) of KDD 2023 Best Paper — **All in One: Multi-Task Prompting for GNN** is online.

# Publications

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">Preprint · 2026</span>

<a class="paper-title" href="https://arxiv.org/abs/2608.16033">R<sup>3</sup>-Bench: LLMs Struggle with Resource-Rational Reasoning under Shared Budgets</a>

Peisong Wang, Zhiwei Ma, Bowen Liu, Feixue Liu, Aochuan Chen, ***Chenyi Zi***, Hongchuan Zeng, Yuhan Li, Jia Li

<span class="paper-links">[Paper](https://arxiv.org/abs/2608.16033) · [Code](https://github.com/NineAbyss/R-3-Bench) · [Dataset](https://huggingface.co/datasets/R-3-Bench/R-3-Bench)</span>

</div>
</div>

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">KDD · 2026</span>

<a class="paper-title" href="https://doi.org/10.1145/3770854.3783957">ChannelMTS: A Multi-modal Time-Series Framework for High-Speed Railway Channel Prediction</a>

Haihong Zhao, Zinan Zheng, ***Chenyi Zi***, Jia Li

<span class="paper-links">[Paper](https://doi.org/10.1145/3770854.3783957)</span>

</div>
</div>

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">Preprint · 2026</span>

<a class="paper-title" href="https://arxiv.org/abs/2605.10189">ProteinOPD: Towards Effective and Efficient Preference Alignment for Protein Design</a>

Yulin Zhang, He Cao, Zihao Jiang, ***Chenyi Zi***, Zhipeng Zhou, Zijing Liu, Yu Li, Jia Li, Ziqi Gao

<span class="paper-links">[Paper](https://arxiv.org/abs/2605.10189)</span>

</div>
</div>

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">ICML · 2026</span>

<a class="paper-title" href="https://arxiv.org/abs/2605.09964">Learning the Interaction Prior for Protein-Protein Interaction Prediction: A Model-Agnostic Approach</a>

Ziqi Gao, ***Chenyi Zi***, Zijing Liu, Ziqiao Meng, Yu Li, Jia Li

<span class="paper-links">[Paper](https://arxiv.org/abs/2605.09964)</span>

</div>
</div>

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">Preprint · 2025</span>

<a class="paper-title" href="https://arxiv.org/abs/2508.20373">NPG-Muse: Scaling Long Chain-of-Thought Reasoning with NP-Hard Graph Problems</a>

Yuyao Wang, Bowen Liu, Jianheng Tang, Nuo Chen, Yuhan Li, Qifan Zhang, ***Chenyi Zi***, Chen Zhang, Jia Li

<span class="paper-links">[Paper](https://arxiv.org/abs/2508.20373) · [Code](https://github.com/littlewyy/NPG-Muse)</span>

</div>
</div>

<div class='paper-box paper-box--text-only'>
<div class='paper-box-text' markdown="1">

<span class="paper-venue">Preprint · 2025</span>

<a class="paper-title" href="https://arxiv.org/abs/2503.11086">A Survey of Cross-domain Graph Learning: Progress and Future Directions</a>

Haihong Zhao, Zhixun Li, ***Chenyi Zi***, Aochuan Chen, Fugee Tsung, Jia Li, Jeffrey Xu Yu

<span class="paper-links">[Paper](https://arxiv.org/abs/2503.11086) · [Collection](https://github.com/cshhzhao/Awesome-Cross-Domain-Graph-Learning)</span>

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NeurIPS 2024</div><img src='images/prog.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[ProG: A Graph Prompt Learning Benchmark](https://arxiv.org/abs/2406.05346)

***Chenyi Zi***^, Haihong Zhao^, Xiangguo Sun*, Yiqing Lin, Hong Cheng, Jia Li

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NeurIPS 2024</div><img src='images/unigad.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[UniGAD: Unifying Multi-level Graph Anomaly Detection](https://neurips.cc/virtual/2024/poster/93390#:~:text=To%20address%20this,%20we%20present%20UniGAD,%20the%20first%20unified%20framework)

Yiqing Lin, Jianheng Tang, ***Chenyi Zi***, H. Vicky Zhao, Yuan Yao, Jia Li*

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICLR 2024</div><img src='images/ICLR24.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Generative Adversarial Policy Network for Modelling Protein Complexes](https://openreview.net/forum?id=4MsfQ2H0lP&referrer=%5Bthe%20profile%20of%20Tao%20Feng%5D(%2Fprofile%3Fid%3D))

Tao Feng^, Ziqi Gao^, Jiaxuan You, ***Chenyi Zi***, Yan Zhou, Chen Zhang, Jia Li*

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">WWW 2024</div><img src='images/WWW24.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Weakly Supervised Anomaly Detection via Knowledge-Data Alignment](https://openreview.net/forum?id=EeyaKZtYFX&referrer=%5Bthe%20profile%20of%20Chenyi%20Zi%5D(%2Fprofile%3Fid%3D))

Haihong Zhao, ***Chenyi Zi***, Yang Liu, Chen Zhang, Yan Zhou, Jia Li*

</div>
</div>

# Honors and Awards
- *2023.02* &nbsp; **National Scholarship**
- *2023.01* &nbsp; Yue+ Scholarship by 37 [Interactive Entertainment](https://www.37entertainment.net/)
- *2022.04* &nbsp; Finalist Prize in the 2022 ICM/MCM
- *2022.02* &nbsp; First Prize in the Chinese Mathematics Competition
- *2022.01* &nbsp; Third Place in Huawei Cloud GaussDB Database Competition
- *2018.10* &nbsp; First Prize in National Olympiad in Mathematics in Provinces, Hunan, China

# Educations
- *2023.09 – Present* &nbsp; MPhil, HKUST(GZ)
- *2023.07 – 2023.09* &nbsp; Research Assistant, HKUST(GZ)
- *2019.09 – 2023.07* &nbsp; B.Eng. in Computer Science, South China University of Technology
