---
layout: page
title: Portfolio
icon: portfolio
description: Open-source .NET tools, source generators, analyzers, and small games.
permalink: /portfolio/
redirect_from:
  - /projects/
  - /projects.html
body_class: entries-page
portfolio_nav: true
---

{%- assign flagships = site.data.projects | where: "section", "flagship" -%}
{%- assign libraries = site.data.projects | where: "section", "libraries" -%}
{%- assign interpreters = site.data.projects | where: "section", "interpreters" -%}
{%- assign web = site.data.projects | where: "section", "web" -%}
{%- assign games = site.data.projects | where: "section", "games" -%}

<nav class="portfolio-nav" data-portfolio-nav aria-label="Portfolio sections">
  <a href="#flagship"><span class="portfolio-nav-dot" aria-hidden="true"></span>Flagship</a>
  <a href="#libraries"><span class="portfolio-nav-dot" aria-hidden="true"></span>Libraries</a>
  <a href="#interpreters"><span class="portfolio-nav-dot" aria-hidden="true"></span>Interpreters</a>
  <a href="#web"><span class="portfolio-nav-dot" aria-hidden="true"></span>Web</a>
  <a href="#games"><span class="portfolio-nav-dot" aria-hidden="true"></span>Games</a>
</nav>

<div class="portfolio-main">
<h2 id="flagship">Flagship</h2>
{% for project in flagships %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="libraries">Libraries</h2>
{% for project in libraries %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="interpreters">Interpreters</h2>
{% for project in interpreters %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="web">Web</h2>
{% for project in web %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="games">Games</h2>
{% for project in games %}
{% include_cached project-card.html project=project %}
{% endfor %}
</div>
