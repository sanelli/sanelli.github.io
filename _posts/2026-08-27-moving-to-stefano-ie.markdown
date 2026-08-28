---
layout: post
title:  "Moving to stefano.ie"
date:   2026-08-27 18:30:00 +0100
icon: website
categories: website
tags: [project, blog]
---

<div class="with-post-photo" markdown="1">
<figure class="post-photo">
  <img src="{{ '/assets/images/me-elevator.jpg' | relative_url }}" alt="Stefano Anelli in a lift, taking a mirror photo" width="1995" height="4323">
</figure>

I had been circling this decision for years, in that slow, slightly embarrassing way you circle something that would be nice to have and never quite feels urgent enough to sit down and do. This week I finally registered a domain, my first, and I was lucky enough to get the one I actually wanted: my first name, on Ireland's country-code TLD. This site now lives at [stefano.ie](https://stefano.ie).

Buying the name was much easier than the version of the story I had been telling myself. I pointed it at the same GitHub Pages site that used to live only at [sanelli.github.io](https://sanelli.github.io), with a bit of help from [Google Gemini](https://gemini.google.com) on the DNS side, and both the apex and the `www` hostnames serve the pages the way I wanted them to. The DNS check in the GitHub repository still fails, even though the site loads; I assume GitHub is looking at one hostname while I configured the other, or both, and the checker has not caught up with that split. Either way, I am not going to lose sleep over a red mark in a settings screen.

With a bit more effort I also wired [projects@stefano.ie](mailto:projects@stefano.ie) through to my Gmail account. There are still some wrinkles, mostly mail from that address landing in spam on my side, but it is a real address on a domain that is mine, which already feels like a step forward from hiding behind a Gmail handle.

The older posts are still here, including the one about [rebuilding this site]({% post_url 2026-08-16-rebuilding-this-site %}). Same pages, same GitHub repository. They just have a shorter name on the door.
</div>

{% include made-with-cursor.html %}
