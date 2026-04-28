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

Hi,I'm Yucheng Li, a year-3 master stduent advised by [**Yanan Wang**](https://scholar.google.com/citations?user=iFxl5vwAAAAJ&hl=zh-CN&oi=sra) in Donghua University, Shanghai. As a member of [**NewSense Research Lab**](https://hci-newsense.org/), my research focuses on **Human-Computer Interaction (HCI)**, creating **immersive** and **multi-sensory experiences**, with an emphasis on <span class="red-text">**Interaction Design**</span>, <span class="red-text">**User Experience**</span> and <span class="red-text">**Virtual reality**</span>. I am particularly interested in developing innovative ways to enhance sensory feedback, such as through *material driven design(MDD)* to create olfactory feedback in specific people or scanio, to bridge the gap between physical and digital environments. 

I aim to design intuitive interfaces that enable users to engage more naturally feedback in virtual environments. My work spans experimental <span class="red-text">hardware development</span>, <span class="red-text">user-centered design</span>, and evaluating multi-sensory interfaces to explore how digital interactivity can be both enriching and intuitive.

So far, I cultivated my interest in HCI more focous on olfactory interaction by exploring a range of topics. Gradually, I found they formed three aspects: (1) **Hardware-driven olfactory design** – developing natural scent-release mechanisms for embodied olfactory displays (IJHCI). (2) **Contextual olfactory feedback** – studying how scent stimuli alter experiences in diverse VR scenarios (CHI’25, IJHCI). (3) **Crossmodal perception and multisensory integration** – examining how visual, tactile, and olfactory cues interact to shape immersion and presence (CHI’25).

<!-- My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>). -->


# 🔥 News
- *2025.10* &nbsp;🌟 Excited to share that I was awarded the National Scholarship (2%) at Donghua University.
- *2025.10* &nbsp;🎉 Two co-authores' posters were accepted by UIST’25! Congrats to [Qimeng](https://doi.org/10.1145/3746058.3758447) and [Yanzi](https://doi.org/10.1145/3746058.3758432)!
- *2025.09* &nbsp;✨ Submitted my first-author paper to CHI 2026！
- *2025.04* &nbsp;🥳 Excited to my first CHI in Yokohama, Japan🇯🇵! 
- *2025.04* &nbsp;🎉 Our paper [*'AromaBite: Augmenting Flavor Experiences Through Edible Retronasal Scent Release'*](https://doi.org/10.1145/3746058.3758447) was accapted by CHI! Many thanks to my co-authors!
- *2025.04* &nbsp;🎉 Congrats to a co-authored paper [*'MorphingScents: Fabricating Thin, Flexible, and Shape-Changing Odor-Emitting Mechanism for Interactive Olfactory Encounters'*](https://www.tandfonline.com/doi/epdf/10.1080/10447318.2024.2427407?needAccess=true) was accapted by IJHCI!
- *2025.01* &nbsp;🎉 Congrats to a co-authored paper [*'Mid-Air Gestures for Proactive Olfactory Interactions in Virtual Reality'*](https://dl.acm.org/doi/pdf/10.1145/3706598.3713964) was accapted by CHI!
- *2024.10* &nbsp;😋 I was invited to be a reviewer for ChineseCHI 2025! 
- *2024.09* &nbsp;🎉 Our paper [*‘ScentClue: Enhancing Story Engagement in Virtual Reality Through Hedonically Varied Olfactory Hints’*](https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2397173) was accapted by IJHCI! This is my first pulished paper! Thanks for Dr. Wang teaching and labmates' help!
- *2024.08* &nbsp;🎉 Our paper [*'Review on Olfactory Display Technology'*]() was accapted as the cover artical by Package engineering!
- *2024.02* &nbsp;🎉 Congrats to a co-authored paper [*'OdorCarousel: A Design Tool for Customizing Smell Enhanced Virtual Experiences'*](https://www.tandfonline.com/doi/full/10.1080/10447318.2024.2314818?scroll=top&needAccess=true) was accapted by IJHCI!

# 📝 Publications 
<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">CHI'25</div>
      <a href='https://dl.acm.org/doi/10.1145/3706599.3720200'>
        <img src='images/AromaBite.jpg' alt="AromaBite" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**AromaBite: Augmenting Flavor Experiences Through Edible Retronasal Scent Release**](https://dl.acm.org/doi/pdf/10.1145/3706599.3720200)

**Yucheng Li**, Yanan Wang, Mengyuan Xiong, Max Chen, Yifan Yan, Junxian Li, Qi Wang, Preben Hansen

<!-- *Project* -->
- An edible scent-releasing interfaces providing retronasal feedback for immersive experience in dining scanio.
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">IJHCI</div>
      <a href='https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2397173'>
        <img src='images/ScentClue.png' alt="ScentClue" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**ScentClue: Enhancing Story Engagement in Virtual Reality Through Hedonically Varied Olfactory Hints**](https://www.tandfonline.com/doi/epdf/10.1080/10447318.2024.2397173?needAccess=true)

Yanna Wang, **Yucheng Li**, Mingyi Yuan, Xiang Fei, Shihang Ma, Preben Hansen 

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- Explored the effect of hedonic olfactory cues on emotional engagement and narrative immersion in VR storytelling based on a self-filmed suspense short film. 
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">UIST'25</div>
      <a href='https://dl.acm.org/doi/10.1145/3746058.3758432'>
        <img src='images/Visualeffect.png' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**Designing Visual Effects to Fabricate Olfactory Experiences in Augmented Reality**](https://dl.acm.org/doi/pdf/10.1145/3746058.3758432)

Yanzi Zhu, **Yucheng Li**, Yanan Wang

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- Exploring cross-modal dynamic visual effects to simulate olfactory experiences without physical scent emission, offering a scalable alternative to hardware-dependent solutions while expanding AR applications in scent simulation.
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">UIST'25</div>
      <a href='https://dl.acm.org/doi/10.1145/3746058.3758447'>
        <img src='images/Illusion.png' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**Exploring Olfactory Illusion of Virtual Objects Using Fewer Odor Sources**](https://dl.acm.org/doi/pdf/10.1145/3746058.3758447)

Qimeng Cui, Yanan Wang,**Yucheng Li**

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- Applying olfactory illusion to enable a single scent material to be perceived as multiple objects in a VR environment. 
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">CHI'25</div>
      <a href='https://dl.acm.org/doi/10.1145/3706598.3713964'>
        <img src='images/Mid-air.png' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**Mid-Air Gestures for Proactive Olfactory Interactions in Virtual Reality**](https://dl.acm.org/doi/pdf/10.1145/3706598.3713964)

Junxian Li, Yanan Wang, Zhitong Cui, Jas Brooks, Yifan Yan, Zhengyu Lou, **Yucheng Li**

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- Developing a user-defned gesture set for proactive interacting with scents in Virtual Reality (VR), aiming participants enhancing user experience, presence, and task performance.
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">IJHCI</div>
      <a href='https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2314818'>
        <img src='images/Odorcarousel.png' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**OdorCarousel: A Design Tool for Customizing Smell-Enhanced Virtual Experiences**](https://www.tandfonline.com/doi/full/10.1080/10447318.2024.2314818?scroll=top&needAccess=true)

Xiang Fei, Yanna Wang, **Yucheng Li**, Zhengyu Lou, Yifan Yan, Yujing Tian, Qingjun Chen

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- Developing a tiny（*diameter 50mm，weight<60g*）, VR-based, 25 scent-storage olfactory display as a design tool for non-expert users.  
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">IJHCI</div>
      <a href='https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2443239'>
        <img src='images/MorphingScents.png' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**MorphingScents: Fabricating Thin, Flexible, and Shape-Changing Odor-Emitting Mechanism for Interactive Olfactory Encounters**](https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2443239)

Yifan Yan, Yanna Wang, Mingyi Yuan, **Yucheng Li**, Yilin Shao, Guanyun Wang, Qi Wang, Yujing Tian

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
- A thin-film, five-layer, flexible, shape-changing heating-driven odor-emitting mechanism, aiming to provide lightweight, intricate, dynamic, and aesthetic olfactory displays and experiences. 
</div>
</div>

<div class='paper-box'>
  <div class='paper-box-image'>
    <div>
      <div class="badge">Packaging Engineering</div>
      <a href='https://www.tandfonline.com/doi/abs/10.1080/10447318.2024.2443239'>
        <img src='images/Review.jpg' alt="waiting" width="100%">
      </a>
    </div>
  </div>
  <div class='paper-box-text' markdown="1">

[**Review on Olfactory Display Technology**]('images/Olfactory Display Review,pdf') 

Yanna Wang, Yifan Yan, **Yucheng Li**, Yizhong Chen, Qingjun Chen

<!-- [**Project**](https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=DhtAFkwAAAAJ&citation_for_view=DhtAFkwAAAAJ:ALROH1vI_8AC) <strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong> -->
<div class="badge">Cover Airtle</div> 
</div>
</div>

<!-- - [Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet](https://github.com), A, B, C, **CVPR 2020** -->

# 🎖 Honors and Awards
- *2025.10* &nbsp;💡 National Scholarship of China (<2%, top award in China) 
- *2025.05* &nbsp;🏆 Third prize, Shangha region, *Milan Design Week China Collegiate Design Competition & Exhibition* (Topic: Static Media)
- *2024.08* &nbsp;🏆 Third prize, Shangha region, *Milan Design Week China Collegiate Design Competition & Exhibition* (Topic: Multisensory immersive olfactory display)
- *2024.05* &nbsp;🏆 Second prize, Shanghai region, *CHINA CREATIVE CHALLENGES CONTEST（3C）*(Topic: Enhancing immersive experience by multi scent releasing)
- *2023.06* &nbsp;🌟 Excellent Design and Thesis Award for Bachelor’s Degree (Research Topic: Visualization of traditional festivel)
- *2022.10* &nbsp;💡 Second Prize Academic Scholarship (<10%) and Excellent Graduate Student
- *2022.05* &nbsp;🏆 National second prize, *CHINA CREATIVE CHALLENGES CONTEST（3C)*（<2%）
- *2021.10* &nbsp;💡 Second Prize Academic Scholarship (<10%) and Excellent Graduate Student
- *2021.08* &nbsp;🏆 National second prize, *College Student Computer Design Competition*（<2%）
- *2020.10* &nbsp;💡 National Endeavor Scholarship (<5%, WHUT) and Excellent Graduate Student

# 📖 Educations
- *2023-2026 (now)*, Master of Art in Design, Digital Media, Donghua Univeristy.
- *2019-2023*, Bachelor of Art in Design, Visual Communication Design, Wuhan University of Technology (WHUT).

# 💬 Invited Talks
- *2025.08*, 	Invited Talk at HHME, in Dalian, China. 🇨🇳 

<!-- # 🍀 Life
-  -->
