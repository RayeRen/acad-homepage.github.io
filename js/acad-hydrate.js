(function () {
  "use strict";

  function cloneWithoutHeading(source, headingSelector) {
    var clone = source.cloneNode(true);
    var heading = clone.querySelector(headingSelector);
    if (heading) {
      heading.remove();
    }
    return clone;
  }

  function replaceContent(targetId, source) {
    var target = document.getElementById(targetId);
    target.replaceChildren(source);
  }

  function removeText(node, text) {
    node.childNodes.forEach(function (child) {
      if (child.nodeType === 3) {
        child.textContent = child.textContent.replace(text, "");
      } else {
        removeText(child, text);
      }
    });
  }

  function normalizeMigratedContent() {
    document.querySelectorAll(".migrated-content a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var embeddedUrl = href.match(/(https?:\/\/.*)$/);
      if (href.indexOf("chrome-extension://") === 0 && embeddedUrl) {
        link.setAttribute("href", embeddedUrl[1]);
      }
      if (href !== "#" && href !== "index.html") {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    document.querySelectorAll(".migrated-content img").forEach(function (image) {
      image.loading = "lazy";
      image.decoding = "async";
      if (!image.alt) {
        image.alt = "Publication preview";
      }
    });
  }

  fetch("legacy-source.html")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Legacy content request failed");
      }
      return response.text();
    })
    .then(function (html) {
      var legacy = new DOMParser().parseFromString(html, "text/html");
      var aboutSource = legacy.querySelector("#about .my-auto");
      var aboutTarget = document.getElementById("about-content");
      var contact = aboutSource.querySelector("h2 + div");
      var biography = aboutSource.querySelector("p.mb-5");
      var newsHeading = legacy.querySelector("#latest-news");
      var publications = legacy.querySelector("#publications ol");
      var activities = legacy.querySelector("#activities .my-auto");
      var experience = legacy.querySelector("#working-experiences .my-auto");
      var awards = legacy.querySelector("#awards .my-auto");

      aboutTarget.replaceChildren();
      if (contact) {
        var contactCopy = contact.cloneNode(true);
        contactCopy.className = "contact-line";
        aboutTarget.appendChild(contactCopy);
      }
      if (biography) {
        var biographyCopy = biography.cloneNode(true);
        removeText(biographyCopy, "The research topics mainly include but are not limited to the following:");
        aboutTarget.appendChild(biographyCopy);
      }

      if (newsHeading && newsHeading.nextElementSibling) {
        replaceContent("news-content", newsHeading.nextElementSibling.cloneNode(true));
      }
      if (publications) {
        replaceContent("publications-content", publications.cloneNode(true));
      }
      if (activities) {
        replaceContent("activities-content", cloneWithoutHeading(activities, "h3"));
      }
      if (experience) {
        replaceContent("experience-content", cloneWithoutHeading(experience, "h3"));
      }
      if (awards) {
        replaceContent("awards-content", cloneWithoutHeading(awards, "h3"));
      }

      normalizeMigratedContent();
      window.dispatchEvent(new Event("resize"));
    })
    .catch(function () {
      document.getElementById("about-content").replaceChildren();
      document.getElementById("content-error").hidden = false;
    });
}());
