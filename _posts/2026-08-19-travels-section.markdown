---
layout: post
title:  "Adding a travels section"
date:   2026-08-19 22:00:00 +0100
icon: website
categories: website
---

This post, and the work it describes, was done with [Cursor](https://cursor.com). After rebuilding the site around lists of books, music, movies, and games, I wanted the same treatment for places I have been.

The new **[Travels](/travels/)** page sits in the header next to the other media lists. Trips live in `_data/travels.yml`, with the same card layout, year rail, search, ratings, and month gaps you already get on books or movies. Each entry has a title, dates, a star rating when I remember one, and the places I visited, with Wikipedia links where they exist.

On top of that I added a map. [Leaflet](https://leafletjs.com/) loads above the list, with a pin for every place that has coordinates in `_data/travel_coords.yml`. Dublin is marked as home. Older visits fade a little on the map so recent trips stand out. When you search or filter by rating, the list and the pins stay in sync.

The quiet **[Stats](/stats/)** page now counts trips too, alongside the other yearly totals.

It is the same Jekyll pattern as the rest of the rebuild: YAML, Liquid, a bit of JavaScript, no new stack. I had years of trips scattered in photo folders and memory; now they have a proper home on the site.

{% include made-with-cursor.html %}
