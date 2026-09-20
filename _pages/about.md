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

Hi! I'm **Zhen Tan (谭臻)**. I am currently an **Algorithm Researcher** at **XGRIDS**, leading the company's research direction on 4D Reconstruction (4D Gaussian Splatting / World Model), and concurrently a **Postdoctoral Researcher** at the **Harbin Institute of Technology, Shenzhen (HITSZ)**, pursuing industry-academia collaborative research. I received my Ph.D. from the National University of Defense Technology (NUDT), supervised by <a href='https://ieeexplore.ieee.org/author/37271079500'>Prof. Dewen Hu (CAS Academician)<strong><span id='total_cit'></span></strong></a> and <a href='https://scholar.google.com/citations?user=DvrngV4AAAAJ&hl'>Assoc. Prof. Xieyuanli Chen<strong><span id='total_cit'></span></strong></a>. Prior to this, I obtained my Master's degree from the Technical University of Munich (TUM), guided by <a href='https://scholar.google.com/citations?user=U1xaKegAAAAJ&hl=en'>Prof. Yusheng Xu<strong><span id='total_cit'></span></strong></a>, and my Bachelor's degree from Wuhan University (WHU).

My research spans **3D/4D Vision and Spatial Intelligence**, covering radiance field reconstruction (NeRF/3DGS), visual SLAM, feed-forward generalizable reconstruction, geometric surface reconstruction, dynamic scene 4D reconstruction, and embodied perception — forming a complete pipeline from scene representation and reconstruction to perception and decision-making. My work is published/accepted/under review at venues including CVPR, ICRA, IROS, RA-L, and TIM (12 papers), with 1 granted invention patent.

I value the intersection of academic research and industrial deployment, with hands-on experience spanning autonomous driving sensor fusion (LiangDao Intelligence), 3D reconstruction algorithms (CVLife, 4DV.ai), embodied intelligence (XPENG Motors), and 4D reconstruction / world models (XGRIDS).

# 🔥 News
- *2026.08*: &nbsp;🚀🚀 Joined **XGRIDS** as an Algorithm Researcher, and started my postdoctoral research at **HITSZ**!
- *2026.01*: &nbsp;🎉🎉 One paper is accepted to **CVPR 2026** (TAPFormer)!
- *2025.12*: &nbsp;🎉🎉 One Paper is accepted to RA-L 2025!
- *2025.10*: &nbsp;🏆🏆 We won the **Champion** of the **IROS 2025 EvSLAM Challenge**!
- *2025.06*: &nbsp;🎉🎉 One Paper is accepted to IROS 2025!
- *2025.01*: &nbsp;🎉🎉 One Paper is accepted to ICRA 2025!
- *2024.06*: &nbsp;🎉🎉 One Paper is accepted to IROS 2024!

# 📝 Publications 
**\* denotes equal contribution.**
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">RA-L 2025</div><img src='images/tan2025ral.png' alt="TVG-SLAM" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[TVG-SLAM: Robust Gaussian Splatting SLAM with Tri-view Geometric Constraints](https://arxiv.org/abs/2506.23207)

**Zhen Tan**, Xieyuanli Chen, L. Feng, Y. Ge, S. Zhi, J. Liu, Dewen Hu

[**Project**](https://github.com/MagicTZ/TVG-SLAM) 
<!-- <strong><span class='show_paper_citations' data='YOUR_SCHOLAR_ID:PAPER_ID'></span></strong> -->
- Proposed a tri-view geometric constraint to address the instability of 3D Gaussian Splatting in texture-less or repetitive regions.
- Achieved tightly-coupled optimization of camera tracking and high-fidelity mapping, ensuring robustness in challenging outdoor environments.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">IROS 2025</div><img src='images/liu2025iros.png' alt="Event Tracking" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Tracking Any Point with Frame-Event Fusion Network at High Frame Rate](https://arxiv.org/abs/2409.11953)

J. Liu, B. Wang, **Zhen Tan**, J. Zhang, H. Shen, Dewen Hu

[**PDF**](https://arxiv.org/abs/2409.11953) <strong><span class='show_paper_citations' data='YOUR_SCHOLAR_ID:PAPER_ID'></span></strong>
- Explored multi-modal fusion of RGB frames and Event cameras for robust point tracking in high-dynamic scenarios.
- Leveraged the high temporal resolution of event data to maintain tracking stability under rapid motion, providing a reliable perception front-end for dynamic robotic tasks.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICRA 2025</div><img src='images/niu2025icra.png' alt="HGSLoc" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[HGSLoc: 3DGS-based Heuristic Camera Pose Refinement](https://arxiv.org/abs/2409.10925)

Z. Niu, **Zhen Tan**, J. Zhang, X. Yang, Dewen Hu

[**PDF**](https://arxiv.org/abs/2409.10925) <strong><span class='show_paper_citations' data='YOUR_SCHOLAR_ID:PAPER_ID'></span></strong>
- Developed a heuristic camera pose refinement framework leveraging 3D Gaussian Splatting as a dense map prior.
- Significantly improved visual relocalization accuracy by aligning query images with rendered views, facilitating long-term autonomy in persistent environments.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">IROS 2024</div><img src='images/tan2024iros.png' alt="TD-NeRF" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[TD-NeRF: Novel Truncated Depth Prior for Joint Camera Pose and Neural Radiance Field Optimization](https://arxiv.org/abs/2405.07027)

**Zhen Tan**, Z. Zhou, Y. Ge, Z. Wang, Xieyuanli Chen, Dewen Hu

[**PDF**](https://arxiv.org/abs/2405.07027) <strong><span class='show_paper_citations' data='YOUR_SCHOLAR_ID:PAPER_ID'></span></strong>
- Address the dependency of NeRF on pre-computed COLMAP poses by introducing a truncated depth prior.
- Enabled joint optimization of neural radiance fields and camera poses, allowing for high-quality reconstruction without accurate initial pose priors.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2026</div></div></div>
<div class='paper-box-text' markdown="1">

**TAPFormer: Robust Arbitrary Point Tracking via Transient Asynchronous Fusion of Frames and Events**

J. Liu, **Zhen Tan**, J. Zhang, Y. Zhou, H. Shen, Xieyuanli Chen, Dewen Hu

- Proposes a transient asynchronous fusion mechanism to align the spatiotemporal information of frames and event cameras.
- Achieves robust, high-frame-rate arbitrary point tracking under highly dynamic scenes, and explores using tracking priors for dynamic 4D reconstruction.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">TIM (Accepted)</div></div></div>
<div class='paper-box-text' markdown="1">

**A Plug-and-Play Learning-based IMU Bias Factor for Robust Visual-Inertial Odometry**

Y. Yi, K. Wang, J. Zhang, **Zhen Tan**, X. Wang, H. Shen, Dewen Hu

*IEEE Transactions on Instrumentation and Measurement*. (JCR Q1, IF: 5.9)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Remote Sensing 2025</div></div></div>
<div class='paper-box-text' markdown="1">

**Fast Intrinsic-Extrinsic Calibration for Pose-Only Structure-from-Motion**

X. Tian, Y. Ge, **Zhen Tan**, Xieyuanli Chen, M. Li, Dewen Hu

*Remote Sensing*, 2025. (JCR Q1)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">TVCG (Under Review)</div></div></div>
<div class='paper-box-text' markdown="1">

**Geometric Inconsistency-Guided Gaussian Splatting for Surface Reconstruction from Sparse Image Sequences**

**Zhen Tan**, Xieyuanli Chen, J. Zhang, L. Feng, X. Lian, Dewen Hu

- Leverages geometric inconsistency to guide multi-view constraint fusion and uncertainty estimation, localizing and correcting high-error regions.
- Extracts high-precision surface meshes from sparse image sequences. (IEEE TVCG, under review, JCR Q1 Top, IF: 7.6)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">TVCG (Under Review)</div></div></div>
<div class='paper-box-text' markdown="1">

**Gaussian-Voxel Duet: A Dual-Scaffolding Hybrid Representation for Fast and Accurate Monocular Surface Reconstruction**

Z. Du, **Zhen Tan** (Co-first author), H. Zhang, Dewen Hu, S. Zhi, P. Liu

- Builds a hybrid dual-scaffolding representation combining Gaussians and voxels, using fast 3DGS rendering to guide and mutually constrain SDF field optimization.
- Achieves fast, high-precision indoor scene geometric reconstruction from monocular input. (IEEE TVCG, under review)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">AAAI (Under Submission)</div></div></div>
<div class='paper-box-text' markdown="1">

**SSR-GS: Structure-Aware Super-Resolution Gaussian Splatting**

**Zhen Tan**, S. Yang, Q. Gao, J. Liu, Z. Niu, J. Zhang, Xieyuanli Chen, Dewen Hu

- Studies structure-aware 3DGS super-resolution reconstruction from low-resolution inputs, using scene structure priors to constrain high-frequency detail generation.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR (Under Review)</div></div></div>
<div class='paper-box-text' markdown="1">

**SCS-SLAM: Spatial Consistency-Aware Splatting for Robust Tracking and High-Fidelity Mapping**

**Zhen Tan**, Xieyuanli Chen, J. Liu, Y. Shi, H. Shen, Dewen Hu
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Patent</div></div></div>
<div class='paper-box-text' markdown="1">

**一种基于偏振法向估计的高保真辐射场重建方法及系统** (CN 119379954 B, 2025-03-11)

National University of Defense Technology. Dewen Hu, **Zhen Tan**, L. Feng, L. Zhang, M. Li. (Invention patent, 1st among student authors)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">中国图象图形学报 2025</div></div></div>
<div class='paper-box-text' markdown="1">

**SLAM新机遇--高斯溅射技术**

**谭臻**, 牛中颜, 张津浦, 陈谢沅澧, 胡德文

*Journal of Image and Graphics*, 2025. (Excellent Paper Award)
</div>
</div>

# 🧑‍💻 Experience
- *2026.08 - Present*, **Algorithm Researcher**, XGRIDS. Leading the company's 4D Reconstruction direction (4DGS / World Model): technical roadmap planning, core algorithm R&D, and patent/paper pipeline.
- *2026.08 - Present*, **Postdoctoral Researcher**, Harbin Institute of Technology, Shenzhen (HITSZ). Researching dynamic scene 4D reconstruction and world models, in industry-academia collaboration with XGRIDS.
- *2026.05 - 2026.07*, **Algorithm Research Intern**, XGRIDS (4D Reconstruction Team). Investigated 4DGS and World Model techniques and built early algorithm prototypes for dynamic scene 4D reconstruction.
- *2026.01 - 2026.05*, **Embodied AI Algorithm Intern**, XPENG Motors (General AI Center). Worked on VLA (Vision-Language-Action) and World Model research for embodied intelligence, focusing on the "cerebellum" module of a brain-cerebellum robot architecture.
- *2025.07 - 2025.09*, **Algorithm Intern**, 4DV.ai (3D Vision Algorithm Team). Researched monocular 4D Gaussian Splatting on iPhone-captured monocular RGB-D data, fusing temporal point tracking to reconstruct high-fidelity dynamic scenes.
- *2024.04 - 2024.06*, **Algorithm Intern**, CVLife (Reconstruction Algorithm Team). Accelerated and deployed a differentiable Gaussian Splatting renderer (40%+ speedup); researched the full pipeline of 3DGS-to-mesh conversion to improve geometric reconstruction quality.
- *2021.01 - 2022.02*, **Sensor Fusion Algorithm Engineer**, LiangDao Intelligence (European R&D Center). Led development of LiDAR-camera post-fusion algorithms for highway autonomous driving and roadside perception fusion.

# 🎖 Honors and Awards
- *2025*, IROS 2025 EvSLAM Challenge, Champion.
- *2025*, Second-class Scholarship for Outstanding Students, NUDT.
- *2022*, Freshman Scholarship of NUDT, First Prize.
- *2021*, Munich Innovation Challenge (Tech Innovation Award), 1st Place (Key Team Member).
- *2020/21*, German Chinese Football Championship, Champion.
- *2018*, "Outstanding Student" Award, Wuhan University.
- *2017*, Remote Sensing Star in Wuhan University, Top 10 Students.
- *2017*, Scholarship (Grade B), Wuhan University.
- *2016*, Hubei Province Collegiate 11-a-side Football League, Champion (Starting Midfielder).
- *2016*, "Outstanding Student Scholarship", Wuhan University.
- *2015*, Advanced Individual, Wuhan University Summer Social Practice; Volunteer in the "Rainbow Action" for left-behind children, Hubei Province.

# 📖 Educations
- *2022.09 - Present*, Ph.D. in Control Science and Engineering, National University of Defense Technology (NUDT). 
- *2018.09 - 2022.01*, M.Sc. in Geodesy and Geoinformation, Technical University of Munich (TUM) (QS Top 30).
- *2014.09 - 2018.06*, B.Eng. in Photogrammetry and Remote Sensing, Wuhan University (WHU).

# 💬 Hobbies
- **Sports**: Football (University Team Captain), Skiing, Basketball, Taekwondo, Martial Arts, Dancing.
- **Arts**: Movies.
- **Travel**: Exploring different cultures.



<div style="text-align: center; margin-top: 20px;">
  <span id="busuanzi_container_site_pv" style="display: inline;">
    👀 Total Views: <span id="busuanzi_value_site_pv"></span>
  </span>
  &nbsp;&nbsp;
  <span id="busuanzi_container_site_uv" style="display: inline;">
    🧍 Visitors: <span id="busuanzi_value_site_uv"></span>
  </span>
</div>

<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

