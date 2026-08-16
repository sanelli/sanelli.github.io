---
layout: post
title:  "Rebuilding this site"
date:   2026-08-16 10:00:00 +0100
icon: website
categories: website
---

This post, and the work it describes, was done with [Cursor](https://cursor.com). I sat down to tidy a stock Jekyll site and came out the other side with something that actually feels like mine.

I have been running this page on the default [Minima](https://github.com/jekyll/minima) setup for years. That setup is already more than enough: Markdown, a theme, GitHub Pages, done. I never really looked further. I also do not write Ruby, which is what Jekyll is built on, so I treated the generator as a black box and left it alone.

That was a mistake, or at least a missed chance. Once you start using data files, layouts, and a few plugins, Jekyll is a small static CMS. I was surprised how far it goes without a database or a build toolchain I would normally reach for at work.

What changed:

- The **Career** page is a proper CV again: roles, product shots, chips for languages and frameworks, education, awards, and links.
- **Portfolio** items are cards driven from YAML, with the related posts hanging off each one.
- **Books, music, movies, and games** moved out of hand-written tables into data files. The pages search, filter, and sort in the browser.
- Emoji prefixes are gone. A single SVG sprite covers navigation, projects, and this post.
- Dark is still the default. A footer control cycles dark, light, and system.
- The site builds with GitHub Actions on Jekyll 4, which meant I could add plugins Pages would not run on its own: a sitemap, redirects, cached includes, external links opening in a new tab, and pagination.
- There is a real **[/posts/](/posts/)** index now. The homepage only keeps the latest few.
- Yearly counts live on a quiet **[/stats/](/stats/)** page (the "Stats for nerds" link at the bottom of the home page).

None of this needed me to become a Ruby developer. Liquid, YAML, and a bit of CSS were enough. I should have opened the hood years ago. The default site was already good; the rest was sitting there waiting.

{% include made-with-cursor.html %}
