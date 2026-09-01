---
layout: default
permalink: /zh/cv/
title: ""
excerpt: "我的学术和职业经历。"
author_profile: true
lang: "zh"
---

<div class="cv-container">
  <!-- 头部 -->
  <div class="cv-header">
    <h1>
      <i class="fa-solid fa-file-lines"></i> 个人简历
    </h1>
    <a href="{{ site.baseurl }}/assets/resumes zh.pdf" class="cv-download-btn" download="吴骋的简历.pdf">
      <i class="fa-solid fa-download"></i> 下载简历（PDF）
    </a>
  </div>

  <!-- PDF 预览 -->
  <div class="iframe-wrapper">
    <canvas id="pdf-viewer"></canvas>
  </div>
</div>

<!-- 引入 PDF.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    var url = "{{ site.baseurl }}/assets/resumes zh.pdf"; // 本地 PDF 地址

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        var canvas = document.getElementById('pdf-viewer');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
  });
</script>
<script src="{{ site.baseurl }}/assets/js/interactions.js"></script>
