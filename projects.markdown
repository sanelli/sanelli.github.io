---
layout: page
title: Projects
icon: projects
description: Open-source .NET tools, source generators, analyzers, and small games.
permalink: /projects/
body_class: entries-page
---

{%- assign flagships = site.data.projects | where: "section", "flagship" -%}
{%- assign libraries = site.data.projects | where: "section", "libraries" -%}
{%- assign web = site.data.projects | where: "section", "web" -%}
{%- assign games = site.data.projects | where: "section", "games" -%}
{%- assign interpreters = site.data.projects | where: "section", "interpreters" -%}

## Flagship
{% for project in flagships %}
{% include_cached project-card.html project=project %}
{% endfor %}

## Libraries
{% for project in libraries %}
{% include_cached project-card.html project=project %}
{% endfor %}

## Web
{% for project in web %}
{% include_cached project-card.html project=project %}
{% endfor %}

## Games
{% for project in games %}
{% include_cached project-card.html project=project %}
{% endfor %}

## Interpreters
{% for project in interpreters %}
{% include_cached project-card.html project=project %}
{% endfor %}
