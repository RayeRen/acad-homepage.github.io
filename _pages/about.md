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

<div class="hero reveal">
  <p class="hero__eyebrow">Education Studies @ UCL</p>
  <h1 class="hero__title">Hi, I’m Lang Cheng <span class="wave" aria-hidden="true">👋</span></h1>
  <p class="hero__lead">I study how learning analytics, AI and immersive technologies can make learning more collaborative, motivating and equitable — and how they can better support teachers.</p>
  <ul class="interest-chips">
    <li>Learning Analytics</li>
    <li>Multimodal Learning Analytics</li>
    <li>AI in Education</li>
    <li>Human–Technology Interaction</li>
    <li>VR / AR in Education</li>
  </ul>
</div>

# About Me {#about-me}

Hi, I’m Lang Cheng, currently pursuing a BA in Education Studies at UCL. My research focuses on Learning Analytics, Multimodal Learning Analytics, AI in Education, and Human–Technology Interaction, with a particular interest in how immersive technologies and AI-driven tools can enhance collaboration, motivation, and equity in learning and helping teachers.

I have taken part in multiple international research projects. At The University of Hong Kong (HKU), I joined Professor Hu Xiao's group and contributed to studies on VR/AR-based learning analytics in both secondary and primary schools. My work involved guiding students to create VR stories, designing mixed-method studies, and conducting advanced data analysis (quantitative statistics, NLP-based text mining, and topic modeling). Some of these findings have already been presented at CSCL 2025 and JCDL 2025. I am also working on Epistemic Network Analysis (ENA) projects to explore how teachers use learning analytics platforms in practice. During my summer research at UCL’s **EPSURF**, I joined Professor Jessica Ringrose's group and took part in an interdisciplinary study on adolescent mobile-phone policies, leading the literature review and qualitative data analysis (including MCDA multimodal discourse analysis and topic modelling). I carried out a comparative analysis of student samples from two schools, revealing social-class differences in attitudes toward phone use and in perceptions of policy enforcement.

I continuously expand my technical foundation through advanced study programs, including Computational Social Science (X Academy Summer School) and Mathematics for Machine Learning (UCL Summer School). These programs equipped me with statistical, machine learning, and NLP methods that directly support my research in education.

Outside academia, I’m passionate about football ⚽, baseball ⚾, and basketball 🏀, which keep me energised, collaborative, and competitive both on and off the field.

# News {#news}

<ul class="timeline">
  <li class="reveal">
    <span class="timeline__date">2025.06</span>
    <div class="timeline__body">🎉 My academic poster, “<em>Comparing Collaboration Patterns in Virtual Reality Content Co-Creation Activities Between High- and Low-Performing Secondary School Students</em>” has been accepted for inclusion in the Proceedings of the International Conference on Computer-Supported Collaborative Learning (<strong>CSCL 2025</strong>)!</div>
  </li>
  <li class="reveal">
    <span class="timeline__date">2024.12</span>
    <div class="timeline__body">🎉 I’m excited to announce that our poster, “<em>Empowering Primary School Students to Create Virtual Reality Content: An Outreach Model for Digital Libraries</em>,” has been accepted for inclusion in the proceedings of the 24th ACM/IEEE Joint Conference on Digital Libraries (<strong>JCDL 2024</strong>) on December 16, 2024 (DOI: <a href="https://doi.org/10.1145/3677389.3702606">10.1145/3677389.3702606</a>). Co-authored by Ka Wai Lau, Xiao Hu, and myself (Lang Cheng), this work presents a novel outreach framework that enables young learners to author immersive VR experiences within digital library settings, and we look forward to sharing our findings with the community at JCDL.</div>
  </li>
</ul>

# Publications {#publications}

{% include publications.html %}

# Research Experience {#research}

<div class="research-card reveal" markdown="1">
<div class="research-card__head">
  <span class="org-badge">HKU</span>
  <h3 class="research-card__title">VR/AR learning analytics</h3>
</div>
<p class="research-card__role"><i class="fas fa-fw fa-user" aria-hidden="true"></i> Research team member — teaching implementation &amp; data analysis</p>
<p class="research-card__tagline">Facilitated student VR creation and combined interaction logs with reflective responses to investigate collaborative learning processes.</p>

During a research placement at HKU, I worked as part of a team delivering a VR-authoring curriculum to lower-secondary students. I taught students how to use a low-barrier, web-based VR creation tool (360° capture, scene editing, annotations, and cross-space linking), supported their technical needs, and guided a project-based assignment in which groups produced their own VR stories. We collected interaction logs from the platform, instructor ratings of the projects, a Likert-scale questionnaire on collaborative learning experience, and open-ended reflective responses about collaboration challenges and solutions.

On the analysis side, I combined robust survey statistics with a full NLP pipeline. Using JASP, I ran normality checks (Shapiro–Wilk), homogeneity tests (Levene), non-parametric comparisons (Mann–Whitney U), and Bayesian independent samples tests to compare collaboration experience across performance groups. In Python, I implemented systematic text preprocessing (NLTK-based tokenisation, lemmatisation, stopword removal), TF–IDF and n-gram extraction, and trials of both lexicon-based (VADER) and transformer-based (Twitter-RoBERTa) sentiment methods, evaluating them against a human-coded “gold standard” (accuracy, precision, recall, F1). Because the model performed poorly on neutral responses, I ultimately shifted to LDA topic modelling with coherence-based model selection and interactive pyLDAvis visualisations to surface thematic differences between high- and low-performing groups. One line of the work (text feature results) was presented as a CSCL 2025 poster, and the broader findings are part of a manuscript currently under review.

<details markdown="1">
<summary>Technical highlights &amp; ethics</summary>

- **Mixed-methods pipeline:** Integrated a structured collaboration-experience questionnaire with VR interaction logs, instructor ratings, and open-ended reflections to study group collaboration from multiple data sources.
- **Statistics & NLP workflow:** Used JASP for normality, non-parametric, and Bayesian tests; built a Python pipeline for rigorous preprocessing, TF–IDF and n-gram extraction, experiments with VADER and Twitter-RoBERTa sentiment, and coherence-guided LDA topic modelling with pyLDAvis visualisation.
- **Research validation:** Iteratively refined analytic choices with PhD mentors and lab members, compared model outputs against human-coded labels, and linked quantitative patterns back to original student reflections to support theoretically grounded interpretation.

<p class="research-card__ethics"><i class="fas fa-fw fa-shield-alt" aria-hidden="true"></i> All student data were anonymized and handled according to institutional ethics guidance; publicly shared materials include only aggregated or synthetic examples.</p>
</details>

<figure class="research-card__figure">
  <img src="https://github.com/user-attachments/assets/568cbf37-1451-4e04-b515-00d0b80bcf8a" width="1724" height="966" alt="Examples of data visualization during internship" loading="lazy">
  <figcaption>Examples of data visualization during internship</figcaption>
</figure>
</div>

<div class="research-card reveal" markdown="1">
<div class="research-card__head">
  <span class="org-badge">HKU</span>
  <h3 class="research-card__title">VR/AR learning experience (primary school, environmental theme)</h3>
</div>
<p class="research-card__role"><i class="fas fa-fw fa-user" aria-hidden="true"></i> Research team member — activity lead &amp; data analyst</p>
<p class="research-card__tagline">Designed and ran an educational VR day combining student creation and immersive viewing to explore effects on digital literacy and environmental attitudes.</p>

I helped organize a VR experience day at a primary school that combined hands-on VR creation with immersive VR viewing of environmental story content. Activities included step-by-step student guidance for capturing and editing VR spaces, facilitated group reflection interviews, and pre/post implementation surveys to capture perceived learning and interest. In addition to the classroom study, I analyzed platform event logs exported from our web tool. The log analysis informed usage patterns and user journeys, and the pre/post analyses supported interpretation of how the intervention related to students’ self-reported learning outcomes. Results were summarized and prepared as a conference poster.

<details markdown="1">
<summary>Technical highlights &amp; ethics</summary>

- **Platform log analytics:** end-to-end cleaning and time-indexing of event logs, event-type frequency analysis, and activity-pattern visualization to reveal usage patterns and common interaction flows.
- **Experimental evaluation:** pre/post questionnaire processing and paired comparisons to evaluate changes in self-reported digital literacy and topic understanding.
- **Dissemination:** synthesis of literature, methods, and results into a poster for academic dissemination.

<p class="research-card__ethics"><i class="fas fa-fw fa-shield-alt" aria-hidden="true"></i> Platform data were anonymized before analysis and reporting; classroom participation followed school consent procedures.</p>
</details>

<figure class="research-card__figure">
  <img src="https://github.com/user-attachments/assets/9b0aa347-f89c-42e9-a7b9-0233515e0334" width="2048" height="1155" alt="VR learning experience day at a primary school" loading="lazy">
</figure>
</div>

<div class="research-card reveal" markdown="1">
<div class="research-card__head">
  <span class="org-badge org-badge--ucl">UCL</span>
  <h3 class="research-card__title">Teen mobile phone policy research</h3>
</div>
<p class="research-card__role"><i class="fas fa-fw fa-user" aria-hidden="true"></i> Research assistant — literature synthesis &amp; multimodal qualitative analysis</p>
<p class="research-card__tagline">Organized cross-disciplinary discussion and used multimodal coding to examine children’s experiences and attitudes toward phone policies across social contexts.</p>

As part of a team exploring adolescent phone-use policies, I supported organization of interdisciplinary talks, led parts of the literature synthesis, and applied multimodal critical discourse methods to student-produced data (including drawings and interviews). I contributed to systematic coding and thematic analysis and supported comparative interpretation across schools. The analysis highlighted differences in phone use and policy perceptions that aligned with students’ social backgrounds, and the results fed into a broader policy-focused literature review.

<details markdown="1">
<summary>Technical highlights &amp; ethics</summary>

- **Research coordination:** supported academic discussion forums to connect perspectives across fields and synthesize implications for policy.
- **Multimodal analysis:** applied MCDA methods to combine visual and verbal student data into a coherent coding frame.
- **Comparative theme analysis:** produced a structured thematic map that highlighted differences in attitudes and practices across social groups.

<p class="research-card__ethics"><i class="fas fa-fw fa-shield-alt" aria-hidden="true"></i> All pupil contributions were collected under appropriate consent and anonymized prior to analysis.</p>
</details>
</div>

<div class="research-card reveal" markdown="1">
<div class="research-card__head">
  <span class="org-badge">HKU</span>
  <h3 class="research-card__title">ENA &amp; topic modeling</h3>
</div>
<p class="research-card__role"><i class="fas fa-fw fa-user" aria-hidden="true"></i> Data analyst — topic modeling &amp; ENA pipeline lead</p>
<p class="research-card__tagline">Turned free-text teacher feedback into topic-coded inputs for Epistemic Network Analysis to compare discourse networks across instructional phases.</p>

My current task is to transform a corpus of teacher feedback messages from a learning analytics tool into a format suitable for Epistemic Network Analysis (ENA). The workflow includes text cleaning and phrase detection, iterative LDA topic exploration with coherence-guided selection and manual interpretability checks, thresholding topic probabilities into co-occurrence indicators, and preparing ENA-ready unit tables. These units are then visualized in stage-wise ENA networks to compare how topic co-occurrence evolves across instructional phases.

<details markdown="1">
<summary>Technical highlights &amp; ethics</summary>

- **Topic modeling:** careful model selection using coherence metrics complemented by manual inspection to ensure interpretability.
- **ENA workflow:** conversion of probabilistic topic outputs into binary co-occurrence matrices and construction of ENA units for stage-wise network comparison.
- **Reproducibility:** end-to-end scripts for cleaning, phrase merging, topic probability mapping, and export to ENA-compatible tables.

<p class="research-card__ethics"><i class="fas fa-fw fa-shield-alt" aria-hidden="true"></i> Teacher messages are de-identified before analysis; ENA visualizations present only aggregate network structure without raw text.</p>
</details>
</div>

# Projects {#projects}

<p class="section-intro">Small tools and side projects I’ve built.</p>

{% include projects.html %}

# Honors and Awards {#honors-and-awards}

<ul class="timeline timeline--compact">
  <li class="reveal"><span class="timeline__date">2026.05</span><div class="timeline__body">🏆 IEEE TCLT Student Award</div></li>
  <li class="reveal"><span class="timeline__date">2025.07</span><div class="timeline__body">🎓 The Education, Practice and Society Undergraduate Research Fellowship (<strong>EPSURF</strong>)</div></li>
</ul>

# Education {#education}

<div class="edu-card reveal">
  <div class="edu-card__logo" aria-hidden="true">UCL</div>
  <div class="edu-card__body">
    <div class="edu-card__school">University College London</div>
    <div class="edu-card__degree">BA (Hons), <strong>Education Studies</strong></div>
  </div>
  <div class="edu-card__date">2023.09 – 2025.12 (now)</div>
</div>
