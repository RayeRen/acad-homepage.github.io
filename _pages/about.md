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


<head> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/v4-shims.js"></script> 
</head> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">


 Hello! Husky Here!  I'm currently an undergraduate student at [Shanghai Jiao Tong University](https://en.sjtu.edu.cn/)(SJTU), majored in Computer Science. 

As a research assistant at the  [SJTU Interpretable ML Lab](https://sjtu-xai-lab.github.io/), I'm under the supervision of Prof. [Quanshi Zhang](http://qszhang.com/).



 
<!--My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top international AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>).-->




# 📝 Publications 
<div class="paper-box">
  <div class="paper-box-image">
    <div>

      <img src="images/sharedInteraction.png" alt="sym" width="100%">
    </div>
  </div>
  <div class="paper-box-text">
    <p><strong>Defining and extracting generalizable interaction primitives from DNNs</strong></p>

    <p>Lu Chen Lu, Siyu Lou, Benhao Huang, Quanshi Zhang </p>

<p><b><a href="https://openreview.net/forum?id=OCqyFVFNeF">(OpenReview)</a></b></p>
<p>Given different DNNs trained for the same task, we develop a method to extract their shared interactions. I was actively involved in the algorithm design and implementation process, and was responsible for the visualization work in the paper.</p>
  </div>
</div>

# 🔥 Undergraduate Projects
<div class="paper-box">
  <div class="paper-box-image">
  <div>
  <div class="badge">ICE2601</div>
  <img src="images/ICE2601.png" width="100%"></div>
  </div>
  <div class="paper-box-text">
    <p><a href="https://github.com/huskydoge/Exploration-on-Adaptive-Huffman">Adaptive Huffman Coding: Analysis and Applications</a></p>

    <p><i class="fab fa-fw fa-github" aria-hidden="true"></i> <a href="https://huskydoge.github.io/pdfs/Information_theory_paper%20.pdf"> GitHub</a>｜<svg t="1697827623726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4093" width="16" height="16"><path d="M582.4 864H170.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V170.666667c0-6.4 4.266667-10.666667 10.666667-10.666667h309.333333V320c0 40.533333 34.133333 74.666667 74.666667 74.666667h160v38.4c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V298.666667c0-8.533333-4.266667-17.066667-8.533334-23.466667l-170.666666-170.666667c-6.4-6.4-14.933333-8.533333-23.466667-8.533333H170.666667C130.133333 96 96 130.133333 96 170.666667v682.666666c0 40.533333 34.133333 74.666667 74.666667 74.666667h411.733333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z m132.266667-550.4v17.066667H554.666667c-6.4 0-10.666667-4.266667-10.666667-10.666667V160h19.2l151.466667 153.6z" fill="#666666" p-id="4094"></path><path d="M332.8 533.333333c-12.8 0-19.2 2.133333-25.6 6.4-6.4 4.266667-8.533333 12.8-8.533333 23.466667v206.933333c0 6.4 2.133333 12.8 6.4 19.2 4.266667 4.266667 10.666667 8.533333 21.333333 8.533334s17.066667-4.266667 21.333333-8.533334c4.266667-4.266667 6.4-10.666667 6.4-19.2v-64h32c57.6 0 89.6-29.866667 89.6-87.466666 0-27.733333-8.533333-51.2-23.466666-64-14.933333-14.933333-36.266667-21.333333-66.133334-21.333334h-53.333333z m87.466667 85.333334c0 12.8-2.133333 23.466667-8.533334 27.733333-4.266667 4.266667-14.933333 8.533333-27.733333 8.533333h-32v-70.4H384c12.8 0 21.333333 2.133333 27.733333 8.533334 6.4 4.266667 8.533333 12.8 8.533334 25.6zM667.733333 571.733333c-8.533333-12.8-21.333333-21.333333-34.133333-29.866666-14.933333-4.266667-32-8.533333-51.2-8.533334h-61.866667c-8.533333 0-17.066667 0-23.466666 8.533334-2.133333 4.266667-4.266667 10.666667-4.266667 19.2V768c0 8.533333 2.133333 14.933333 4.266667 19.2 6.4 8.533333 14.933333 8.533333 23.466666 8.533333h64c19.2 0 34.133333-4.266667 49.066667-10.666666 12.8-6.4 25.6-17.066667 34.133333-29.866667 8.533333-12.8 14.933333-25.6 19.2-42.666667 4.266667-14.933333 6.4-32 6.4-49.066666 0-17.066667-2.133333-34.133333-6.4-49.066667-4.266667-14.933333-10.666667-29.866667-19.2-42.666667z m-42.666666 153.6c-8.533333 12.8-21.333333 19.2-38.4 19.2h-38.4v-160H576c21.333333 0 38.4 6.4 46.933333 19.2 10.666667 12.8 14.933333 34.133333 14.933334 59.733334 2.133333 27.733333-4.266667 46.933333-12.8 61.866666zM851.2 533.333333h-106.666667c-8.533333 0-17.066667 2.133333-21.333333 6.4-6.4 4.266667-8.533333 12.8-8.533333 21.333334v209.066666c0 6.4 2.133333 12.8 6.4 17.066667 4.266667 6.4 10.666667 8.533333 21.333333 8.533333 8.533333 0 17.066667-2.133333 21.333333-8.533333 2.133333-4.266667 6.4-8.533333 6.4-19.2v-85.333333h72.533334c12.8 0 23.466667-6.4 25.6-17.066667 2.133333-8.533333 2.133333-14.933333 0-17.066667-2.133333-4.266667-6.4-17.066667-25.6-17.066666H768v-49.066667h81.066667c8.533333 0 14.933333-2.133333 19.2-4.266667 4.266667-2.133333 8.533333-8.533333 8.533333-21.333333 2.133333-12.8-8.533333-23.466667-25.6-23.466667z" fill="#666666" p-id="4095"></path></svg> <a href="https://huskydoge.github.io/pdfs/Information_theory_paper%20.pdf">PDF</a>｜<svg t="1697827676265" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4123" width="16" height="16"><path d="M354.40128 0c-87.04 0-157.44 70.55872-157.44 157.59872v275.68128H78.72c-21.6576 0-39.36256 17.69984-39.36256 39.36256v236.31872c0 21.6576 17.69984 39.35744 39.36256 39.35744h118.24128v118.08256c0 87.04 70.4 157.59872 157.44 157.59872h472.63744c87.04 0 157.59872-70.55872 157.59872-157.59872V315.0336c0-41.74848-38.9888-81.93024-107.52-149.27872l-29.11744-29.12256L818.87744 107.52C751.5392 38.9888 711.39328 0 669.59872 0H354.4064z m0 78.72h287.20128c28.35456 7.0912 27.99616 42.1376 27.99616 76.8v120.16128c0 21.6576 17.69984 39.35744 39.36256 39.35744h118.07744c39.38816 0 78.87872-0.0256 78.87872 39.36256v512c0 43.32032-35.55328 78.87872-78.87872 78.87872H354.4064c-43.32544 0-78.72-35.5584-78.72-78.87872v-118.08256h393.91744c21.66272 0 39.36256-17.69472 39.36256-39.35744V472.64256c0-21.66272-17.69984-39.36256-39.36256-39.36256H275.68128V157.59872c0-43.32032 35.39456-78.87872 78.72-78.87872zM165.60128 500.96128h43.19744c20.48 0 35.84 4.48 46.08 13.44 10.24 8.32 15.36 21.12 15.36 38.4s-5.43744 31.03744-16.31744 41.27744c-10.88 9.6-26.88 14.40256-48 14.40256h-18.24256v68.15744h-22.07744V500.96128z m142.08 0h43.19744c20.48 0 35.84 4.48 46.08 13.44 10.24 8.32 15.36 21.12 15.36 38.4s-5.43744 31.03744-16.31744 41.27744c-10.88 9.6-26.88 14.40256-48 14.40256h-18.24256v68.15744h-22.07744V500.96128z m120.96 0h121.91744v20.15744h-49.92v155.52H478.5664v-155.52h-49.92v-20.15744z m-240.96256 19.2v69.12h15.36c16 0 27.20256-2.88256 33.60256-8.64256 7.04-5.76 10.55744-14.72 10.55744-26.88 0-10.88-3.51744-19.2-10.55744-24.96-6.4-5.76-16.32256-8.63744-29.76256-8.63744h-19.2z m142.08 0v69.12h15.36c16 0 27.20256-2.88256 33.60256-8.64256 7.04-5.76 10.55744-14.72 10.55744-26.88 0-10.88-3.51744-19.2-10.55744-24.96-6.4-5.76-16.32256-8.63744-29.76256-8.63744h-19.2z" p-id="4124"></path></svg> <a href="https://huskydoge.github.io/pdfs/Presentation.pdf">PPT </a> </p>

    <p>Information Theory course project: Exploring the application of Adaptive-Huffman. I was responsible for the theoretical exploration of adaptive Huffman coding and the attempt to apply adaptive Huffman coding to incremental learning in the CBOW model. </p>
  </div>
</div>

<div class="paper-box">
  <div class="paper-box-image">
  <div>
  <div class="badge">ICE2604</div>
  <img src="images/ICE2604.png" width="100%"></div>
  </div>
  <div class="paper-box-text">
    <p><a href="https://github.com/huskydoge/SJTU-Classroom">SJTU Classroom Board</a></p>

    <p><i class="fab fa-fw fa-github" aria-hidden="true"></i> <a href="https://github.com/huskydoge/SJTU-Classroom"> GitHub</a>｜<svg t="1697827547489" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1481" width="16" height="16"><path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z" p-id="1482"></path></svg> <a href="https://www.bilibili.com/video/BV1mM411M7df/?spm_id_from=333.999.0.0&vd_source=0e9edb7c93e95f3ed43602444f3a83e7"> Bilibili</a>
</p>
    <p> A website designed to display classroom data such as seat number, CO2 concentration, temperature, etc. It aims to help student choose a proper self-study classroom. I was responsible for the whole development of the front and back of the website.   </p>
  </div>
</div>


# 📇 Experiences

<div class="paper-box-right">
  <div class="paper-box-text">
    <p><a href="https://sjtu-xai-lab.github.io/#c5">Lab for Interpretability and Theory-Driven Deep Learning</a></p>

    <p>Research undergraduate, <em>2023.4 - (now)</em></p>

    <p>Advisor: <a href="http://qszhang.com/">Quanshi Zhang</a></p>
  </div>
  <div class="paper-box-image">
    <div>
      <a href="https://sjtu-xai-lab.github.io/#c5">
      <img src="images/xai.png" alt="sym" width="200px" style="padding: 10px">
      </a>
    </div>
  </div>
</div>






# 🎖 Honors and Awards
- *2022*, Shao Qiu Scholarship （10000¥，rank 5/129)
- *2023*, Rui Yuan Hong Shan Scholarship (20000¥，rank 3/129)


# 📖 Educations
- *2021.09 - (now)*, Shanghai Jiao Tong University, Shanghai, China
- *2018.09 - 2021.07*, Zhejiang Ruian High School, Zhejiang, China



# 🌇 Life and Interests


* I'm a fan of anime, I've dabbled in a lot of good anime, such as <span class="tooltip">Attack on Titan
       	 <span class="tooltiptext">
       	   <img src="https://ts1.cn.mm.bing.net/th/id/R-C.1acea02f35d8b723e07f11e0d55b0f94?rik=bvvDZgYAedOJVw&riu=http%3a%2f%2fwomenwriteaboutcomics.com%2fwp-content%2fuploads%2f2015%2f04%2fAttack-on-Titan.jpg&ehk=%2fQ8faZZYP5a8JKEVp9lNgu277ciGeutvbEN3lK2LnZU%3d&risl=&pid=ImgRaw&r=0" ><br>
                       <a href="https://attackontitan.fandom.com/wiki/Attack_on_Titan_Wiki"> Attack on Titan Wiki</a>
       	 </span>
</span>, <span class="tooltip">Jujutsu Kaisen
       	 <span class="tooltiptext">
       	   <img src="https://th.bing.com/th/id/OIP.eNetLcjkK9vqVZuEL1TZzQHaEY?pid=ImgDet&rs=1" ><br>
            <a href="https://jujutsu-kaisen.fandom.com/wiki/Jujutsu_Kaisen">Jujutsu Kaisen Wiki</a>
       	 </span>
</span>; But my favourite one is called <span class="tooltip"> Pantheon
       	 <span class="tooltiptext">
       	   <img src="https://th.bing.com/th/id/R.df61f2bfe6c56aa5b4ebddd0932e343d?rik=ubkrDbb6pMKvrA&pid=ImgRaw&r=0" ><br>
            <a href="https://en.wikipedia.org/wiki/Pantheon_(TV_series)">Pantheon (TV series)</a>
       	 </span>
</span>, which discussed Uploaded Intelligence(UI) and the relevant ethical problems.
* As for sports, I like running and have comleted one-semester orienteering course of SJTU. Besides, I often play badminton and go to gym regularly with my friends.

<center>
    <script type='text/javascript' id='clustrmaps' src='//cdn.clustrmaps.com/map_v2.js?cl=080808&w=a&t=tt&d=KsX45ylDjq2_61A1AolUOdbXxnUJf4u2QvsJIkBT68U&co=ffffff&ct=808080&cmo=07d5ff&cmn=07f707'></script>
  
  </center>

<br>
<br>


<head> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script> 
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/v4-shims.js"></script> 
</head> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">


