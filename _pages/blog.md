---
layout: default
title: Blog
permalink: /blog/
---

<div class="blog__header">
  <h1 class="blog__title">{{ page.title }}</h1>
  <p class="blog__subtitle">I love to write about programming, machine learning, NLP, LLMs and things that motivates me.</p>
  <a href="https://medium.com/@eyasir2047" class="blog__medium-link">Read more on Medium →</a>
</div>

<div class="blog__container">
  <!-- Search and Filter -->
  <div class="blog__controls">
    <input 
      type="text" 
      id="blog-search" 
      class="blog__search-input" 
      placeholder="Search posts..."
    >
    <div class="blog__tag-filter">
      <button class="blog__filter-btn active" data-tag="all">All</button>
      {% assign all_tags = "" | split: "," %}
      {% for post in site.posts %}
        {% if post.tags %}
          {% for tag in post.tags %}
            {% unless all_tags contains tag %}
              {% assign all_tags = all_tags | push: tag %}
            {% endunless %}
          {% endfor %}
        {% endif %}
      {% endfor %}
      {% assign sorted_tags = all_tags | sort %}
      {% for tag in sorted_tags %}
        <button class="blog__filter-btn" data-tag="{{ tag | slugify }}">{{ tag }}</button>
      {% endfor %}
    </div>
  </div>

  <!-- Blog Posts Grid -->
  <div class="blog__posts">
    {% if site.posts.size == 0 %}
      <div class="blog__empty-state">
        <i class="fas fa-inbox"></i>
        <h2>No posts yet</h2>
        <p>Check back soon for insights on ML, AI, and distributed systems!</p>
      </div>
    {% else %}
      {% for post in site.posts %}
        <article class="blog__post-card" data-tags="{% for tag in post.tags %}{{ tag | slugify }} {% endfor %}">
          <div class="blog__post-header">
            <h2 class="blog__post-title">
              <a href="{{ post.url }}">{{ post.title }}</a>
            </h2>
          </div>

          <div class="blog__post-meta">
            <span class="blog__post-date">
              <i class="fas fa-calendar-alt"></i>
              {{ post.date | date: "%B %d, %Y" }}
            </span>
            <span class="blog__post-reading-time">
              <i class="fas fa-clock"></i>
              {% assign words = post.content | number_of_words %}
              {% if words < 360 %}
                Less than 1 min
              {% else %}
                {{ words | divided_by: 200 }} min read
              {% endif %}
            </span>
          </div>

          {% if post.excerpt %}
            <p class="blog__post-excerpt">{{ post.excerpt }}</p>
          {% endif %}

          {% if post.tags %}
            <div class="blog__post-tags">
              {% for tag in post.tags %}
                <span class="blog__post-tag">{{ tag }}</span>
              {% endfor %}
            </div>
          {% endif %}

          <a href="{{ post.url }}" class="blog__post-link">
            Read More <i class="fas fa-arrow-right"></i>
          </a>
        </article>
      {% endfor %}
    {% endif %}
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('blog-search');
  const filterButtons = document.querySelectorAll('.blog__filter-btn');
  const postCards = document.querySelectorAll('.blog__post-card');

  let activeTag = 'all';
  let searchQuery = '';

  function filterPosts() {
    postCards.forEach(card => {
      const cardTags = card.getAttribute('data-tags').trim().split(/\s+/).filter(t => t);
      const title = card.querySelector('.blog__post-title a').textContent.toLowerCase();
      const excerpt = card.querySelector('.blog__post-excerpt')?.textContent.toLowerCase() || '';

      const matchesTag = activeTag === 'all' || cardTags.includes(activeTag);
      const matchesSearch = searchQuery === '' || title.includes(searchQuery) || excerpt.includes(searchQuery);

      card.style.display = matchesTag && matchesSearch ? 'block' : 'none';
    });

    // Show/hide empty state
    const visibleCards = Array.from(postCards).filter(card => card.style.display !== 'none');
    const emptyState = document.querySelector('.blog__empty-state');
    if (visibleCards.length === 0 && !emptyState) {
      const container = document.querySelector('.blog__posts');
      const empty = document.createElement('div');
      empty.className = 'blog__empty-state';
      empty.innerHTML = '<i class="fas fa-search"></i><h2>No posts found</h2><p>Try adjusting your search or filters.</p>';
      container.appendChild(empty);
    } else if (visibleCards.length > 0 && emptyState) {
      emptyState.remove();
    }
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterPosts();
  });

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.getAttribute('data-tag');
      filterPosts();
    });
  });
});
</script>
