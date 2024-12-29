---
layout: default
title: Blog
---

# Blog

<div class="blog-posts">
{% raw %}{% for post in site.posts %}
  <article class="blog-post">
    <div class="post-header">
      <h2>{{ post.title }}</h2>
      <div class="post-meta">
        <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
        {% if post.tags %}
        <span class="post-tags">
          {% for tag in post.tags %}
          <span class="tag">{{ tag }}</span>
          {% endfor %}
        </span>
        {% endif %}
      </div>
    </div>
    <div class="post-content">
      {{ post.excerpt }}
      <div class="post-footer">
        <a href="{{ post.url }}" class="read-more">Continue reading →</a>
      </div>
    </div>
  </article>
{% endfor %}{% endraw %}
</div> 