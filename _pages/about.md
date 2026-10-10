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

<h1 class="first">About Me</h1>

<p class="section-lead">I am a PhD student in Computer Science at the University of Texas at Arlington. My research focuses on computer vision and medical image super-resolution, aiming to enhance the quality and diagnostic value of MRI and CT images through deep learning. I am currently working on developing advanced reconstruction models for cardiac MRI.</p>

I enjoy tackling interdisciplinary challenges that bridge artificial intelligence and healthcare, with the goal of translating computational innovations into practical clinical tools. Outside of research, I'm an ENFP who values creativity and collaboration. In my free time, I enjoy playing basketball and badminton, which keep me energized and balanced.

<ul class="chips" aria-label="Research interests">
  <li>Medical Image Super-Resolution</li>
  <li>Cardiac MRI Reconstruction</li>
  <li>Deep Learning</li>
  <li>Computer Vision</li>
</ul>

<div class="callout">
  <i class="fas fa-briefcase" aria-hidden="true"></i>
  <p><strong>I am actively seeking internship opportunities</strong> in medical imaging, computer vision, and deep learning. If you think I could be a good fit for your team, please feel free to <a href="mailto:{{ site.author.email }}">reach out by email</a>.</p>
</div>

<span class='anchor' id='news'></span>

# News

<div class="timeline" markdown="1">

- *2026.08* Two papers accepted at **STACOM 2026** (MICCAI Workshop)! 🎉
- *2026.01* Serving as Teaching Assistant for CSE 4308 (Artificial Intelligence), Section 004
- *2025.08* Serving as Teaching Assistant for CSE 4310 (Fundamentals of Computer Vision)
- *2025.08* Started PhD in Computer Science at University of Texas at Arlington

</div>

<span class='anchor' id='publications'></span>

# Publications

<div class="pub-list" markdown="0">

<div class="pub">
  <div class="pub__badges">
    <span class="pub__venue">STACOM @ MICCAI 2026</span>
    <span class="pub__tag">Oral</span>
  </div>
  <h3 class="pub__title">Bi-PT: Bidirectional Cross-Attention Point Transformers for Four-Chamber Heart Reconstruction from Sparse Cardiac MRI Data</h3>
  <p class="pub__authors">Chenchuhui Hu, <span class="me">Shaoming Pan</span>, Leon Axel, Meng Ye</p>
  <p class="pub__venue-full">MICCAI 2026 Workshop on Statistical Atlases and Computational Models of the Heart (STACOM)</p>
  <div class="pub__links">
    <a href="https://arxiv.org/abs/2607.06923"><i class="ai ai-arxiv"></i>arXiv</a>
    <a href="https://arxiv.org/pdf/2607.06923"><i class="fas fa-file-pdf"></i>PDF</a>
    <a href="https://github.com/Chenchuhui/Bi-PT"><i class="fab fa-github"></i>Code</a>
  </div>
</div>

<div class="pub">
  <div class="pub__badges">
    <span class="pub__venue">STACOM @ MICCAI 2026</span>
  </div>
  <h3 class="pub__title">Cardiac MRI Through-Plane Super-Resolution Guided by Reference and Memory</h3>
  <p class="pub__authors"><span class="me">Shaoming Pan</span>, Chenchuhui Hu, Leon Axel, Meng Ye</p>
  <p class="pub__venue-full">MICCAI 2026 Workshop on Statistical Atlases and Computational Models of the Heart (STACOM)</p>
  <div class="pub__links">
    <a href="https://arxiv.org/abs/2607.07581"><i class="ai ai-arxiv"></i>arXiv</a>
    <a href="https://arxiv.org/pdf/2607.07581"><i class="fas fa-file-pdf"></i>PDF</a>
    <a href="https://github.com/030108ming/STRMSR"><i class="fab fa-github"></i>Code</a>
  </div>
</div>

</div>

<span class='anchor' id='honors'></span>

# Honors and Awards

<div class="timeline" markdown="1">

- *2024.05* Second Prize, RoboCup China 2024
- *2023.07* Second Prize, RoboCup China 2023
- *2022.11* Second Prize, RoboCup China 2022

</div>

<span class='anchor' id='education'></span>

# Education

<div class="timeline" markdown="1">

- *2025.08 – present* **PhD in Computer Science**, University of Texas at Arlington
- *2021.09 – 2025.06* **B.E. in Biomedical Engineering**, Shanghai Jiao Tong University

</div>

<span class='anchor' id='experience'></span>

# Experience

<div class="timeline" markdown="1">

- *2025.08 – present* **Teaching Assistant**, CSE 4310: Fundamentals of Computer Vision, University of Texas at Arlington
- *2025.08 – present* **Non-Teaching Volunteer**, Department of Radiology, NYU Grossman School of Medicine (Supervisor: Prof. Leon Axel)
- *2026.01 – 2026.05* **Teaching Assistant**, CSE 4308: Artificial Intelligence (Section 004), University of Texas at Arlington

</div>
