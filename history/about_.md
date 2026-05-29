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

I am now a second-year PhD student in [IMPL Lab](https://impl2023.github.io/), Singapore University of Technology and Design (SUTD), fortunately supervised by Prof. [Na Zhao](https://na-z.github.io/).
I am also supported by the Agency for Science, Technology and Research (A*STAR) [SINGA](https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa) scholarship and am grateful to be supervised by Prof. [Xulei Yang](https://www.google.com/search?q=xulei+yang&oq=xu&gs_lcrp=EgZjaHJvbWUqEAgCEEUYExgnGDsYgAQYigUyBggAEEUYOTIGCAEQRRhAMhAIAhBFGBMYJxg7GIAEGIoFMggIAxBFGCcYOzIGCAQQRRg7MgoIBRAAGLEDGIAEMgYIBhBFGD0yBggHEEUYPdIBCDMyMjVqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8#:~:text=Xulei%20Yang%20%2D%20Singapore,%E6%82%A8%E7%BB%8F%E5%B8%B8%E8%AE%BF%E9%97%AE).
Prior to this, I obtained my Master’s degree from Zhejiang University in 2023 and worked as a research intern at Alibaba DAMO Academy.

My research interests include multi-modal scene understanding and generation. Currently, I focus on building a comprehensive understanding of complex scenes by leveraging multi-modal features (e.g., LiDAR and RGB images). I am also interested in transferring learned knowledge to address real-world challenges such as domain shift.


<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->


# 🔥 News
- *2025.05*: &nbsp;🎉🎉🎉 One paper is accepted by ICML 2025!
- *2025.05*: &nbsp;My new homepage is now live!

# 📝 Publications

A full publication list is available on my [google scholar](https://scholar.google.com/citations?user=SCHOLAR_ID&user=l_6n20kAAAAJ) page.

<!-- Paper 1 -->
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICML 2025 </div><img src='images/papers/3-IAL-ICML25.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[**ICML 2025**] [How Do Images Align and Complement LiDAR? Towards a Harmonized Multi-modal 3D Panoptic Segmentation](https://arxiv.org/abs/2505.18956) \\
**Yining Pan**, Qiongjie Cui, Xulei Yang, Na Zhao
[[Project page]](https://github.com/IMPL-Lab/IAL)

- This paper proposes the Image-Assists-LiDAR (IAL) model, which harmonizes LiDAR and images through synchronized augmentation, token fusion, and prior query generation.
- IAL achieves SOTA performance on 3D panoptic benchmarks, outperforming baseline methods by over 4%.

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
<!-- - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  -->
</div>
</div>

<!-- Paper 2 -->
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2024 </div><img src='images/papers/2-InstructVideo-CVPR24.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[**CVPR 2024**] [InstructVideo: Instructing Video Diffusion Models with Human Feedback](https://arxiv.org/abs/2312.12490)  \\
H. Yuan, S. Zhang, X. Wang, Y. Wei, T. Feng, **Yining Pan**, Y. Zhang, Z. Liu, S. Albanie, D. Ni \\
[![GitHub Stars](https://img.shields.io/github/stars/damo-vilab/i2vgen-xl?style=social)](https://github.com/damo-vilab/i2vgen-xl)
[![GitHub Forks](https://img.shields.io/github/forks/damo-vilab/i2vgen-xl?style=social)](https://github.com/damo-vilab/i2vgen-xl)
[[Project page]](https://instructvideo.github.io/)

- InstructVideo is the first research attempt that instructs video diffusion models with human feedback.
- InstructVideo significantly enhances the visual quality of generated videos without compromising generalization capabilities, with merely 0.1% of the parameters being fine-tuned.

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
<!-- - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  -->
</div>
</div>

<!-- Paper 3 -->
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICCV 2023 </div><img src='images/papers/1-RLIPv2-ICCV23.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[**ICCV 2023**] [RLIPv2: Fast Scaling of Relational Language-Image Pre-training](https://arxiv.org/abs/2308.09351) \\
H. Yuan, S. Zhang, X. Wang, S. Albanie, **Yining Pan**, T. Feng, J. Jiang, D. Ni, Y. Zhang, D. Zhao \\
[![GitHub Stars](https://img.shields.io/github/stars/JacobYuan7/RLIPv2?style=social)](https://github.com/JacobYuan7/RLIPv2)
[![GitHub Forks](https://img.shields.io/github/forks/JacobYuan7/RLIPv2?style=social)](https://github.com/JacobYuan7/RLIPv2)

- RLIPv2 elevates [RLIP](https://arxiv.org/abs/2209.01814) by leveraging a new language-image fusion mechanism, designed for expansive data scales.

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
<!-- - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  -->
</div>
</div>


# 🎖 Honors and Awards
- Singapore International Graduate Award (SINGA) from A*STAR.
- ZJU Graduate of Merit, Triple-A Graduate.
- National Undergraduate Electronics Design Contest, First Prize.
- China College Students’ ‘Internet+’ Innovation and Entrepreneurship Competition, First Prize.
- Win the People Scholarship for three consecutive years (Top 1%).

<!-- - *2021.10* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.09* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 

<!-- # 📖 Educations
- *2019.06 - 2022.04 (now)*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2015.09 - 2019.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 

# 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/)

# 💻 Internships
- *2019.05 - 2020.02*, [Lorem](https://github.com/), China. -->