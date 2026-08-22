---
permalink: /
title: "李志坚"
excerpt: "welcome to my homepage!"
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


# 👨‍🎓 About Me
 &nbsp; &nbsp; I'm **Zhijian Li**, a graduate from [ShanDong University](https://www.wh.sdu.edu.cn/). And I am currently a Ph.D. student at the Key Laboratory of Target Cognition and Application Technology,  [Aerospace Information Research Institute, Chinese Academy of Sciences(**AIRCAS**)](http://www.aircas.cn/). My doctoral research is jointly supervised by [Prof. Fu Kun](http://www.aircas.ac.cn/sourcedb/cn/expert/yjy/201811/t20181106_5165762.html) and [Prof. Chao Ren](https://people.ucas.ac.cn/~renchao).

&nbsp; &nbsp;My main research interests include:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- World Models for Space Robot Learning  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Remote Sensing Image Interpretation  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Agentic AI in Remote Sensing
​				 


# 🔥 News
- 2026.08: &nbsp;🎉🎉 One Paper was accepted by AP-GARSS 2026. This marks my first research paper accepted for publication.

- *2025.05*: &nbsp;🎉🎉 通过学士学位论文答辩，获得"山东大学优秀本科毕设论文"称号

- *2024.12*: &nbsp;🎉🎉 获得山东大学本科生最高荣誉"校长奖(综合)"

- *2024.09*: &nbsp;🎉🎉 推免至中国科学院空天信息创新研究院（AIRCAS）攻读博士学位

  <!--*2024.10*: &nbsp;🎉🎉 顺利通过学校答辩，获得本科生“詹天佑”奖学金-->

  <!--*2024.10*: &nbsp;🎉🎉 顺利通过学院答辩，连续三年蝉联本科生国家奖学金-->

  <!--*2024.07*: &nbsp;🎉🎉 获得北京大学软件与微电子学院夏令营“优秀营员（高端芯片方向）”称号 -->



# 📝 Publications 
<div class="paper-box publication-card">
  <div class="paper-box-image">
    <div class="publication-thumbnail">
      <span class="badge">AP-GARSS 2026</span>
      <img src="{{ '/assets/paper_abstract/Orbit_Planner.png' | relative_url }}" alt="Overview of the Orbit-Planner framework">
    </div>
  </div>
  <div class="paper-box-text">
    <span class="publication-year" aria-hidden="true">2026</span>
    <h3 class="publication-title">Orbit-Planner: Towards Latent World Models for On-Orbit Obstacle Avoidance of Satellite Agents</h3>
    <p class="publication-authors"><strong><u>Zhijian Li</u></strong>, Chao Ren, Peijin Wang, Xian Sun</p>
    <p class="publication-venue"><em>IEEE Asia-Pacific Geoscience and Remote Sensing Symposium (AP-GARSS)</em>, 2026</p>
    <nav class="publication-links" aria-label="Orbit-Planner resources">
      <button class="publication-button" type="button" aria-expanded="false" aria-controls="orbit-planner-abstract">Abstract</button>
      <a class="publication-button" href="https://arxiv.org/pdf/2608.16651" target="_blank" rel="noopener noreferrer">arXiv</a>
      <a class="publication-button" href="https://github.com/ZhijianLi2003/Orbit_Planner" target="_blank" rel="noopener noreferrer">Code</a>
      <a class="publication-button" href="https://zhijianli2003.github.io/Orbit_Planner/" target="_blank" rel="noopener noreferrer">Project Page</a>
    </nav>
    <div class="publication-abstract" id="orbit-planner-abstract" hidden>
      <p>Satellite agents for on-orbit navigation tasks need to predict collision risks using limited onboard observations. However, conventional planners often rely on predefined maps and fixed environmental assumptions, limiting their adaptability in dynamic on-orbit scenarios. In this paper, we propose Orbit-Planner, a two-stage latent world model for on-orbit obstacle avoidance. Orbit-Planner learns action-conditioned spacecraft dynamics to perform future-state rollouts in latent space, and introduces a Physics Probe to decode physical state changes from imagined latent trajectories. Experiments demonstrate that Orbit-Planner can perform long-horizon latent rollouts and recover physical states from imagined trajectories. In closed-loop obstacle-avoidance navigation in Isaac Sim, it attains a success rate of 91.7%.</p>
    </div>
  </div>
</div>

<script>
document.querySelectorAll('.publication-button[aria-controls]').forEach(function (button) {
  button.addEventListener('click', function () {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    var willOpen = panel.hidden;
    panel.hidden = !willOpen;
    button.setAttribute('aria-expanded', String(willOpen));
  });
});
</script>

# 🏆 Competition Projects
<!-- <div class='paper-box'><div class='paper-box-image'><div><div class="badge">The 18th Undergraduate Smart Car Competition</div><img src='images/5G_Project .png' alt="sym" width="100%"></div></div> -->

<!-- <div class='paper-box-text' markdown="1">
**5G Outdoor Autonomous Vehicle With Multi-sensor Fusion(Undergraduate Project)**-->

<!--**Zhijian Li**, Zhang Yu, Tianyu Zhou, Yanmao He, Yuesheng Liu-->

<!-- **Contents**<strong><span class='show_paper_citations' data='DhtAFkwAAAAJ:ALROH1vI_8AC'></span></strong>-->



<!--GNSS/INS Combination Positioning based on EKF.-->

<!--Visual Navigation based on CV-->

<!--Stanley Path Tracking and Fuzzy PID Control-->

<!--Sound Source Location based on TDOA-->

<!--Drive brushless DC electric Motor(BLDC)-->




- [First Prize of 2024 Provincial Undergraduate Electronic Design Competition](https://zhijianli2003.github.io/images/2024H.jpg) (We are invited by Texas Instruments and recorded the video.), **Zhijian Li**, Haoran Chen, Tianyu Zhou,  &nbsp;2024.08,&nbsp;Shandong,&nbsp;China &nbsp;[![GitHub](https://img.shields.io/badge/GitHub-code-181717.svg?logo=github)](https://github.com/ZhijianLi2003/ZLC_MSPM0_Peripheral_Library) [![](https://img.shields.io/badge/Bilibili-Video-yellow?logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1UJzgY7E3s/)
- [First Prize of 18th National University Student Smart Car Competition(5G Autonomous Driving Group, National runner-up🥈)](https://zhijianli2003.github.io/images/first_prize.png), **Zhijian Li**, Zhang Yu, Tianyu Zhou, Yanmao He, Yuesheng Liu, &nbsp;2023.12,&nbsp;Chongqing,&nbsp;China

# 📖 Educations and Work experience
- ***2025.09 - now***,  &nbsp;Ph.D.student(Supervisor: [Prof. Fu Kun](http://www.aircas.ac.cn/sourcedb/cn/expert/yjy/201811/t20181106_5165762.html) and [Prof.Chao Ren](https://people.ucas.ac.cn/~renchao)), &nbsp;Aerospace Information Research Institute,&nbsp; Chinese Academy of Sciences,&nbsp; Beijing, &nbsp;China
- ***2021.09 - 2025.06***,  &nbsp;B.Eng. in Electronic Science and Technology, &nbsp;School of Mechanial, Electrical and Information Engineering, &nbsp;Shandong University, &nbsp;Weihai,&nbsp; China. 


# 🏅 Honors and Awards
- *2025.05* Outstanding thesis(bachelor's degree) of Shandong University(Top 2%)
- *2024.12* President's Award of Shandong University ([the highest undergraduate award of Shandong University](https://zhijianli2003.github.io/images/president_award.jpg))
- *2024.10* "ZhanTianYou" Scholarship, ZhanTianYou Development Foundation of Science and Technology ([39 undergraduate students in China](https://zhijianli2003.github.io/images/2024_ZhanTianYou_Scholarship.pdf))
- *2024.12* National Scholarship for Undergraduate Student in 2022, 2023 and 2024([Top 1%](https://zhijianli2003.github.io/images/national_scholarship.jpg))
- *2024.05* Excellent University Student of Shandong Province.([certificate](https://zhijianli2003.github.io/images/shandong_excellent.jpg))


# 💬 Talk and Contact
- *2024.11*, video:["我们把小车题做到了极致！3年电赛，冲刺最高奖！"](https://www.bilibili.com/video/BV1UJzgY7E3s/?vd_source=cc6e1299ec907ed5efddd8a4591377e3). 
- *2025.05*, Talk:["志远笃行，攻坚克难——励志成为卓越的工程师(山东大学推文)"](https://mp.weixin.qq.com/s/6r0P3yXkhDmAeeeBova38A).
- *Email:* [lizhijian25@mails.ucas.ac.cn](lizhijian25@mails.ucas.ac.cn)
- *github:* [ZhijianLi2003](https://github.com/ZhijianLi2003)
- *gitee:* [warrior_Li](https://gitee.com/warrior_Li)
