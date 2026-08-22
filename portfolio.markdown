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
section_rail: true
---

{%- assign flagships = site.data.projects | where: "section", "flagship" -%}
{%- assign libraries = site.data.projects | where: "section", "libraries" -%}
{%- assign interpreters = site.data.projects | where: "section", "interpreters" -%}
{%- assign web = site.data.projects | where: "section", "web" -%}
{%- assign games = site.data.projects | where: "section", "games" -%}

<div class="section-rail-layout">
<nav class="section-rail" data-section-rail data-section-rail-collapsible aria-label="Portfolio sections">
  {% include section-rail-link.html id="flagship" label="Flagship" %}
  {% include section-rail-link.html id="libraries" label="Libraries" %}
  {% include section-rail-link.html id="interpreters" label="Compilers & Interpreters" %}
  {% include section-rail-link.html id="web" label="Web" %}
  {% include section-rail-link.html id="games" label="Games" %}
</nav>

<div class="section-rail-main">
<h2 id="flagship">Flagship</h2>
{% for project in flagships %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="libraries">Libraries</h2>
{% for project in libraries %}
{% include_cached project-card.html project=project %}
{% endfor %}

<h2 id="interpreters">Compilers &amp; Interpreters</h2>
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
</div>

{% include back-to-top.html %}
