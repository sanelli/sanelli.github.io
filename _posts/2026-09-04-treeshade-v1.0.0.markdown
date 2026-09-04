---
layout: post
title:  "Tree Shade v1.0.0 (or \"Chi fa da sé fa per tre\")"
date:   2026-09-04 21:30:00 +0100
categories: projects treeshade kotlin rider
tags: [project, software]
lightbox: true
jetbrains_marketplace: true
---

The Italian saying *Chi fa da sé fa per tre* — literally “who does it himself does the work of three,” and in sense “if you want something done, do it yourself” — has rarely felt this accurate.

<div class="with-post-photo" markdown="1">
<figure class="post-photo">
  <img src="{{ '/assets/images/posts/treeshade-icon.png' | relative_url }}" alt="Tree Shade icon: an oak tree with the letters R and D enjoying the shade" width="640" height="640">
  <figcaption>The Tree Shade icon: Rider’s tree view, with a bit of shade for the clutter.</figcaption>
</figure>

Yesterday I was starting a new [Ada](https://ada-lang.io) project and decided I wanted a better IDE than VS Code / [Cursor](https://cursor.com). They work, but they feel clunky to me, and getting a comfortable setup always seems harder than it should. So I switched to my favourite IDE: [JetBrains Rider](https://www.jetbrains.com/rider/).

The only problem? Rider is meant for C# / .NET, not Ada. I did not give up. After a few attempts I had something pretty much ready: compile worked, syntax highlighting worked, and I could even talk to Cursor over ACP ([Cursor ACP in Rider](https://www.youtube.com/watch?v=-AFODqVoe8s)). How I got there is a post for another time.

All good. Except one thing. In Rider's folder view I could not hide the folders I do not want to see: `bin`, `obj`, `alire`, and friends. I spent around three hours with Google and Gemini, both cheerfully gaslighting me that what I wanted was absolutely possible. Gemini kept sending me to [How to hide bin/obj directories in Solution Explorer](https://youtrack.jetbrains.com/articles/SUPPORT-A-1942/How-to-hide-bin-obj-directories-in-Solution-Explorer), which is about the Solution explorer and does not really help when you are staring at a raw File System tree. I eventually stumbled on an eight-year-old JetBrains feature request — [Scopes not available on solution explorer](https://youtrack.jetbrains.com/projects/RIDER/issues/RIDER-16273/Scopes-not-available-on-solution-explorer) — for exactly this: applying scopes (or the same idea) to that view. Something that is, honestly, surprisingly easy in VS Code: just hide some files and folders.

Still, I did not give up. Rider is IntelliJ-based, so it supports plugins. I opened Cursor and asked it to create a new Rider 2026.2 plugin. After a few iterations, something actually worked. That something is [Tree Shade](https://github.com/sanelli/TreeShade).

The name is not subtle: Rider's File System view is a tree, and the plugin puts some of that tree in the shade — files and folders you would rather not look at.
</div>

## What it does

[Tree Shade](https://github.com/sanelli/TreeShade) v1.0.0 hides folders and files by exact name in Rider's **File System** explorer and **Solution** explorer. What remains is sorted folders first, then files, each group alphabetically (case-insensitive). Settings are per project and live in `treeshade.xml`. It is on the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/34097-tree-shade/).

Out of the box it hides:

- **Folders:** `bin`, `obj`, `lib`, `.vscode`, `.idea`
- **Files:** `.DS_Store`

Add `alire` (or anything else you do not want in the tree) yourself.

## Screenshots

Click a shot to open a larger view.

<div class="screenshot-gallery">
  <figure>
    <a href="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/file-system-before.png' | relative_url }}" data-lightbox>
      <img src="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/file-system-before.png' | relative_url }}" alt="Rider File System view before Tree Shade, with .idea and .vscode still visible" width="640" height="900">
    </a>
    <figcaption>File System before: clutter such as <code>.idea</code> and <code>.vscode</code> still in the tree.</figcaption>
  </figure>
  <figure>
    <a href="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/settings.png' | relative_url }}" data-lightbox>
      <img src="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/settings.png' | relative_url }}" alt="Tree Shade settings under Settings → Tools → Tree Shade" width="900" height="640">
    </a>
    <figcaption>Settings → Tools → Tree Shade: one name per line for folders and files.</figcaption>
  </figure>
  <figure>
    <a href="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/file-system-after.png' | relative_url }}" data-lightbox>
      <img src="{{ '/assets/images/posts/treeshade-v1.0.0-screenshots/file-system-after.png' | relative_url }}" alt="Rider File System view after Tree Shade hides selected folders" width="640" height="900">
    </a>
    <figcaption>File System after: the same project, with the noisy folders shaded out of view.</figcaption>
  </figure>
</div>

## How to set it up

1. Install from the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/34097-tree-shade/), **or** download the zip from the [GitHub 1.0.0 release](https://github.com/sanelli/TreeShade/releases/tag/1.0.0) and use **Settings → Plugins → ⚙ → Install Plugin from Disk…**, **or** build your own zip with `gradle buildPlugin`, **or** just click the following box.
2. Restart Rider if prompted.
3. Open **Settings → Tools → Tree Shade**.
4. Enter one name per line for hidden folders and hidden files. Names match the entry name only, not a full path. Apply, and the project view refreshes.

{% include jetbrains-marketplace-widget.html mode="card" plugin_id=34097 element_id="treeshade-marketplace-card" %}

It needs Rider build `262+` (I developed it against Rider 2026.2).

## What's next

This is a basic version. It can grow later — regular expressions, wildcards, that sort of thing. For now it is enough to let me work in Rider with Ada without drowning in build output. Sometimes the shortest path really is to do it yourself.

{% include made-with-cursor.html %}
