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

I am a Research Fellow at National University of Singapore, under the supervision of [PYP Assistant Professor: Tham Yih Chung](https://discovery.nus.edu.sg/16620-yih-chung-tham/publications). I received my Ph.D. from the College of Computer Science, Sichuan University, co-advised by [Prof. Xiaojing Shen](https://math.scu.edu.cn/info/1013/5806.htm) and [Prof. Xuedong Yuan](https://cs.scu.edu.cn/info/1359/17827.htm). I was a visiting Ph.D. student at the Agency for Science, Technology and Research (A*STAR) in Singapore from September 2022 to September 2023, under the supervision of [Principal Scientist: Huazhu Fu](https://hzfu.github.io/). He has undertaken academic visits to leading institutions, including Tsinghua University, The Hong Kong Polytechnic University, and University College London. His publications include journals and conferences such as __Nature Medicine__, __The Lancet Digital Health__, __IEEE TPAMI__, __IEEE TMI__, __Medical Image Analysis__, __IEEE TCYB__, __IEEE TCSVT__, __ICCV__,  and __MICCAI__. 

<ul>
  <li style="color:#D32F2F !important;">
    📣 Feel free to reach out if you are interested in collaborating on my research 🤝!
    <a href="mailto:kezou8@gmail.com" style="color:#B71C1C !important; font-weight:bold;">Email Me!</a>
  </li>
</ul>

- 👯 I am also looking to collaborate on __trustworthy multimodal learning__ with uncertainty estimation, __explainable VLMs with grounding__,__multi-agent/agentic systems__,__foundation models__, __benchmarking__, and __hallucination and fairness in VLMs__.
- ⚡ Welcome your excellent manuscript! I'm guesting a special issue of Emerging AI Paradigms for Next-Generation Medicine: Safety and Reliability in Vision-Language Models, Agentic Systems, and Digital Twins in the journal of **IEEE JBHI** (IF = 6.7). [[Link]](https://www.embs.org/jbhi/wp-content/uploads/sites/18/2025/10/Emerging-AI-Paradigms-for-Next-Generation-Medicine-Safety-and-Reliability-in-Vision-Language-Models-Agentic-Systems-and-Digital-Twins.docx.pdf)
****

****

## 📣 News
- [08/2026] I received the **NUS Medicine Outstanding Research Fellow Award** (1st Runner-up). Thank you all for your interest and support!
- [08/2026] One paper was onlined in **The Lancet Regional Health - Africa**.
- [08/2026] One paper was accepted in **Pattern Recognition**.
- [07/2026] One LLM-based paper was accepted in **npj Digital Medicine**. Congrats to the team!
- [07/2026] I received the **Best Poster Award** at the **13th MICS**, held in the Tsinghua University. Thank you all for your interest and support!
- [06/2026] Our paper "Hallucination Detection and Correction in Medical VLMs via Counter-Evidence Verification" was accepted in **MICCAI 2026**. Congrats to Nan Zhou! ([link](https://arxiv.org/abs/2606.18609))
- [06/2026] I had a rewarding academic visit to UCL, London, with Prof. Tham’s team, engaging in fruitful discussions and exchanges.
- [06/2026] Glad to be the handling editor of Frontiers in Radiology (Q2, IF=4.0) ([link](https://www.frontiersin.org/journals/radiology))
- [04/2026] Our paper was accepted in **The Lancet Digital Health**. Congrats to the team!
- [03/2026] Our paper "Uncertainty-Aware Cross-Modal Retrieval for Medical Report Generation" was accepted in **IEEE JBHI**. Congrats to Nan Zhou!
- [02/2026] Our paper "Understanding pre-training data effects in retinal foundation models using two large fundus cohorts" was onlined in **Nature Communications**. ([link](https://www.nature.com/articles/s41467-026-70077-z))
- [02/2026] Our paper "Agentic artificial intelligence in eye care: is clinical autonomy finally within reach?" was onlined in **The Lancet Digital Health**. ([link](https://www.thelancet.com/journals/landig/article/PIIS2589-7500(25)00149-9/fulltext)) 
- [01/2026] Glad to be the **MICCAI2026 Area Chair**, Thanks for the MICCAI community!
- [01/2026] Happy New Year!!!🎉🎉🎉
- ...


# 📝 Selected Publications (\* means co-first author)
Please find my full paper list at my [[Google Scholar]](https://scholar.google.com/citations?user=fRvi7zkAAAAJ&hl=zh-CN).

## Explainable and Groundable VLM 
 <div class='paper-box'><div class='paper-box-image'><div><div class="badge">IEEE TPAMI 2025</div><img src='images/uMedGround.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Uncertainty-aware Medical Diagnostic Phrase Identification and Grounding][[IEEE]](https://ieeexplore.ieee.org/abstract/document/11119420/)[[arxiv]](https://arxiv.org/abs/2404.06798)[[Code]](https://github.com/Cocofeat/uMedGround)

**Ke Zou**\*, Yang Bai\*, Zhihao Chen, Yang Zhou, Yidi Chen, Kai Ren, Meng Wang, Xuedong Yuan, Xiaojing Shen, Xiaochun Cao, Yih Chung Tham, Huazhu Fu
</div>
</div>

 <div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICCV 2025</div><img src='images/GeMeX.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[GEMeX: A Large-Scale, Groundable, and Explainable Medical VQA Benchmark for Chest X-ray Diagnosis][[Paper]](https://arxiv.org/abs/2411.16778)[[Code]](https://www.med-vqa.com/GEMeX/)

Bo Liu, **Ke Zou**, Liming Zhan, Zexin Lu, Xiaoyu Dong, Yidi Chen, Chengqiang Xie, Jiannong Cao, Xiao-Ming Wu, Huazhu Fu
</div>
</div>

## FM for Generalists

 <div class='paper-box'><div class='paper-box-image'><div><div class="badge">Nature Medicine 2025</div><img src='images/global_FM.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">
  
[Building the world’s first truly global medical foundation model][[Paper]](https://www.nature.com/articles/s41591-025-03859-5)

Yih Chung Tham, Jocelyn Hui Lin Goh, ..., **Ke Zou**, Carol Y Cheung, Pearse A Keane
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arxiv 2025</div><img src='images/FusionFM.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[FusionFM: Fusing Eye-specific Foundational Models for Optimized Ophthalmic Diagnosis][[Paper]](https://arxiv.org/abs/2508.11721)

**Ke Zou**\*, Jocelyn Hui Lin Goh\*, Yukun Zhou\*, Tian Lin\*, Samantha Min Er Yew, Sahana Srinivasan, Meng Wang, Rui Santos, Gabor M. Somfai, Huazhu Fu, Haoyu Chen, Pearse A. Keane, Ching-Yu Cheng, Yih Chung Tham
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">IEEE TCSVT </div><img src='images/MedSAMU.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[MedSAM-U: Uncertainty-Guided Auto Multi-Prompt Adaptation for Reliable MedSAM](https://arxiv.org/pdf/2409.00924)

Nan Zhou\*, **Ke Zou**\*, Kai Ren, Mengting Luo, Linchao He, Meng Wang, Yidi Chen, Yi Zhang, Hu Chen, Huazhu Fu
</div>
</div>

## Agents/Agentic for Specialists
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">The Lancet Digital Health 2026</div><img src='images/LDH-agent.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">
  
[Agentic artificial intelligence in eye care: is clinical autonomy finally within reach?] [[Paper]](https://www.thelancet.com/journals/landig/article/PIIS2589-7500%2825%2900149-9/fulltext)
**Ke Zou**, Jocelyn Hui Lin Goha, Gabriel Dawei Yang, Sahana Srinivasan, Qingyu Chen, Pearse A Keane, Yih-Chung Tham
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Information Fusion 2025</div><img src='images/Eh-benchmark.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">
  
[EH-Benchmark: Ophthalmic hallucination benchmark and agent-driven top-down traceable reasoning workflow] [[Paper]](https://www.sciencedirect.com/science/article/abs/pii/S1566253525007031)[[Code]](https://github.com/ppxy1/EH-Benchmark)

Xiaoyu Pan, Yang Bai, **Ke Zou**, Yang Zhou, Jun Zhou, Huazhu Fu, Yih-Chung Tham, Yong Liu
</div>
</div>

## Trustworthy Medical Image Analysis

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">MICCAI 2022, IEEE TCyber 2025</div><img src='images/MICCAI_DEviS.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Towards Reliable Medical Image Segmentation by utilizing Evidential Calibrated Uncertainty][[Conference]](https://arxiv.org/abs/2206.09309) [[Code]](https://github.com/Cocofeat/TBraTS)[[Journal]](https://arxiv.org/abs/2301.00349)[[Code]](https://github.com/Cocofeat/DEviS)

**Ke Zou**, Yidi Chen, Ling Huang, Xuedong Yuan, Xiaojing Shen, Meng Wang, Rick Siow Mong Goh, Yong Liu, Huazhu Fu
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">NC 2023</div><img src='images/NC_UIOS.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Uncertainty-inspired open set learning for retinal anomaly identification](\https://www.nature.com/articles/s41467-023-42444-7)

Meng Wang\*, Tian Lin\*, Lianyu Wang\*, Aidi Lin, **Ke Zou**, et al.
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">MICCAI 2023 Early Accept, MedIA 2024</div><img src='images/MICCAI_EyeMoSt.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Reliable Multimodality Eye Disease Screening via Mixture of Student's t Distributions](https://link.springer.com/chapter/10.1007/978-3-031-43990-2_56)[[EyeMoSt+/EyeMoSt Codes]](https://github.com/Cocofeat/EyeMoSt/tree/main/MedIA%E2%80%9924)

**Ke Zou**\*, Tian Lin\*, Xuedong Yuan, Haoyu Chen, Xiaojing Shen, Meng Wang, Huazhu Fu
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">MICCAI 2023</div><img src='images/MICCAI_UMML.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[Uncertainty-informed Mutual Learning for Joint Medical Image Classification and Segmentation](https://link.springer.com/chapter/10.1007/978-3-031-43901-8_4)

Kai Ren\*, **Ke Zou**\*, Xianjie Liu, Yidi Chen, Xuedong Yuan, Xiaojing Shen, Meng Wang, Huazhu Fu
</div>
</div>

# 🗣 Activities
## Guest Editors
- ***IEEE JBHI***
- ***Frontiers in Medicine***
## Handling Editor
- ***Frontiers in Radiology***
## Area Chairs
- ***MICCAI 2025, MICCAI 2026***
## Reviewers
- Conference Reviewer: ***FUSION2022***, ***ICASSP2023, ICASSP2024***, ***MIDL2023, MIDL2024, MIDL 2026***, ***MICCAI2023, MICCAI2024***, ***ICIP2023, ICIP2024***, ***BIBM 2025***
- Journal Reviewer: ***Nature Biomedical Engineering***, ***Nature Communications***, ***IEEE TMI***, ***Medical Image Analysis***, ***IEEE TNNLS***, ***Pattern Recognition***, ***IEEE JBHI***, ***Knowledge-Based Systems***, ***Expert systems with applications***, ***Engineering Applications of Artificial Intelligence***, ***Biomedical Signal Processing and Control***, ***Computer methods and programs in biomedicine***, ***Artificial intelligence in medicine***, ***IEEE TAI***

# 💬 Talks and Presentations
- *2025.10*, BEIHAI SUMMIT 2025, Beijing, China.
- *2025.09*, MICCAI2025, Daejeon, Republic of Korea.
- *2025.05*, ARVO2025, Salt Lake City, US.
- *2024.06*, Ph.D. graduation defense sharing, University of Electronic Science and Technology of China, invited by [Prof. Ping Zhang](https://sose.uestc.edu.cn/info/1022/1981.htm).
- *2024.04*, AIxMed Biweekly Seminar, curated by the MGH/HMS Center for Advanced Medical Computing and Analysis (CAMCA), invited by [Prof. Xiang Li](https://xiangli-shaun.github.io/).
- *2023.12*, Central China Normal University Nanhu Forum academic exchange report, curated by School of Computer Science, Central China Normal University, invited by [Prof. Yutao Ma](https://cs.ccnu.edu.cn/info/1109/2702.htm).
- *2023.11*, The Third Graduate Academic Forum, curated by Chinese Journal of Graphics and Images.
- *2022.08* [MICS2022](https://aim.nuist.edu.cn/events/mics2022.htm) of [TBraTS: Trusted Brain Tumor Segmentation](https://www.bilibili.com/video/BV1nW4y1a7Qp/?spm_id_from=333.337.search-card.all.click&vd_source=6ab19d355475883daafd34a6daae54a5) (**3rd Prize**)
- *2019.07*, FUSION2019, Ottawa, Canada.

# 🌐 Academic Visits and Exchanges
- *2026.06*, University College London, London, UK.
- *2026.04*, The Hong Kong Polytechnic University, Hong Kong, China.
- *2025.10*, Tsinghua University, Beijing, China.

# 🎖 Honors and Awards
- 2026.08 – NUS Medicine Outstanding Research Fellow Award
- 2026.07 – MICS2026 Best Poster Award
- 2025.05 – ARVO2025 Travel Grant Award
- 2024.09 – OMIA MICCAI2024 Best Paper Award
- 2021.12 – Outstanding Graduate Thesis of Chongqing
- 2021.09 – Outstanding Postgraduate of Sichuan University
- 2020.06 – Outstanding Graduate Student of Chongqing
- 2017.06 - Outstanding Undergraduate Student of Chongqing
- 2015.11 – National Scholarship (1%)

<a href="http://s01.flagcounter.com/more/V8"><img src="https://s01.flagcounter.com/map/V8/size_s/txt_000000/border_CCCCCC/pageviews_0/viewers_0/flags_0/" alt="Flag Counter" border="0"></a>
