---
layout: default
title: Publications
---

# Publications

<div class="publications-timeline">
{% raw %}{% assign publications_by_year = site.publications | group_by_exp: "pub", "pub.date | date: '%Y'" %}
{% for year in publications_by_year %}
  <div class="year-marker">{{ year.name }}</div>
  {% for publication in year.items %}
  <div class="publication-item" data-date="{{ publication.date | date: '%B %Y' }}">
    <h3>{{ publication.title }}</h3>
    <p>Authors: {{ publication.authors | join: ", " }}</p>
    <p>{{ publication.venue }}</p>
    <div class="paper-actions">
      <a href="{{ publication.url }}" class="action-button abstract-button">
        <i class="fas fa-book-open"></i> Abstract
      </a>
      {% if publication.pdf %}
      <a href="{{ publication.pdf }}" class="action-button pdf-button">
        <i class="fas fa-file-pdf"></i> PDF
      </a>
      {% endif %}
    </div>
  </div>
  {% endfor %}
{% endfor %}{% endraw %}
</div> 