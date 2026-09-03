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

* I am an associate researcher (postdoctor) at [the Institute of Artificial Intelligence, Hefei Comprehensive National Science Center](https://iai.ustc.edu.cn/iai/index.html). My collaborative supervisors are Prof. [Qi Liu](http://staff.ustc.edu.cn/~qiliuql/), and Prof. [Xun Chen](http://staff.ustc.edu.cn/~xunchen/).
* I received my Ph.D. degree in Data Science from the University of Science and Technology of China in July 2024, supervised by Prof. [Enhong Chen](http://staff.ustc.edu.cn/~cheneh/),  and received my Bachelor degree in Measurement and Control Technology and Instrument from Wuhan University in July 2018. 
* My research interests include data mining, knowledge discovery, user modeling, and intelligent education. <strong>If you have any questions regarding my research, or may be interested in potential collaboration, or would like to discuss any other matters, please do not hesitate to contact me. I look forward to the opportunity to cooperate with you.</strong>

<div class="content-grid" markdown="1">

<div class="main-column" markdown="1">

<h2 id="selected-publications">📝 Selected Publications</h2>
<p><em>( ✉ Corresponding Author, † Equal Contribution )</em></p>

{% for paper in site.data.publications %}
<div class="paper-box">
  <div class="paper-box-image">
    <img src="{{ paper.image }}" alt="Paper Overview">
  </div>
  <div class="paper-box-text">
    <p><a href="{{ paper.link }}">{{ paper.title }}</a></p>
    <p>{{ paper.authors }}</p>
    <p>{{ paper.venue }}</p>
    <p class="paper-intro">{{ paper.intro }}</p>
  </div>
</div>
{% endfor %}




# 🎖 Honors and Awards {#honors-and-awards}
- *2023*: The Special Prize of President Scholarship of Postgraduate Students. 
- *2023*: China National Scholarship.
- *2023*: Best Applied Paper of CCF BigData2023.
- *2023*: Top 1 in the [AAAI'2023 Global Knowledge Tracing Challenge](https://ai4ed.cc/competitions/aaai2023competition).
- *2023*: Top 4 in Task 2 of the [Baidu 2023 CTI Challenge](https://aistudio.baidu.com/aistudio/projectdetail/6120125).
- *2022*: Top 1 in Task 4 of the [NeurIPS'2022 CausalML Challenge](https://eedi.com/projects/neurips-2022). 
- *2022*: Top 1 in Track 1 and Track 2 of the first phase, and Top 1 in Track 1, Top 2 in Track 2 of the second phase, of the [EDM'2022 2nd CSEDM Data Challenge](https://eedi.com/projects/neurips-2022).
- *2021*: Top 10 in Task 1 of the [Tecent 2021 Advertising Algorithm Challenge](https://algo.qq.com/).
- *2020*: Top 1 in Task 2 of the [NeurIPS 2020 Education Challenge](https://eedi.com/projects/neurips-education-challenge).


# 📖 Educations {#educations}
- *2018.09 - 2024.06*, School of Artificial Intelligence and Data Science, University of Science and Technology of China. 
- *2014.09 - 2018.06*, School of Electronic Information, Wuhan University. 

# 💬 Services {#services}
- *Journal Reviewer*

    * IEEE Transactions on Knowledge and Data Engineering
    * IEEE Transactions on Neural Networks and Learning Systems
    * IEEE Transactions on Systems, Man, and Cybernetics publication information
    * IEEE Transactions on Learning Technologies
    * IEEE Transactions on Emerging Topics in Computational Intelligence
    * ACM Transactions on Information Systems
    * Expert Systems with Applications
    * Knowledge-Based Systems
    * Information Processing and Management

- *Program Committee Member*

    * SIGIR
    * AAAI
    * KDD
    * IJCAI
    * TheWebConf

# 💻 Internships {#internships}
- *2018.03 - 2018.08*, [IflyTek](https://www.iflytek.com/en/), Hefei, China.
- *2017.07 - 2017.09*, [Tsmc](https://www.tsmc.com/schinese), Shanghai, China.
</div>

<div class="side-column" markdown="1">

<div class="news-box" markdown="1">

# 🔥 News {#news}

- *2026.06*: 🎉🎉 One paper "Towards higher quality and fewer hallucinations: A multi-agent collaboration framework for LLMs" accepted by Information Processing & Management.
- *2026.05*: 🎉🎉 One paper "基于视觉语言模型的多模态学生参与度预测方法" accepted by Acta Automatica Sinica (自动化学报).
- *2026.04*: 🎉🎉 One paper accepted by SIGIR 2026.
- *2026.01*: 🎉🎉 One paper accepted by ACM Transactions on Information Systems.
- *2025.12*: 🎉🎉 One paper accepted by IEEE Transactions on Multimedia.
- *2025.08*: 🎉🎉 One paper accepted by Information Processing & Management.
- *2025.07*: 🎉🎉 One paper accepted by Neural Networks.
- *2025.04*: 🎉🎉 One paper accepted by Knowledge-Based Systems.
- *2024.12*: 🎉🎉 One paper accepted by AAAI 2025.
- *2024.11*: 🎉🎉 One paper accepted by KDD 2025.

</div>

</div>

</div>
