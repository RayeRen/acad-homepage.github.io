---
layout: default
permalink: /cv/
title: ""
excerpt: "My academic and professional experience."
author_profile: true
---

<div class="cv-container">
  <!-- Header -->
  <div class="cv-header">
    <h1>
      <i class="fa-solid fa-file-lines"></i> Curriculum Vitae
    </h1>
    <a href="{{ site.baseurl }}/assets/resumes v_final.pdf" class="cv-download-btn" download="Cheng Wu's CV.pdf">
      <i class="fa-solid fa-download"></i> Download CV (PDF)
    </a>
  </div>

  <!-- PDF Preview -->
  <div class="iframe-wrapper">
    <canvas id="pdf-viewer"></canvas>
  </div>
</div>

<!-- 引入 PDF.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js"></script>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    var url = "{{ site.baseurl }}/assets/resumes v_final.pdf"; // PDF 文件路径

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var scale = 1.5; // 调整缩放比例
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
