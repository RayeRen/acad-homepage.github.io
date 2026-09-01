---
layout: default
permalink: /projects/
title: "Projects"
excerpt: "A collection of my research and professional projects."
author_profile: true
---

<div class="cw-hero">
  <span class="cw-eyebrow">PROJECTS</span>
  <h1>Projects that turn data into <em>decisions</em></h1>
  <p class="cw-sub">Quantitative research and applied ML across markets, finance, and social impact — the same focus areas from my analyst work, built out here as full, reproducible projects with real results.</p>
  <div class="cw-stats">
    <div class="cw-stat"><b>6</b><span>PROJECTS</span></div>
    <div class="cw-stat"><b>4</b><span>DOMAINS</span></div>
    <div class="cw-stat"><b>6</b><span>GITHUB REPOS</span></div>
  </div>
</div>

<div class="cw-project-section">

<div class="cw-toolbar" data-role="project-filter">
  <div class="cw-search-wrap">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input class="cw-search" type="text" placeholder="Search projects or tech stack…">
  </div>
  <div class="cw-chips">
    <button type="button" class="cw-chip is-active" data-tag="all">All</button>
    <button type="button" class="cw-chip" data-tag="quant">Quant &amp; Finance</button>
    <button type="button" class="cw-chip" data-tag="ml">Machine Learning</button>
    <button type="button" class="cw-chip" data-tag="causal">Causal Inference</button>
    <button type="button" class="cw-chip" data-tag="other">Web &amp; Design</button>
  </div>
</div>

<div class="cw-result-count" data-template="Showing {n} of {total} projects" aria-live="polite"></div>

<!-- Project 0: Exponential Smoothing FX Trend Strategy -->
<div class="project-card project-card--featured" id="card-project_fx" data-tags="quant" data-details-id="project_fx">
  <img src="{{ site.baseurl }}/images/project_fx.jpg" alt="FX Project Image" class="project-image">
  
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-chart-line"></i> ★ Featured · 01 · QUANT &amp; FINANCE</div>
    <div class="project-title">FX Trend Strategy using Exponential Smoothing</div>
    <p class="project-description">
      A fully reproducible quantitative research project analyzing USD/CAD trend persistence using dual exponential smoothing filters. 
      I built a complete forecasting and trading pipeline: signal engineering, α–β parameter tuning, long/short asymmetry testing, 
      buffer and deceleration exit experiments, backtesting, Sharpe evaluation, and trade-level accuracy modeling.  
      This project demonstrates my capabilities in <strong>quantitative analysis, data science workflow design, 
      mathematical modeling, statistical reasoning, and technical communication</strong>.
    </p>

    <div class="metric-chart">
      <div class="metric-chart-row">
        <span class="metric-chart-label">Before</span>
        <div class="metric-chart-track"><div class="metric-chart-bar" style="width:58%"></div></div>
        <span class="metric-chart-value">0.26</span>
      </div>
      <div class="metric-chart-row">
        <span class="metric-chart-label">After</span>
        <div class="metric-chart-track"><div class="metric-chart-bar metric-chart-bar--accent" style="width:100%"></div></div>
        <span class="metric-chart-value">0.45</span>
      </div>
      <div class="metric-chart-caption">Sharpe ratio, dual-ES crossover strategy</div>
    </div>

    <button class="details-btn" onclick="toggleDetails('project_fx')">View Details</button>
  </div>
</div>

<!-- Hidden Details for FX Project -->
<div id="project_fx" class="project-details">

  <!-- 🎯 Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> Most simple FX trend-following rules look good in toy backtests but fall apart once you
    change parameters, markets, or exit rules. I wanted to design a <em>robust, parameterized</em> exponential smoothing
    system and understand exactly when a “dual-ES crossover” strategy actually adds value versus noise.
  </div>
  
  <!-- 🔥 Summary Section -->
  <div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Build a trend-following FX trading system for USD/CAD using dual exponential smoothing filters (ESα, ESβ) and evaluate long/short symmetry, parameter sensitivity, and exit logic.</p>

    <p><strong>Methodology:</strong> Designed full pipeline including parameter grid search, regime-specific performance evaluation, trade-level accuracy analysis, and experiments on buffer thresholds and deceleration-based exits.</p>

    <ul>
      <li>Dual ES crossover signals with α < β</li>
      <li>Trade-level performance aggregation (not just daily returns)</li>
      <li>Long-only vs short-only optimization</li>
      <li>Buffer & deceleration exit experiments</li>
    </ul>

    <p><strong>Key Results:</strong></p>
    <ul>
      <li>Optimal parameters: <code>α = 0.20</code>, <code>β = 0.60</code></li>
      <li>Sharpe ratio improves <strong>0.26 → 0.45</strong></li>
      <li>Trade-level accuracy ≈ <strong>73%</strong></li>
      <li>Distance buffer & deceleration exit <strong>reduce performance</strong></li>
    </ul>

    <p style="font-style:italic; color:#444;">See full technical report below.</p>
  </div>

  <!-- 🔽 PDF Preview -->
  <iframe class="preview-frame" src="https://drive.google.com/file/d/1waRGZB_vFinXPfDzRqbshjq4p5y41fQI/preview"></iframe>

  <!-- 🔗 Buttons -->
  <div class="button-row">
    <a href="https://github.com/ChengWu-Data/Exponential-Smoothing-Trend-Strategy-with-Parameter-Tuning-Exit-Rules" 
       class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
    <a href="https://drive.google.com/file/d/1waRGZB_vFinXPfDzRqbshjq4p5y41fQI/view?usp=sharing" 
       class="html-btn" target="_blank">
      <i class="fa-solid fa-file-pdf"></i> View Report
    </a>
  </div>

</div>

<!-- Project 5: MultiDocRAG -->
<div class="project-card" id="card-project_multidoc" data-tags="ml" data-details-id="project_multidoc">
  <img src="{{ site.baseurl }}/images/MultiDocRAG_cover.jpg" alt="MultiDocRAG Cover Image" class="project-image">
  
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-robot"></i> 02 · MACHINE LEARNING</div>
    <div class="project-title">MultiDocRAG</div>
    <p class="project-description">
      A full-stack retrieval-augmented generation (RAG) system designed to perform 
      <strong>multi-document reasoning</strong> across uploaded PDFs. The system supports 
      scalable document ingestion, semantic chunking, vector search retrieval, 
      transparent evidence inspection, and automated evaluation. 
      This project demonstrates my ability to integrate <strong>LLM engineering, 
      applied machine learning, data pipeline design, evaluation methodology,
      and end-to-end product prototyping</strong>.
    </p>

    <div class="project-stats">
      <span class="stat-chip">27-Q eval benchmark</span>
      <span class="stat-chip">Live demo on HF Spaces</span>
    </div>

    <button class="details-btn" onclick="toggleDetails('project_multidoc')">View Details</button>
  </div>
</div>

<!-- Hidden Details for MultiDocRAG Project -->
<div id="project_multidoc" class="project-details">

  <!-- 🎯 Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> Traditional RAG pipelines work well for <em>single-document</em> lookup, 
    but real-world analysis often requires <strong>synthesizing information across multiple sources</strong>. 
    MultiDocRAG addresses this challenge by building a retrieval and reasoning pipeline capable of 
    cross-document evidence comparison, grounded generation, and systematic evaluation.
  </div>

  <!-- 🔥 Summary Section -->
  <div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Build an AI assistant that can perform <strong>cross-document synthesis</strong> 
    and answer questions using grounded, evidence-retrieved context from multiple PDFs.</p>

    <p><strong>System Design:</strong> Implemented an end-to-end pipeline including:</p>
    <ul>
      <li>Multi-PDF ingestion and cleaning</li>
      <li>Sliding-window chunking with semantic overlap</li>
      <li>Embedding generation via Sentence-Transformers</li>
      <li>FAISS vector search retrieval with score transparency</li>
      <li>LLM reasoning layer with contextual grounding + controlled refusals</li>
      <li>Automated evaluation framework across correctness, groundedness, and refusal safety</li>
      <li>Streamlit demo UI with prompt inspection and retrieval visibility</li>
    </ul>

    <p><strong>Applications:</strong></p>
    <ul>
      <li>Cross-document analytics for research & reporting</li>
      <li>Policy / business intelligence synthesis across multiple PDFs</li>
      <li>Technical documentation QA and comparison</li>
      <li>Automated literature review</li>
    </ul>

    <p><strong>What This Shows About My Skillset:</strong></p>
    <ul>
      <li>Ability to design end-to-end ML/LLM systems</li>
      <li>Strength in data engineering workflow (cleaning → chunking → indexing → retrieval)</li>
      <li>Evaluation methodology formulation and metric-driven iteration</li>
      <li>Full-stack prototyping (backend + model + frontend UI)</li>
      <li>Clear communication of system design and reasoning behavior</li>
    </ul>

    <p><strong>Current Progress:</strong></p>
    <ul>
      <li>Core ingestion, chunking, and vector retrieval implemented</li>
      <li>LLM reasoning module integrated with memory + grounded prompting</li>
      <li>Automated evaluation pipeline complete (27-question benchmark)</li>
      <li>Live demo deployed via HuggingFace Spaces</li>
      <li>Full report available</li>
    </ul>

    <p style="font-style:italic; color:#444;">This project is actively evolving as I benchmark, refine prompts, evaluate failure modes, and introduce reranking & improved LLM backends.</p>
  </div>

  <!-- 🔗 Buttons -->
  <div class="button-row">
    <a href="https://github.com/ChengWu-Data/MultiDocRAG" 
       class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>

    <a href="https://chengwu1210-multidocrag.hf.space/" 
       class="html-btn" target="_blank">
      <i class="fa-solid fa-globe"></i> Demo
    </a>

    <a href="https://drive.google.com/file/d/1cJG3CEvquydOJhJv0aWaZ4-eonIwfNJi/view?usp=sharing" 
       class="html-btn" target="_blank">
      <i class="fa-solid fa-file-code"></i> Report
    </a>
  </div>

</div>

<!-- Project: Iris Recognition System -->
<div class="project-card" id="card-project_iris" data-tags="ml" data-details-id="project_iris">
  <img src="{{ site.baseurl }}/images/iris_recognition_cover.jpg" alt="Iris Recognition System Cover Image" class="project-image">
  
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-robot"></i> 03 · MACHINE LEARNING</div>
    <div class="project-title">Iris Recognition System</div>
    <p class="project-description">
      A full computer vision and pattern recognition pipeline for <strong>iris-based biometric identification</strong>, 
      implemented as a <strong>Columbia University course project</strong> based on Ma et al. (2003). 
      I built and refined an end-to-end system including iris localization, normalization, image enhancement, 
      handcrafted feature extraction, PCA + Fisher Linear Discriminant matching, and verification/identification evaluation. 
      This project demonstrates my ability in <strong>computer vision, machine learning system design, mathematical modeling, 
      experimental debugging, evaluation methodology, and technical implementation</strong>.
    </p>

    <div class="metric-chart">
      <div class="metric-chart-row">
        <span class="metric-chart-label">Original</span>
        <div class="metric-chart-track"><div class="metric-chart-bar" style="width:85%"></div></div>
        <span class="metric-chart-value">73.4%</span>
      </div>
      <div class="metric-chart-row">
        <span class="metric-chart-label">Reduced</span>
        <div class="metric-chart-track"><div class="metric-chart-bar metric-chart-bar--accent" style="width:100%"></div></div>
        <span class="metric-chart-value">86.1%</span>
      </div>
      <div class="metric-chart-caption">Cosine-distance CRR, original vs. PCA+FLD reduced space</div>
    </div>

    <button class="details-btn" onclick="toggleDetails('project_iris')">View Details</button>
  </div>
</div>

<!-- Hidden Details for Iris Recognition Project -->
<div id="project_iris" class="project-details">

  <!-- Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> Iris recognition requires much more than just classification. Raw eye images must first be 
    localized, geometrically normalized, enhanced, converted into discriminative texture features, and then matched under 
    rotation and illumination variation. I wanted to implement a full pipeline based on a classic paper and understand 
    which design choices actually drive recognition performance.
  </div>

  <!-- Summary Section -->
  <div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Reproduce and refine a complete iris recognition system based on <strong>Ma et al. (2003)</strong>, using the <strong>CASIA-IrisV1</strong> dataset under a fixed training/testing protocol.</p>

    <p><strong>System Design:</strong> Implemented an end-to-end modular pipeline including:</p>
    <ul>
      <li>Iris localization using projection minima, thresholding, contour analysis, and Hough circle detection</li>
      <li>Non-concentric rubber-sheet normalization into a fixed-size rectangular iris representation</li>
      <li>Image enhancement through background illumination correction and local histogram equalization</li>
      <li>Handcrafted texture feature extraction using two circularly symmetric spatial filters</li>
      <li>Block-wise statistical encoding (Mean + Average Absolute Deviation) into a 1536-dimensional feature vector</li>
      <li>PCA + Fisher Linear Discriminant (FLD) for dimensionality reduction</li>
      <li>Nearest-center / multi-template matching with L1, L2, and cosine distance metrics</li>
      <li>Performance evaluation through CRR and verification ROC curves</li>
    </ul>

    <p><strong>What problem I solved:</strong></p>
    <ul>
      <li>Turned raw grayscale eye images into a reproducible recognition pipeline rather than a single classifier</li>
      <li>Handled geometric variation through normalization and rotation-aware template matching</li>
      <li>Reduced sensitivity to illumination and local noise through enhancement and block-level feature design</li>
      <li>Improved performance through iterative debugging of ROI selection, matching strategy, and evaluation protocol alignment</li>
    </ul>

    <p><strong>Key Results:</strong></p>
    <ul>
      <li><strong>Original Space CRR:</strong> L1 = 73.38%, L2 = 71.99%, Cosine = 73.38%</li>
      <li><strong>Reduced Space CRR:</strong> L1 = 80.79%, L2 = 81.25%, Cosine = 86.11%</li>
      <li><strong>Verification ROC AUC:</strong> L1 = 0.9476, L2 = 0.9555, Cosine = 0.9912</li>
      <li>Reduced-space matching substantially outperformed original-space matching</li>
      <li>Cosine distance produced the strongest final identification and verification performance</li>
    </ul>

    <p><strong>What this shows about my skillset:</strong></p>
    <ul>
      <li>Ability to implement a full ML / CV pipeline from raw data to final evaluation</li>
      <li>Strong debugging and iteration skills guided by metrics rather than guesswork</li>
      <li>Experience translating research-paper methodology into working code</li>
      <li>Comfort with classical machine learning, feature engineering, and experimental analysis</li>
      <li>Ability to structure technical projects in a modular, reproducible way</li>
    </ul>

    <p style="font-style:italic; color:#444;">
      This project was completed as a Columbia University course project and reflects both technical implementation and iterative performance improvement under a fixed experimental protocol.
    </p>
  </div>

  <!-- Buttons -->
  <div class="button-row">
    <a href="https://github.com/ChengWu-Data/iris-recognition-system.git" 
       class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
  </div>

</div>

<!-- Project 1: Housing Price Prediction -->
<div class="project-card" data-tags="ml" data-details-id="project1">
  <img src="{{ site.baseurl }}/images/project1.jpg" alt="Housing Project Image" class="project-image">
  
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-robot"></i> 04 · MACHINE LEARNING</div>
    <div class="project-title">Housing Price Prediction: An Exploratory Analysis</div>
    <p class="project-description">
      Built a housing price prediction pipeline using exploratory data analysis, feature engineering, and regression/ML models including Ridge, LASSO, Random Forest, and Group LASSO. 
      The models achieved strong predictive accuracy while consistently identifying space, quality, and utility as the key drivers of value. 
      Beyond forecasting, the project emphasized interpretability and stakeholder communication — turning high-dimensional data into actionable insights for decisions.
    </p>

    <div class="project-stats">
      <span class="stat-chip">Ridge</span>
      <span class="stat-chip">LASSO</span>
      <span class="stat-chip">Random Forest</span>
      <span class="stat-chip">Group LASSO</span>
    </div>

    <button class="details-btn" onclick="toggleDetails('project1')">View Details</button>
  </div>
</div>

<!-- Hidden Details for Project 1 -->
<div id="project1" class="project-details">

  <!-- 🎯 Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> House price models often chase leaderboard metrics but fail to answer a practical question:
    <em>what exactly is driving value?</em> For a buyer, developer, or bank, we need an interpretable decomposition of
    space, quality, and neighborhood effects rather than a pure black-box forecast.
  </div>

  <!-- 🔥 Summary Section -->
  <div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Build an interpretable housing analytics pipeline that identifies economic drivers of value — not just produce a black-box prediction model.</p>

    <p><strong>Methodology:</strong> Starting from the full Ames dataset (80+ variables), we:</p>
    <ul>
      <li>Separated <strong>numeric vs categorical</strong> features & re-classified ordinal variables (<code>OverallQual</code>, <code>MoSold</code>)</li>
      <li>Used <strong>correlation + effect size (η²)</strong> to evaluate predictor strength</li>
      <li>Applied <strong>adjusted GVIF</strong> to control multicollinearity</li>
      <li>Built <strong>interactive visualizations</strong>: heatmaps, neighborhood maps, STL trend decomposition</li>
    </ul>

    <p><strong>Key Insights:</strong></p>
    <ul>
      <li><strong>Space & construction quality are the dominant drivers</strong> (<code>GrLivArea</code>, <code>TotalBsmtSF</code>, <code>OverallQual</code>)</li>
      <li><strong>Neighborhood effects persist even after controlling for features</strong></li>
      <li><strong>Garage & exterior finishing add second-tier but significant value</strong></li>
      <li><strong>Time-series structure aligns with macro events</strong> (e.g., subprime crisis, tax credits)</li>
    </ul>

    <p><strong>What this demonstrates:</strong></p>
    <ul>
      <li>Ability to turn raw municipal data into <strong>decision-oriented insights</strong></li>
      <li>Bridging <strong>EDA → feature engineering → modeling → communication</strong></li>
      <li>Transferable to pricing, risk modeling, and applied analytics pipelines</li>
    </ul>

    <p style="font-style:italic; color:#444;">Full interactive analysis available below.</p>
  </div>

  <!-- 🔽 Embedded HTML Preview -->
  <iframe class="preview-frame" src="https://htmlpreview.github.io/?https://github.com/ChengWu-Data/Housing-Price-Prediction-An-Exploratory-Analysis/blob/8a49d8ae0d2514d014c7d304ea081a2002fbd0f4/Housing_Price_Prediction-AnExploratoryAnalysis.html"></iframe>

  <!-- 🔗 Buttons -->
  <div class="button-row">
    <a href="https://github.com/ChengWu-Data/Housing-Price-Prediction-An-Exploratory-Analysis.git" class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
    <a href="{{ site.baseurl }}/assets/Housing_Price_Prediction-AnExploratoryAnalysis.html" class="html-btn" target="_blank">
      <i class="fa-solid fa-file"></i> View Page
    </a>
  </div>

</div>

<!-- Project 2 -->
<div class="project-card" data-tags="causal" data-details-id="project2">
  <img src="{{ site.baseurl }}/images/project2.jpg" alt="Project Image" class="project-image">
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-scale-balanced"></i> 05 · CAUSAL INFERENCE</div>
    <div class="project-title">Socioeconomic Drivers of Crime in San Francisco</div>
    <p class="project-description">
      Built a large-scale spatial econometrics pipeline linking 900k+ SF police incident records with ACS socioeconomic panel data. 
      Applied fixed-effects logistic models, Poisson/NegBin count models, and time-series forecasting to quantify how inequality, unemployment, and mobility patterns shape crime trends. 
      The project demonstrates skills in <strong>causal inference, longitudinal modeling, data integration, and policy analytics</strong>—transferable to business forecasting & systems design.
    </p>
    <div class="project-stats">
      <span class="stat-chip">913K+ incident records</span>
      <span class="stat-chip">Tract × year panel</span>
    </div>
    <button class="details-btn" onclick="toggleDetails('project2')">View Details</button>
  </div>
</div>

<!-- Hidden Details for Project 2 -->
<div id="project2" class="project-details">

  <!-- 🎯 Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> City agencies and planners see crime as an “economic problem”, but it’s unclear whether
    inequality, unemployment, or mobility actually explain crime patterns once we control for where people live and move.
    This project builds a tract–year panel to test whether the data supports that narrative.
  </div>

  <!-- （可选）一张展示问题的图，比如时间趋势 -->
  <!--
  <img src="{{ site.baseurl }}/images/fig_time_trend.png" 
       alt="Crime time trend" 
       style="width:100%; border-radius:6px; margin-bottom:1rem;">
  -->

  <!-- 🔥 Summary Section -->
  
<div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Quantify whether crime patterns are driven by economic factors such as inequality, unemployment, transit patterns, and demographic changes.</p>

    <p><strong>Pipeline:</strong> Merged 913,732 incident-level crime records with census-tract ACS data (2017–2022) using spatial joins and longitudinal panel construction.</p>

    <ul>
      <li>Panel structure: <strong>tract × year</strong></li>
      <li>Models: Fixed-effects logistic (individual), Poisson/Negative Binomial (aggregate)</li>
      <li>Time-series forecasting using ARIMAX/SARIMAX</li>
      <li>Feature engineering for economic deltas + mobility metrics</li>
    </ul>

    <p><strong>Key Findings:</strong></p>

    <ul>
      <li>Higher transit usage (public transit, cycling) → <strong>consistent increases in crime rates</strong> across categories</li>
      <li>Income inequality + unemployment <strong>negatively associated with crime at tract level</strong> (counter-intuitive, suggests urban confounds)</li>
      <li>Bachelor’s degree rate <strong>reduces violent/public order crime but increases property crime</strong></li>
      <li>COVID years: fewer public order crimes, more property crimes</li>
    </ul>

    <p><strong>Methodological Insights (Transferable):</strong></p>
    <ul>
      <li>Importance of panel vs individual-level inference: aggregate models outperform individual classifiers</li>
      <li>Negative Binomial superior under over-dispersion → similar logic applies to ops forecasting</li>
      <li>Mobility + density better predictors than pure economic indicators</li>
    </ul>

    <p style="font-style:italic; color:#444;">Full methodology and regression tables available in report below.</p>
  </div>

  <!-- 🔽 PDF PREVIEW -->
  <iframe class="preview-frame" src="https://drive.google.com/file/d/1VjV4sNFC9NrD7N8A9QoP_Ss2yWV_5WkI/preview"></iframe>

  <!-- 🔗 BUTTONS -->
  <div class="button-row">
    <a href="https://github.com/ChengWu-Data/sf-crime-socioeconomic-analysis" 
       class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
    <a href="https://drive.google.com/file/d/1VjV4sNFC9NrD7N8A9QoP_Ss2yWV_5WkI/view?usp=sharing" 
       class="html-btn" target="_blank">
      <i class="fa-solid fa-file-pdf"></i> View Report
    </a>
  </div>

</div>

<!-- Project 3: Ikebana Portfolio Site -->
<div class="project-card" data-tags="other" data-details-id="project3">
  <img src="{{ site.baseurl }}/images/project3.jpg" alt="Ikebana Site Image" class="project-image">
  <div class="project-content">
    <div class="project-kicker"><i class="fa-solid fa-palette"></i> 06 · WEB &amp; DESIGN</div>
    <div class="project-title">Ikebana Portfolio — Immersive Front-End Microsite</div>
    <p class="project-description">
      A handcrafted, single-page microsite that turns my Ikebana course portfolio into an immersive digital experience. 
      Built from scratch (no frameworks) with responsive layout, CSS animations, JavaScript-driven interactions, and background audio integration, 
      this project reflects my attention to detail in <strong>UX, visual hierarchy, and front-end systems thinking</strong> rather than just static pages.
    </p>
    <div class="project-stats">
      <span class="stat-chip">No framework</span>
      <span class="stat-chip">Vanilla JS/CSS</span>
    </div>
    <button class="details-btn" onclick="toggleDetails('project3')">View Details</button>
  </div>
</div>

<!-- Hidden Details for Project 3 -->
<div id="project3" class="project-details">

  <!-- 🎯 Problem Section -->
  <div class="project-problem">
    <strong>Problem:</strong> Most “portfolio sites” for creative work are either static grids of images or generic templates.
    I wanted to see if I could turn an Ikebana course portfolio into a small, product-like web experience with deliberate
    motion, sound, and layout — without relying on heavy frameworks.
  </div>

  <!-- 🔥 Summary Section -->
  <div class="project-summary" style="background:#faf7ff; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem; border-left:4px solid #6d4195;">
    <h2 style="color:#6d4195;">📌 Project Summary</h2>

    <p><strong>Objective:</strong> Design and implement a small, self-contained web experience that presents Ikebana work 
    in a way that feels more like a product than a static gallery — with smooth transitions, responsive layout, and ambient audio.</p>

    <p><strong>What I built:</strong></p>
    <ul>
      <li>A fully responsive single-page site that adapts to different screen sizes and dark/light environments</li>
      <li>Custom <strong>CSS animation system</strong> (entrance transitions, hover states, text reveals) without external libraries</li>
      <li>JavaScript controllers for <strong>navigation, scroll-based effects, and HTML5 audio playback</strong></li>
      <li>A layout that balances photography, text, and whitespace so the site reads like a curated story rather than a code demo</li>
    </ul>

    <p><strong>Why it matters for my broader work:</strong></p>
    <ul>
      <li>Shows I can go from <strong>concept → UX structure → visual design → implementation</strong> on my own</li>
      <li>Reinforces skills that are directly reusable for <strong>analytics dashboards, internal tools, and stakeholder-facing UIs</strong></li>
      <li>Demonstrates that I care about the last mile of data/insights — <strong>how people actually experience what we build</strong></li>
    </ul>

    <p style="font-style:italic; color:#444;">Below are selected screenshots from the live site.</p>
  </div>

  <!-- 📸 Photo Gallery -->
  <div class="photo-gallery">
    <img src="{{ site.baseurl }}/images/followerJP_1.jpg" alt="FollowerJP Screenshot 1" class="project-photo">
    <img src="{{ site.baseurl }}/images/followerJP_2.jpg" alt="FollowerJP Screenshot 2" class="project-photo">
    <img src="{{ site.baseurl }}/images/followerJP_3.jpg" alt="FollowerJP Screenshot 3" class="project-photo">
    <img src="{{ site.baseurl }}/images/followerJP_4.jpg" alt="FollowerJP Screenshot 4" class="project-photo">
  </div>

  <!-- 🔗 Button Row -->
  <div class="button-row">
    <a href="https://chengwu-data.github.io/followerJP/" class="html-btn" target="_blank">
      <i class="fa-solid fa-globe"></i> Visit Website
    </a>
    <a href="https://github.com/ChengWu-Data/followerJP" class="github-btn" target="_blank">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
  </div>
</div>

<div class="cw-empty-state">
  <i class="fa-solid fa-magnifying-glass" style="font-size:1.3rem; display:block; margin-bottom:.6rem;"></i>
  No projects match your search — try a different keyword or filter.
</div>

</div>

<script>
function toggleDetails(id) {
  var details = document.getElementById(id);
  if (details.style.display === "none" || details.style.display === "") {
    details.style.display = "block";
    // Add a transition effect for the expanded section
    details.style.opacity = 0;
    setTimeout(() => {
      details.style.opacity = 1;
      details.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  } else {
    details.style.opacity = 0;
    setTimeout(() => {
      details.style.display = "none";
    }, 200);
  }
}
</script>
<script src="{{ site.baseurl }}/assets/js/project-filters.js"></script>
<script src="{{ site.baseurl }}/assets/js/interactions.js"></script>
