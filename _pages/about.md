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

I am a third-year PhD student (2023-) in the Department of Computer Science at University of Illinois at Chicago (UIC), supervised by Prof. [Yan Yan](https://tomyan555.github.io/). Prior to joining UIC, I spent a year at Illinois Institute of Technology. I hold both a bachelor's and a master's degree from Shanghai Jiao Tong University, where I was fortune to be advised by Prof. [Junchi Yan](https://thinklab.sjtu.edu.cn/). Additionally, I had a wonderful time working as a research intern with Prof. [Anqi Liu](https://anqiliu-ai.github.io/) and Prof. [Anima Anandkumar](http://tensorlab.cms.caltech.edu/users/anima/) at Caltech.

My research interests include Machine Learning Efficiency, 3D Vision and Robotics. Most of the publications can be accessed [here](https://scholar.google.com/citations?user=vRXYQvYAAAAJ&hl=en).


# 🔥 News
- *2025.09*: &nbsp; 3 co-authored papers accepted to NeurIPS 2025
- *2025.06*: &nbsp; 2 papers accepted to ICCV 2025
- *2025.05*: &nbsp; Working as a research intern at Cisco Research
- *2025.03*: &nbsp; 1 paper accepted to CVPR 2025
- *2024.11*: &nbsp; Serving as the web co-chair for ICMR 2025
- *2024.06*: &nbsp; 1 paper accepted to NeurIPS 2024

# 📝 Selected Publications 

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICCV 2025</div><img src='images/quest.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[QuEST: Low-bit Diffusion Model Quantization via Efficient Selective Finetuning](https://arxiv.org/abs/2402.03666) <strong><span class='show_paper_citations' data='vRXYQvYAAAAJ:2osOgNQ5qMEC'></span></strong>

**Haoxuan Wang**, Yuzhang Shang, Zhihang Yuan, Junyi Wu, Junchi Yan, Yan Yan

[**Code**](https://github.com/hatchetProject/QuEST)  [![GitHub Repo stars](https://img.shields.io/github/stars/hatchetProject/QuEST)](https://github.com/hatchetProject/QuEST)

- Parameter efficient finetuning method for diffusion model quantization. 
</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICCV 2025</div><img src='images/cao2.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[CaO$_2$: Rectifying Inconsistencies in Diffusion-Based Dataset Distillation](https://arxiv.org/abs/2506.22637v1) <strong><span class='show_paper_citations' data='vRXYQvYAAAAJ:2osOgNQ5qMEC'></span></strong>

**Haoxuan Wang**, Zhenghao Zhao, Junyi Wu, Yuzhang Shang, Gaowen Liu, Yan Yan

[**Code**](https://github.com/hatchetProject/CaO2)  [![GitHub Repo stars](https://img.shields.io/github/stars/hatchetProject/CaO2)](https://github.com/hatchetProject/CaO2)

- Diffusion based method for efficient dataset distillation. 
</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2025</div><img src='images/ltdd.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Distilling Long-tailed Datasets](https://arxiv.org/pdf/2408.14506)

Zhenghao Zhao\*, **Haoxuan Wang\***, Yuzhang Shang, Kai Wang, Yan Yan

[**Code**](https://github.com/ichbill/LTDD)
- Pioneering work confronting biased dataset distillation. 
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NeurIPS 2024</div><img src='images/ptq4dit.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[PTQ4DiT: Post-training Quantization for Diffusion Transformers](https://arxiv.org/abs/2405.16005) 

Junyi Wu\*, **Haoxuan Wang\***, Yuzhang Shang, Mubarak Shah, Yan Yan

[**Code**](https://github.com/adreamwu/PTQ4DiT) [![GitHub Repo stars](https://img.shields.io/github/stars/adreamwu/PTQ4DIT)](https://github.com/adreamwu/PTQ4DiT)
- Pioneering work for DiT quantization. 
</div>
</div>


<div class='paper-box'><div class='paper-box-image'><div><div class="badge">IJCAI 2023</div><img src='images/drst.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Learning Calibrated Uncertainties for Domain Shift: A Distributionally Robust Learning Approach](https://arxiv.org/pdf/2010.05784)

**Haoxuan Wang**, Zhiding Yu, Yisong Yue, Animashree Anandkumar, Anqi Liu and Junchi Yan

[**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=en&user=vRXYQvYAAAAJ&citation_for_view=vRXYQvYAAAAJ:u-x6o8ySG0sC)
- A novel framework for learning calibrated uncertainties under domain shifts.
</div>
</div>

[NeurIPS 2025 (spotlight)] [X-Field: A Physically Grounded Representation for 3D X-ray Reconstruction](https://arxiv.org/abs/2503.08596), Feiran Wang\*, Jiachen Tao\*, Junyi Wu\*, **Haoxuan Wang**, Bin Duan, Kai Wang, Zongxin Yang, Yan Yan

[NeurIPS 2025] [Efficient Multimodal Dataset Distillation via Generative Models](https://www.arxiv.org/abs/2509.15472), Zhenghao Zhao, **Haoxuan Wang**, Junyi Wu, Yuzhang Shang, Gaowen Liu, Yan Yan

[NeurIPS 2025] [Orientation-anchored Hyper-Gaussian for 4D Reconstruction from Casual Videos](https://www.arxiv.org/pdf/2509.23492) Junyi Wu, Jiachen Tao, Haoxuan Wang, Gaowen Liu, Ramana Rao Kompella, Yan Yan

[Leveraging Angular Information Between Feature and Classifier for Long-tailed Learning: A Prediction Reformulation Approach](https://arxiv.org/pdf/2212.01565), **Haoxuan Wang**, Junchi Yan


# 🎖 Honors and Awards
- *2021-22* First Award of SJTU scholarship
- *2020.06* Graduation with honor, University Graduate Excellence Award of SJTU
- *2019.11* First Award of Zhiyuan Research Program

# 📖 Educations
- *2024.12 - current*&nbsp; PhD, University of Illinois at Chicago.
- *2023.09 - 2024.12*&nbsp; PhD, Illinois Institute of Technology.
- *2020.09 - 2023.03*&nbsp; Master, Shanghai Jiao Tong University.
- *2016.09 - 2020.06*&nbsp; Undergraduate, [IEEE Honor Class](https://english.seiee.sjtu.edu.cn/english/info/8338.htm), Shanghai Jiao Tong University.

<!--# 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->

<!--# 💻 Internships
- *2019.05 - 2019.10*, Noah's Ark, China. -->
