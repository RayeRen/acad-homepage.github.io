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

{% assign global_link_color = "#4c7273" %}

<span class='anchor' id='about-me'></span>
I am currently a PhD student in Computer Science at <a href="https://www.tcd.ie/scss/" style="color: {{ global_link_color }}; text-decoration: none;">Trinity College Dublin</a> under the supervision of <a href="https://sonhua.github.io" style="color: {{ global_link_color }}; text-decoration: none;">Prof. Binh-Son Hua</a>. Previously, I was a Research Resident at <a href="https://www.qualcomm.com/research/artificial-intelligence/ai-residency-program" style="color: {{ global_link_color }}; text-decoration: none;">Qualcomm AI Research</a>. I received my Bachelor’s degree in Computer Science (APCS) from the <a href="https://en.hcmus.edu.vn" style="color: {{ global_link_color }}; text-decoration: none;">University of Science, Vietnam National University Ho Chi Minh City</a>.

My research interests focus on artificial intelligence, computer vision and computer graphics, with a particular emphasis on <strong>3D understanding</strong> and <strong>3D/4D generative modeling</strong>. I am interested in building models that can perceive, represent, and generate dynamic 3D worlds.


# <i class="fas fa-bell"></i> News
<div class="news-scroll">
  <div class="news-item">
    <span class="news-date">2026.10</span>
    <p class="news-text">One paper accepted to <strong>WACV 2027</strong> 🎉</p>
  </div>
  <div class="news-item">
    <span class="news-date">2026.09</span>
    <p class="news-text">One paper accepted to <strong>Pacific Graphics 2026</strong> 🎉</p>
  </div>
  <div class="news-item">
    <span class="news-date">2026.08</span>
    <p class="news-text">Moved to <strong>Dublin, Ireland</strong> 🇮🇪 to pursue a PhD in Computer Science at <strong>Trinity College Dublin</strong>, focusing on dynamic 3D reconstruction.</p>
  </div>
  <div class="news-item">
    <span class="news-date">2025.02</span>
    <p class="news-text">Transitioned to <strong>Qualcomm AI Research</strong> as a Research Resident, focusing on open-vocabulary 3D understanding and physically grounded generative models.</p>
  </div>
  <div class="news-item">
    <span class="news-date">2023.10</span>
    <p class="news-text">Won the <strong>Vietnam Female Students in Science and Technology Award</strong> 🇻🇳.</p>
  </div>
  <div class="news-item">
    <span class="news-date">2023.08</span>
    <p class="news-text">Joined <strong>VinAI Research</strong> as a Research Resident, working on 3D/4D modeling and neural scene representations.</p>
  </div>
</div>

# <i class="fas fa-file-alt"></i> Publications 

<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/cvpr26.gif' alt="WACV 2027" width="100%" style="display:block;"></div></div>
<div class='paper-box-text' markdown="1">

## Prepare Lighter and Faster for Open-Vocabulary Queries: A Query-Wise 3D Segmenter for Gaussian Splatting

**Nhat-Quynh Le-Pham**, <a href="https://www.khoinguyen.org" style="color: inherit; text-decoration: none;">Khoi Nguyen</a>, <a href="https://sonhua.github.io" style="color: inherit; text-decoration: none;">Binh-Son Hua</a>

<span class="paper-venue">WACV 2027</span>

</div>
</div>
<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/truncgradgs.png' alt="TruncGradGS" width="100%" style="display:block;"></div></div>
<div class='paper-box-text' markdown="1">

## TruncGradGS: Improved 3D Gaussian Splatting via Truncated Gradient Updates

<a href="https://www.theomorales.com" style="color: inherit; text-decoration: none;">Theo Morales</a>, **Nhat-Quynh Le-Pham**, <a href="https://scholar.google.com/citations?user=qs0D_UUAAAAJ&hl=en" style="color: inherit; text-decoration: none;">Robin Atkins</a>, <a href="https://sonhua.github.io" style="color: inherit; text-decoration: none;">Binh-Son Hua</a>

<span class="paper-venue">Pacific Graphics 2026</span>

<span class="paper-links"><a href="https://arxiv.org/abs/2609.03534">Paper</a><span class="sep" aria-hidden="true">·</span><a href="https://dubiouscactus.github.io/trunc-grad-gs/">Project</a><span class="sep" aria-hidden="true">·</span><a href="https://github.com/trinity-graphics/truncgradgs">Code</a></span>

</div>
</div>
<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/thesis.gif' alt="Bachelor Thesis" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

## Text-to-4D Content Creation using Image Priors and Monocular Driver Videos

**Nhat-Quynh Le-Pham**

<span class="paper-venue">Bachelor Thesis (Highest Distinction)</span>

<span class="paper-links"><a href="https://drive.google.com/file/d/1ihvTYUEt8lxXPgZGXERvWtlCSeLXX2L9/view?usp=sharing">Thesis</a><span class="sep" aria-hidden="true">·</span><a href="https://drive.google.com/file/d/15mE_6cMyK4Be8br0dkMol-sspreohjNZ/view?usp=sharing">Video</a></span>

</div>
</div>
<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/sketchanimar.png' alt="SketchANIMAR" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

## SketchANIMAR: Sketch-Based 3D Animal Fine-Grained Retrieval

Trong-Vu Hoang, <a href="https://nqbinhcs.github.io" style="color: inherit; text-decoration: none;">Quang-Binh Nguyen</a>, **Nhat-Quynh Le-Pham**, Huu-Phuc Pham, Hai-Dang Nguyen

<span class="paper-venue">3DOR’23 · Computers & Graphics Journal</span>

<span class="paper-links"><a href="https://arxiv.org/abs/2304.05731">Paper</a><span class="sep" aria-hidden="true">·</span><a href="https://drive.google.com/file/d/1wVQeink44cxzLrh4JH1ZSwTgcAwcN-5V/view">Working Notes</a><span class="sep" aria-hidden="true">·</span><a href="https://github.com/htrvu/SHREC2023-ANIMAR">Code</a></span>

</div>
</div>
<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/textanimar.png' alt="TextANIMAR" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

## TextANIMAR: Text-Based 3D Animal Fine-Grained Retrieval

**Nhat-Quynh Le-Pham**, Huu-Phuc Pham, Trong-Vu Hoang, <a href="https://nqbinhcs.github.io" style="color: inherit; text-decoration: none;">Quang-Binh Nguyen</a>, Hai-Dang Nguyen

<span class="paper-venue">3DOR’23 · Computers & Graphics Journal</span>

<span class="paper-links"><a href="https://arxiv.org/abs/2304.06053">Paper</a><span class="sep" aria-hidden="true">·</span><a href="https://drive.google.com/file/d/14Rp4Tti5X0z6yvxfBQq-XxyKLU2BrgV7/view">Working Notes</a><span class="sep" aria-hidden="true">·</span><a href="https://github.com/htrvu/SHREC2023-ANIMAR">Code</a></span>

</div>
</div>
<div class='paper-box'><div class='paper-box-image'><div><img src='assets/files/shrec22.png' alt="SHREC 2022" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

## SHREC 2022: Fitting and recognition of simple geometric primitives on point clouds

**Nhat-Quynh Le-Pham**\*, Dinh-Khoi Vo\*, Tuan-An To\*, Nham-Tan Nguyen\*, Hai-Dang Nguyen, Minh-Triet Tran

<span class="paper-venue">3DOR’22 · Computers & Graphics Journal</span>

<span class="paper-links"><a href="https://arxiv.org/abs/2206.07636">Paper</a><span class="sep" aria-hidden="true">·</span><a href="https://github.com/frankielp/SHREC2022-Fitting-and-recognition-of-simple-geometric-primitives-on-point-clouds">Code</a></span>

</div>
</div>

<span class='anchor' id='-patents'></span>
# <i class="fas fa-certificate"></i> Patents

- Query-based Open-vocabulary 3D object segmentation from Gaussian Splats, **Nhat-Quynh Le-Pham**, <a href="https://www.khoinguyen.org" style="color: inherit; text-decoration: none;">Khoi Nguyen</a>, <a href="https://sonhua.github.io" style="color: inherit; text-decoration: none;">Binh-Son Hua</a>, **US Patent**

# <i class="fas fa-briefcase"></i> Experience
- <span class="news-date">2025.04 – 2026.02</span> Research Resident at <a href="https://www.qualcomm.com/research/artificial-intelligence/ai-residency-program" style="color: {{ global_link_color }}; text-decoration: none;">Qualcomm AI Research</a>
- <span class="news-date">2023.08 – 2025.04</span> Research Resident at <a href="https://www.vinai.io" style="color: {{ global_link_color }}; text-decoration: none;">VinAI Research</a>.
- <span class="news-date">2021.06 – 2021.12</span> Data Scientist Intern at <a href="https://mti-vietnam.vn" style="color: {{ global_link_color }}; text-decoration: none;">AI Lab, MTI Technology</a>.

# <i class="fas fa-award"></i> Honors and Awards
- <span class="news-date">2023.10</span> Awarded the **Vietnam Female Students in Science and Technology Award**.
- <span class="news-date">2023.03</span> Received the **Top GPA Scholarship** from the Faculty of Information Technology, University of Science (Top 1%).
- <span class="news-date">2023.03</span> **1st Place**, SHREC 2023 — Sketch-Based 3D Animal Fine-Grained Retrieval (3DOR’23).
- <span class="news-date">2023.03</span> **1st Place**, SHREC 2023 — Text-Based 3D Animal Fine-Grained Retrieval (3DOR’23).
- <span class="news-date">2022.02</span> **3rd Place**, SHREC 2022 — Fitting and Recognition of Geometric Primitives (3DOR’22).
- <span class="news-date">2021.12</span> **Finalist**, Ho Chi Minh City AI Challenge.

# <i class="fas fa-users"></i> Professional Services
- Reviewers: CVPRW 2025, ICCV 2025, ICLR 2026.

<!-- # 📖 Educations
- *2019.06 - 2022.04 (now)*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2015.09 - 2019.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 

<!-- # 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->