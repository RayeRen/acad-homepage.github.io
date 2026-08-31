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

I am an **Assistant Professor** in the **College of AI** at **Tsinghua University**. I received my Ph.D. in Information and Communication Engineering from Tsinghua University in 2024, and was a Shuimu Scholar postdoctoral fellow in the Department of Automation before joining the College of AI.

My research advances **Physics-informed AI for Science** — a field aimed at dissolving the binary boundary between physical hardware and computational intelligence. By embedding fundamental physical laws directly into neural network architectures, I ensure **high fidelity** and **scientific trustworthiness**, even when operating under extreme conditions. Furthermore, by utilizing AI models to guide and inspire hardware design, I aim to transcend detection limits imposed by classical physics. This approach establishes a new paradigm for scientific discovery, designed to catalyze breakthroughs across complex domains, including **optics**, **astronomy**, and **remote sensing**.

In addition to my research, I serve as a reviewer for *Nature*, *IEEE TCSVT*, *Optica*, and *Optics Express*. I am also an Executive Editor for the special issue 'Intelligent Optical Astronomical Observation Technology' in *Laser & Optoelectronics Progress*.


# 🏆 Representative Publications 

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Science 2026</div><img src='images/Science.jpg' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

***[Science 2026]*** [Deeper detection limits in astronomical imaging using self-supervised spatiotemporal denoising](https://doi.org/10.1126/science.ady9404)

**Yuduo Guo†**, Hao Zhang†, Mingyu Li†, Fujiang Yu, Yunjing Wu, Yuhan Hao, Song Huang, Yongming Liang, Xiaojing Lin, Xinyang Li, Jiamin Wu*, Zheng Cai*, Qionghai Dai*


[**Abstract**](https://scholar.google.co.jp/scholar?q=direct+observation+of+atmospheric+turbulence&hl=zh-CN&as_sdt=0&as_vis=1&oi=scholart) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>


-The detection limit of astronomical imaging observations is limited by several noise sources. Some of that noise is correlated between neighbouring image pixels and exposures, so in principle could be learned and corrected. We present an astronomical self-supervised transformer-based denoising algorithm (**ASTERIS**), that integrates spatiotemporal information across multiple exposures. Benchmarking on mock data indicates that ASTERIS improves detection limits by **1.0 magnitude at 90% completeness and purity**, while preserving the point spread function and photometric accuracy. Observational validation using data from the James Webb Space Telescope (JWST) and Subaru telescope identifies previously undetectable features, including low-surface-brightness galaxy structures and gravitationally-lensed arcs. Applied to deep JWST images, ASTERIS identifies three times more redshift ≳ 9 galaxy candidates, with **rest-frame ultraviolet luminosity 1.0 magnitude fainter**, than previous methods.


[**Code**](https://github.com/freemercury/ASTERIS_THU):https://github.com/freemercury/ASTERIS_THU

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Nature Photonics 2024</div><img src='images/NP.jpg' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

***[Nature Photonics 2024]*** [Direct observation of atmospheric turbulence with a video-rate wide-field wavefront sensor](https://www.nature.com/articles/s41566-024-01466-3)

**Yuduo Guo†**, Yuhan Hao†, Sen Wan†, Hao Zhang, Laiyu Zhu, Yi Zhang, Jiamin Wu*, Qionghai Dai*, Lu Fang*


[**Abstract**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=VaGAePwAAAAJ&citation_for_view=VaGAePwAAAAJ:9yKSN-GCB0IC) <strong><span class='show_paper_citations' data='VaGAePwAAAAJ:9yKSN-GCB0IC'></span></strong>


-We develop **a light-field-based plug-and-play wide-field wavefront sensor (WWS)**, facilitating the direct observation of atmospheric turbulence over **1,100 arcsec** at 30 Hz. The experimental measurements agreed with the von Kármán turbulence model, further verified using a differential image motion monitor. Attached to an 80 cm telescope, our WWS enables clear turbulence profiling of three layers below an altitude of 750 m and high-resolution aberration-corrected imaging without additional deformable mirrors. The WWS also enables prediction of the evolution of turbulence dynamics within **33 ms** using a convolutional recurrent neural network with wide-field measurements, leading to more accurate pre-compensation of turbulence-induced errors during free-space optical communication. Wide-field sensing of dynamic turbulence wavefronts provides new opportunities for studying the evolution of turbulence in the broad field of atmospheric optics.


[**Code**](https://github.com/freemercury/Widefield_wavefront_sensor):https://github.com/freemercury/Widefield_wavefront_sensor

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Nature 2022</div><img src='images/Nature.jpg' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

***[Nature 2022]*** [An integrated imaging sensor for aberration-corrected 3D photography](https://doi.org/10.1038/s41586-022-05306-8)

Jiamin Wu†, **Yuduo Guo†**, Chao Deng†, Anke Zhang, Hui Qiao, Zhi Lu, Jiachen Xie, Lu Fang*, Qionghai Dai*

- <span style="color: #d9534f; font-weight: bold;">[ESI Highly Cited Paper]</span>


[**Abstract**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=VaGAePwAAAAJ&citation_for_view=VaGAePwAAAAJ:u-x6o8ySG0sC) <strong><span class='show_paper_citations' data='VaGAePwAAAAJ:u-x6o8ySG0sC'></span></strong>


- We propose an **integrated scanning light-field imaging sensor**, termed a **meta-imaging sensor**, to achieve high-speed aberration-corrected three-dimensional photography for universal applications without additional hardware modifications. Instead of directly detecting a two-dimensional intensity projection, the meta-imaging sensor captures extra-fine four-dimensional light-field distributions through a vibrating coded microlens array, enabling flexible and precise synthesis of complex-field-modulated images in post-processing. Using the sensor, we achieve high-performance photography up to a **gigapixel with a single spherical lens** without a data prior, leading to **orders-of-magnitude reductions in system capacity and costs for optical imaging**. Even in the presence of dynamic atmosphere turbulence, the meta-imaging sensor enables multisite aberration correction across **1,000 arcseconds on an 80-centimetre ground-based telescope** without reducing the acquisition speed, paving the way for high-resolution synoptic sky surveys. Moreover, high-density accurate depth maps can be retrieved simultaneously, facilitating diverse applications from autonomous driving to industrial inspections.


[**Code**](https://github.com/freemercury/Aberration_correction_metasensor):https://github.com/freemercury/Aberration_correction_metasensor

</div>
</div>

# 🎖 Honors and Awards
- *2025* Young Elite Scientists Sponsorship Program of the Beijing High Innovation Plan.
- *2024* Tsinghua University Shuimu Scholars.
- *2024* Outstanding Doctoral Dissertation of the Chinese Institute of Electronics (CIE).
- *2024* Beijing Outstanding Graduates.
- *2024* Tsinghua University Outstanding Doctoral Dissertation.
- *2024* Tsinghua University Academic Rising Star (Top 10 per year).
- *2023* National Scholarship.
- *2023* International Congress of Basic Science (ICBS) Frontiers of Science Award.
- *2023* Top 10 Optical Breakthroughs in China.
- *2023* Best Oral Presentation Award, Graduate Forum of the Chinese Optical Society.
- *2023* Tsinghua University Future Leaders Scholarship.
- *2023* Tsinghua University First-Class School Scholarship.
- *2022* Tsinghua University Future Leaders Scholarship.


# 📖 Educations & Employment
- *2026 - present*, Assistant Professor, College of AI, Tsinghua University (THU).
- *2024.07 - 2026*, Assistant Research Fellow (Shuimu Scholar Postdoctoral Fellow), Department of Automation, Tsinghua University (THU).
- *2020.08 - 2024.06*, Ph.D. in Information and Communication Engineering, Tsinghua University (THU). 
- *2017.09 - 2020.06*, M.S. in Electronic Science and Technology, Beijing University of Posts and Telecommunications (BUPT). 
- *2013.09 - 2017.06*, B.S. in Applied Physics, Beijing University of Posts and Telecommunications (BUPT). 

# 💬 Invited Talks
- *2025.11*  “Digital adaptive meta imaging”, Nanjing Institute of Astronomical Optics & Technology (NIAOT), Invited talk.
- *2025.10*  “Advanced imaging technology for astronomy”, Tsinghua University, Department of astronomy, Advanced Observational Astrophysics, Invited lecture.
- *2024.11*	 “Computational imaging in Biomedical and Observational Astronomy”, Fudan University, Photonics Project Class, Invited lecture.
- *2024.11*	 “Computational Photography and Computational Optics Research”, Beijing University of Posts and Telecommunications, College of AI, Invited lecture.
- *2024.09*	 “Digital adaptive Meta imaging”, Tsinghua University, Department of astronomy, Invited talk.
- *2024.08*	 “Digital adaptive Meta imaging”, Yunnan Observatories Chinese Academy of Sciences, Invited talk.
- *2024.04*	 “Meta imaging and Digital adaptive optics”, Tsinghua University, Department of astronomy, Advanced Observational Astrophysics, Invited lecture.
- *2023.03*	 “An integrated imaging sensor for aberration-corrected 3D photography”, Graduate Forum of the Chinese Optical Society, Tsinghua University, Oral presentation.
- *2022.11*	 “An integrated imaging sensor for aberration-corrected 3D photography”, National Astronomical Observatories (NAOC), Chinese Academy of Sciences, Invited talk.

# 👨‍🏫 Teaching
- Courses I teach at the College of AI will be listed here.

# 🙋 Prospective Students
I am looking for self-motivated students to join me at the **College of AI, Tsinghua University**, to work on physics-informed AI, computational imaging, and AI for astronomy.

- **Ph.D. students** — through Tsinghua's regular and direct-entry admission programs.
- **Master's students** — both research and professional tracks.
- **Undergraduates & visiting interns** — research projects, SRT, and thesis supervision.

Backgrounds in optics, computer vision, deep learning, astronomy, or signal processing are all welcome. If you are interested, please email me at <gyd@tsinghua.edu.cn> with the subject line *[Prospective Student] Your Name*, attaching your CV and transcript.

# 📝 Other Publications
- ***[Cell 2024]*** [Long-term mesoscale imaging of 3D intercellular dynamics across a mammalian organ](https://www.cell.com/cell/fulltext/S0092-8674(24)00917-6)


  Yuanlong Zhang†, Mingrui Wang†, Qiyu Zhu†, **Yuduo Guo**, Bo Liu, Jiamin Li, Xiao Yao, Chui Kong, Yi Zhang, Yuchao Huang, Hai Qi, Jiamin Wu, Zengcai V Guo, Qionghai Dai


- ***[Cell 2021]*** [Iterative tomography with digital adaptive optics permits hour-long intravital observation of 3D subcellular dynamics at millisecond scale](https://doi.org/10.1016/j.cell.2021.04.029)


  Jiamin Wu†, Zhi Lu†, Dong Jiang†, **Yuduo Guo**, Hui Qiao, Yi Zhang, Tianyi Zhu, Yeyi Cai, Xu Zhang, Karl Zhanghao, Hao Xie, Tao Yan, Guoxun Zhang, Xiaoxu Li, Zheng Jiang, Xing Lin, Lu Fang, Bing Zhou, Peng Xi, Jingtao Fan*, Qionghai Dai*.


- ***[Journal of Biomedical Optics]*** [Noise-robust phase-space deconvolution for light-field microscopy](https://www.spiedigitallibrary.org/journals/journal-of-biomedical-optics/volume-27/issue-7/076501/Noise-robust-phase-space-deconvolution-for-light-field-microscopy/10.1117/1.JBO.27.7.076501.full)


  Tianyi Zhu†, **Yuduo Guo†**, Yi Zhang, Zhi Lu, Xing Lin, Lu Fang*, Jiamin Wu*, Qionghai Dai*


- ***[Optica]*** [High-speed in toto 3D imaging with isotropic resolution by scanning light-field tomography](https://opg.optica.org/optica/fulltext.cfm?uri=optica-11-10-1445)


  Yifan Chen†, Jiamin Wu†, Bo Xiong†, Zhi Lu, **Yuduo Guo**, Yi Zhang, Jiaqi Fan, Guihua Xiao, Guoxun Zhang, Xiaopeng Li, Xukang Wang, Zhifeng Zhao, Qionghai Dai*


- ***[Photonics Insights 2026]*** [Computational imaging towards next-generation optical observational astronomy](https://www.researching.cn/articles/OJ533e04bcd6cb775d)

  **Yuduo Guo**, Peixin Weng, Hao Zhang, Chen Zhu, Jun Zhang, Jiamin Wu*, Qionghai Dai*


- ***[Image and Vision Computing 2025]*** [Hybrid Attention Transformers with fast Fourier convolution for light field image super-resolution](https://doi.org/10.1016/j.imavis.2025.105542)

  Zhicheng Ma, **Yuduo Guo**, Zhaoxiang Liu, Shiguo Lian, Sen Wan


- ***[PhotoniX 2022]*** [Multi-focus light-field microscopy for high-speed large-volume imaging](https://doi.org/10.1186/s43074-022-00081-1)


  Yi Zhang†, Yuling Wang†, Mingrui Wang, **Yuduo Guo**, Xinyang Li, Yifan Chen, Zhi Lu, Jiamin Wu*, Xiangyang Ji*, Qionghai Dai*


- ***[AVFOP 2018; Portland, USA]*** *[Oral]* [Large Bandwidth Channelized RF Receiver Based on Chirped Pulses Mixing](https://ieeexplore.ieee.org/document/8550467)


  **Yuduo Guo**, Feifei Yin, Kun Xu, Yitang Dai*

