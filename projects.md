---
layout: default
title: Projects
---

# Projects

<div class="projects-grid">
{% raw %}{% for project in site.projects %}
  <div class="project-card">
    <div class="card-content">
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
      {% if project.tags %}
      <div class="project-tags">
        {% for tag in project.tags %}
        <span class="tag">{{ tag }}</span>
        {% endfor %}
      </div>
      {% endif %}
      <a href="{{ project.url }}" class="project-link">Learn More</a>
    </div>
  </div>
{% endfor %}{% endraw %}
</div> 