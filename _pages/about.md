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

As a research undergraduate at the  [SJTU Interpretable ML Lab](https://sjtu-xai-lab.github.io/), I'm under the supervision of Prof. [Quanshi Zhang](http://qszhang.com/).



 
<!--My research interest includes neural machine translation and computer vision. I have published more than 100 papers at the top undergraduateational AI conferences with total <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'>google scholar citations <strong><span id='total_cit'>260000+</span></strong></a> (You can also use google scholar badge <a href='https://scholar.google.com/citations?user=DhtAFkwAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>).-->




# 📝 Publications 
<div class="paper-box">
  <div class="paper-box-image">
    <div>

      <img src="images/sharedInteraction.png" alt="sym" width="100%">
    </div>
  </div>
  <div class="paper-box-text">
    <p><strong>Defining and extracting generalizable interaction primitives from DNNs</strong></p>

    <p>Lu Chen Lu, Siyu Lou, <b>Benhao Huang</b>, Quanshi Zhang </p>

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

    <p><i class="fab fa-fw fa-github" aria-hidden="true"></i> <a href="https://huskydoge.github.io/pdfs/Information_theory_paper%20.pdf"> GitHub</a>｜<svg t="1697827825990" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7835" width="16" height="16"><path d="M645.071238 97.52381L828.952381 281.258667V414.47619h48.761905v390.095239h-48.761905v48.761904a73.142857 73.142857 0 0 1-73.142857 73.142857H268.190476a73.142857 73.142857 0 0 1-73.142857-73.142857v-48.761904H146.285714V414.47619h48.761905V170.666667a73.142857 73.142857 0 0 1 73.142857-73.142857h376.880762zM755.809524 804.571429H268.190476v48.761904h487.619048v-48.761904zM368.274286 520.94781H299.154286v174.445714h43.885714v-53.101714h10.971429a177.493333 177.493333 0 0 0 31.597714-2.852572 103.619048 103.619048 0 0 0 16.237714-4.827428c4.534857-2.048 8.777143-4.461714 12.726857-7.241143 7.168-5.412571 12.507429-12.141714 16.018286-20.187429 3.364571-8.484571 5.046857-17.334857 5.046857-26.550857a72.338286 72.338286 0 0 0-4.388571-23.698286 56.441905 56.441905 0 0 0-13.604572-19.968 62.025143 62.025143 0 0 0-23.917714-12.726857 116.784762 116.784762 0 0 0-25.453714-3.291428z m140.434285 0h-61.44v174.445714h61.44c6.875429-0.146286 13.750857-0.731429 20.626286-1.755429 6.144-1.024 12.141714-2.56 17.993143-4.608 5.266286-2.194286 10.313143-4.754286 15.140571-7.68 4.388571-3.218286 8.411429-6.875429 12.068572-10.971428 3.510857-4.388571 6.582857-9.069714 9.216-14.043429a110.689524 110.689524 0 0 0 6.144-16.896c2.194286-10.24 3.364571-20.626286 3.510857-31.158857a176.37181 176.37181 0 0 0-1.755429-21.284571 113.249524 113.249524 0 0 0-4.608-18.432 90.599619 90.599619 0 0 0-7.68-15.579429 78.214095 78.214095 0 0 0-10.532571-12.507429 77.994667 77.994667 0 0 0-13.604571-9.435428 93.42781 93.42781 0 0 0-16.457143-6.363429 139.702857 139.702857 0 0 0-30.061715-3.730285z m213.504 0h-116.736v174.445714h43.885715v-65.828572h63.414857v-34.011428h-63.414857v-39.497143h72.850285v-35.108571z m-206.482285 35.108571c4.973714 0.146286 9.654857 1.536 14.043428 4.169143 4.534857 3.072 8.265143 7.021714 11.190857 11.849143 3.218286 5.851429 5.485714 11.995429 6.802286 18.432 1.024 5.997714 1.609143 11.995429 1.755429 17.993143-0.146286 6.144-0.731429 12.214857-1.755429 18.212571a62.22019 62.22019 0 0 1-6.802286 18.212571c-2.925714 4.681143-6.656 8.557714-11.190857 11.629715a28.038095 28.038095 0 0 1-14.043428 3.730285h-24.576v-104.228571h24.576z m-151.625143 0c3.949714 0.146286 7.826286 0.877714 11.629714 2.194286 3.364571 1.316571 6.363429 3.218286 8.996572 5.705143 4.681143 5.12 7.021714 11.117714 7.021714 17.993142 0 7.314286-2.706286 13.385143-8.118857 18.212572a28.525714 28.525714 0 0 1-9.874286 5.485714 47.88419 47.88419 0 0 1-12.068571 1.536h-18.651429v-51.126857h21.065143z m217.307428-385.414095L268.190476 170.666667v243.809523h487.619048v-49.956571h-174.372572L581.412571 170.666667z m73.142858 39.740952v80.993524h81.042285l-81.042285-80.993524z" p-id="7836"></path></svg> <a href="https://huskydoge.github.io/pdfs/Information_theory_paper%20.pdf">PDF</a>｜<svg t="1697827676265" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4123" width="16" height="16"><path d="M354.40128 0c-87.04 0-157.44 70.55872-157.44 157.59872v275.68128H78.72c-21.6576 0-39.36256 17.69984-39.36256 39.36256v236.31872c0 21.6576 17.69984 39.35744 39.36256 39.35744h118.24128v118.08256c0 87.04 70.4 157.59872 157.44 157.59872h472.63744c87.04 0 157.59872-70.55872 157.59872-157.59872V315.0336c0-41.74848-38.9888-81.93024-107.52-149.27872l-29.11744-29.12256L818.87744 107.52C751.5392 38.9888 711.39328 0 669.59872 0H354.4064z m0 78.72h287.20128c28.35456 7.0912 27.99616 42.1376 27.99616 76.8v120.16128c0 21.6576 17.69984 39.35744 39.36256 39.35744h118.07744c39.38816 0 78.87872-0.0256 78.87872 39.36256v512c0 43.32032-35.55328 78.87872-78.87872 78.87872H354.4064c-43.32544 0-78.72-35.5584-78.72-78.87872v-118.08256h393.91744c21.66272 0 39.36256-17.69472 39.36256-39.35744V472.64256c0-21.66272-17.69984-39.36256-39.36256-39.36256H275.68128V157.59872c0-43.32032 35.39456-78.87872 78.72-78.87872zM165.60128 500.96128h43.19744c20.48 0 35.84 4.48 46.08 13.44 10.24 8.32 15.36 21.12 15.36 38.4s-5.43744 31.03744-16.31744 41.27744c-10.88 9.6-26.88 14.40256-48 14.40256h-18.24256v68.15744h-22.07744V500.96128z m142.08 0h43.19744c20.48 0 35.84 4.48 46.08 13.44 10.24 8.32 15.36 21.12 15.36 38.4s-5.43744 31.03744-16.31744 41.27744c-10.88 9.6-26.88 14.40256-48 14.40256h-18.24256v68.15744h-22.07744V500.96128z m120.96 0h121.91744v20.15744h-49.92v155.52H478.5664v-155.52h-49.92v-20.15744z m-240.96256 19.2v69.12h15.36c16 0 27.20256-2.88256 33.60256-8.64256 7.04-5.76 10.55744-14.72 10.55744-26.88 0-10.88-3.51744-19.2-10.55744-24.96-6.4-5.76-16.32256-8.63744-29.76256-8.63744h-19.2z m142.08 0v69.12h15.36c16 0 27.20256-2.88256 33.60256-8.64256 7.04-5.76 10.55744-14.72 10.55744-26.88 0-10.88-3.51744-19.2-10.55744-24.96-6.4-5.76-16.32256-8.63744-29.76256-8.63744h-19.2z" p-id="4124"></path></svg> <a href="https://huskydoge.github.io/pdfs/Presentation.pdf">Slides </a> </p>

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
    <p> A website designed to display SJTU classrooms' data, such as seat number, CO2 concentration, temperature, etc. It aims to help student choose a proper self-study classroom. I was responsible for the whole development of the front-end and back-end development of the website.   </p>
  </div>
</div>

<div class="paper-box">
  <div class="paper-box-image">
  <div>
  <div class="badge">CS3324</div>
  <img src="images/digitalImage.png" width="100%"></div>
  </div>
  <div class="paper-box-text">
    <p><a href="https://github.com/huskydoge/Digital-Image-Processing">Metric Transformer | TranBlendNet</a></p>

    <p><i class="fab fa-fw fa-github" aria-hidden="true"></i> <a href="[https://github.com/huskydoge/SJTU-Classroom](https://github.com/huskydoge/Digital-Image-Processing)"> GitHub</a>｜<svg t="1697827825990" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7835" width="16" height="16"><path d="M645.071238 97.52381L828.952381 281.258667V414.47619h48.761905v390.095239h-48.761905v48.761904a73.142857 73.142857 0 0 1-73.142857 73.142857H268.190476a73.142857 73.142857 0 0 1-73.142857-73.142857v-48.761904H146.285714V414.47619h48.761905V170.666667a73.142857 73.142857 0 0 1 73.142857-73.142857h376.880762zM755.809524 804.571429H268.190476v48.761904h487.619048v-48.761904zM368.274286 520.94781H299.154286v174.445714h43.885714v-53.101714h10.971429a177.493333 177.493333 0 0 0 31.597714-2.852572 103.619048 103.619048 0 0 0 16.237714-4.827428c4.534857-2.048 8.777143-4.461714 12.726857-7.241143 7.168-5.412571 12.507429-12.141714 16.018286-20.187429 3.364571-8.484571 5.046857-17.334857 5.046857-26.550857a72.338286 72.338286 0 0 0-4.388571-23.698286 56.441905 56.441905 0 0 0-13.604572-19.968 62.025143 62.025143 0 0 0-23.917714-12.726857 116.784762 116.784762 0 0 0-25.453714-3.291428z m140.434285 0h-61.44v174.445714h61.44c6.875429-0.146286 13.750857-0.731429 20.626286-1.755429 6.144-1.024 12.141714-2.56 17.993143-4.608 5.266286-2.194286 10.313143-4.754286 15.140571-7.68 4.388571-3.218286 8.411429-6.875429 12.068572-10.971428 3.510857-4.388571 6.582857-9.069714 9.216-14.043429a110.689524 110.689524 0 0 0 6.144-16.896c2.194286-10.24 3.364571-20.626286 3.510857-31.158857a176.37181 176.37181 0 0 0-1.755429-21.284571 113.249524 113.249524 0 0 0-4.608-18.432 90.599619 90.599619 0 0 0-7.68-15.579429 78.214095 78.214095 0 0 0-10.532571-12.507429 77.994667 77.994667 0 0 0-13.604571-9.435428 93.42781 93.42781 0 0 0-16.457143-6.363429 139.702857 139.702857 0 0 0-30.061715-3.730285z m213.504 0h-116.736v174.445714h43.885715v-65.828572h63.414857v-34.011428h-63.414857v-39.497143h72.850285v-35.108571z m-206.482285 35.108571c4.973714 0.146286 9.654857 1.536 14.043428 4.169143 4.534857 3.072 8.265143 7.021714 11.190857 11.849143 3.218286 5.851429 5.485714 11.995429 6.802286 18.432 1.024 5.997714 1.609143 11.995429 1.755429 17.993143-0.146286 6.144-0.731429 12.214857-1.755429 18.212571a62.22019 62.22019 0 0 1-6.802286 18.212571c-2.925714 4.681143-6.656 8.557714-11.190857 11.629715a28.038095 28.038095 0 0 1-14.043428 3.730285h-24.576v-104.228571h24.576z m-151.625143 0c3.949714 0.146286 7.826286 0.877714 11.629714 2.194286 3.364571 1.316571 6.363429 3.218286 8.996572 5.705143 4.681143 5.12 7.021714 11.117714 7.021714 17.993142 0 7.314286-2.706286 13.385143-8.118857 18.212572a28.525714 28.525714 0 0 1-9.874286 5.485714 47.88419 47.88419 0 0 1-12.068571 1.536h-18.651429v-51.126857h21.065143z m217.307428-385.414095L268.190476 170.666667v243.809523h487.619048v-49.956571h-174.372572L581.412571 170.666667z m73.142858 39.740952v80.993524h81.042285l-81.042285-80.993524z" p-id="7836"></path></svg> <a href="https://github.com/huskydoge/Digital-Image-Processing/blob/main/Assignment1/Digital_Image_Process_HW1.pdf">PDF1</a> | <svg t="1697827825990" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7835" width="16" height="16"><path d="M645.071238 97.52381L828.952381 281.258667V414.47619h48.761905v390.095239h-48.761905v48.761904a73.142857 73.142857 0 0 1-73.142857 73.142857H268.190476a73.142857 73.142857 0 0 1-73.142857-73.142857v-48.761904H146.285714V414.47619h48.761905V170.666667a73.142857 73.142857 0 0 1 73.142857-73.142857h376.880762zM755.809524 804.571429H268.190476v48.761904h487.619048v-48.761904zM368.274286 520.94781H299.154286v174.445714h43.885714v-53.101714h10.971429a177.493333 177.493333 0 0 0 31.597714-2.852572 103.619048 103.619048 0 0 0 16.237714-4.827428c4.534857-2.048 8.777143-4.461714 12.726857-7.241143 7.168-5.412571 12.507429-12.141714 16.018286-20.187429 3.364571-8.484571 5.046857-17.334857 5.046857-26.550857a72.338286 72.338286 0 0 0-4.388571-23.698286 56.441905 56.441905 0 0 0-13.604572-19.968 62.025143 62.025143 0 0 0-23.917714-12.726857 116.784762 116.784762 0 0 0-25.453714-3.291428z m140.434285 0h-61.44v174.445714h61.44c6.875429-0.146286 13.750857-0.731429 20.626286-1.755429 6.144-1.024 12.141714-2.56 17.993143-4.608 5.266286-2.194286 10.313143-4.754286 15.140571-7.68 4.388571-3.218286 8.411429-6.875429 12.068572-10.971428 3.510857-4.388571 6.582857-9.069714 9.216-14.043429a110.689524 110.689524 0 0 0 6.144-16.896c2.194286-10.24 3.364571-20.626286 3.510857-31.158857a176.37181 176.37181 0 0 0-1.755429-21.284571 113.249524 113.249524 0 0 0-4.608-18.432 90.599619 90.599619 0 0 0-7.68-15.579429 78.214095 78.214095 0 0 0-10.532571-12.507429 77.994667 77.994667 0 0 0-13.604571-9.435428 93.42781 93.42781 0 0 0-16.457143-6.363429 139.702857 139.702857 0 0 0-30.061715-3.730285z m213.504 0h-116.736v174.445714h43.885715v-65.828572h63.414857v-34.011428h-63.414857v-39.497143h72.850285v-35.108571z m-206.482285 35.108571c4.973714 0.146286 9.654857 1.536 14.043428 4.169143 4.534857 3.072 8.265143 7.021714 11.190857 11.849143 3.218286 5.851429 5.485714 11.995429 6.802286 18.432 1.024 5.997714 1.609143 11.995429 1.755429 17.993143-0.146286 6.144-0.731429 12.214857-1.755429 18.212571a62.22019 62.22019 0 0 1-6.802286 18.212571c-2.925714 4.681143-6.656 8.557714-11.190857 11.629715a28.038095 28.038095 0 0 1-14.043428 3.730285h-24.576v-104.228571h24.576z m-151.625143 0c3.949714 0.146286 7.826286 0.877714 11.629714 2.194286 3.364571 1.316571 6.363429 3.218286 8.996572 5.705143 4.681143 5.12 7.021714 11.117714 7.021714 17.993142 0 7.314286-2.706286 13.385143-8.118857 18.212572a28.525714 28.525714 0 0 1-9.874286 5.485714 47.88419 47.88419 0 0 1-12.068571 1.536h-18.651429v-51.126857h21.065143z m217.307428-385.414095L268.190476 170.666667v243.809523h487.619048v-49.956571h-174.372572L581.412571 170.666667z m73.142858 39.740952v80.993524h81.042285l-81.042285-80.993524z" p-id="7836"></path></svg> <a href="https://github.com/huskydoge/Digital-Image-Processing/blob/main/Assignment2/Digital_Image_Process_HW2.pdf">PDF2</a>
</p>
    <p> Projects of SJTU-CS3324 Digital Image Processing. In the 'Metric Transformer' project, I employed the BLIP model as the backbone and devised a streamlined transformer structure to evaluate AI-generated images. The assessments encompassed Text-Image Image Quality, Authenticity, and Text-Image Correspondence. In the 'TranBlendNet' project, I delved into the impact of text input on saliency prediction tasks. I designed a model capable of dynamically adjusting its attention area within a given image based on different text inputs.  </p>
  </div>
</div>


# 📇 Experience

<div class="paper-box-right">
  <div class="paper-box-text">
    <p>
    <a href="https://www.mvig.org/">Machine Vision and Intelligence Group</a>, <a href="https://mvig-rhos.com/">RHOS Team</a>
</p>


    <p>Research undergraduate, <em>2023.11 - (now)</em></p>

    <p>Advisor: <a href="https://dirtyharrylyl.github.io/">Yonglu Li</a>, <a href="https://www.mvig.org/">Cewu Lu</a></p>
  </div>
  <div class="paper-box-image">
    <div>
      <a href="https://mvig-rhos.com/">
      <img src="images/rhos.jpg" alt="sym" width="80px" style="padding: 10px">
      </a>
    </div>
  </div>
</div>

<br>
<br>
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



# 🌇 Misc


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


