---
layout: default
title: Publications
---

# Publications

{% raw %}{% assign publications_by_year = site.publications | group_by_exp: "pub", "pub.date | date: '%Y'" %}
{% for year in publications_by_year %}
{% for publication in year.items %}
<div class="publication">
    <h2>{{ publication.title }}</h2>
    <div class="venue">{{ publication.venue }}</div>
    <div class="authors">{{ publication.authors }}</div>
    <div class="controls">
        {% if publication.pdf %}
        <a href="{{ publication.pdf }}" class="pdf-button">[PDF]</a>
        {% endif %}
    </div>
</div>
{% endfor %}
{% endfor %}{% endraw %} 