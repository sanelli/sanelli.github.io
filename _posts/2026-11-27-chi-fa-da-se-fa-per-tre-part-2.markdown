---
layout: post
title:  "Chi fa da sé fa per tre, part 2"
date:   2026-11-27 14:00:00 +0000
categories: projects lovelace libadalang-tools-dist ada
tags: [project, software, blog]
---

Back in September I [built Tree Shade]({% post_url 2026-09-04-treeshade-v1.0.0 %}) because Rider would not hide the folders I did not want to see. The Italian saying still fits: *Chi fa da sé fa per tre* — if you want something done, do it yourself. This is part 2.

Now that most of the code I write goes through AI, I think it is very important to put some guardrails around how that code is written. In my C# projects, for instance, I enforce warnings as errors, a strict [`.editorconfig`](https://editorconfig.org) setup, [StyleCop.Analyzers](https://www.nuget.org/packages/StyleCop.Analyzers), [SonarAnalyzer.CSharp](https://www.nuget.org/packages/SonarAnalyzer.CSharp), and IDE rules treated as errors.

So naturally, now that I am working on [Lovelace](https://github.com/sanelli/lovelace) — a new Pascal / Ada–family language whose Ada toolchain compiles source to WebAssembly components — I want similar rules. And for the most part I was able to. I added strict warnings, enforced style via [`gnatformat`](https://docs.adacore.com/live/wave/gnatformat/html/user-guide/), code coverage via [`gnatcov`](https://docs.adacore.com/gnatcov-docs/gnatcov.html), and [CRAP](https://testing.googleblog.com/2011/02/this-code-is-crap.html) plus cyclomatic complexity metrics via [`gnatmetric`](https://docs.adacore.com/live/wave/gnatsas/html/gnatmetric/gnatmetrics.html). So far so good.

The only problem: `gnatmetric` (from [libadalang_tools](https://alire.ada.dev/crates/libadalang_tools)) does not ship downloadable binaries. You have to build it from scratch. Not a big deal on my local Apple M4 with 32 GB of RAM, but on a GitHub Actions runner it was a different story. I noticed straight away that it was taking far too long, so I changed plan: I created a new repo, [libadalang_tools-dist](https://github.com/sanelli/libadalang_tools-dist), with only a definition of the build matrix (Alire × libadalang_tools × GNAT native × GitHub Actions runner type × architecture). A manual workflow publishes a release with the zip files for every combination. Currently only one is supported:

| libadalang_tools | runner | arch | gnat_native | alire |
| --- | --- | --- | --- | --- |
| 26.0.0 | <span style="white-space: nowrap">ubuntu-26.04</span> | x86_64 | 15.2.1 | 2.1.0 |

More combinations can be added when needed. On top of that I shipped a composite action that downloads the matching zip, so `gnatmetric` is easy to invoke in CI. Build once, reuse the binaries.

Of course all of the setup and code was written with [Cursor](https://cursor.com). Without it I would almost certainly not have started Lovelace at all, let alone built this distribution pipeline.

{% include made-with-cursor.html %}
