---
layout: post
title:  "EML: an exp-minus-log compiler and interpreter"
date:   2026-08-22 23:20:00 +0100
categories: projects eml ada compiler interpreter
---

This post, and the work it describes, was done with [Cursor](https://cursor.com). I wanted to build a small compiler from scratch and see how far that would go, but I also wanted the problem to stay small enough that I would still hit every stage: preprocessor, tokenizer, parser, IR, interpreter, emitters.

The result is [eml](https://github.com/sanelli/eml), an [Ada](https://ada-lang.io) compiler and interpreter built with [Alire](https://alire.ada.dev). Math goes in, a two-opcode stack IR comes out, and you can run that IR or emit JavaScript and C.

## The eml function

A few months ago [Andrzej Odrzywołek's paper](https://arxiv.org/html/2603.21852v2) *All elementary functions from a single operator* showed up in my X feed. The claim is simple and a bit wild: one binary operator,

`eml(x, y) = exp(x) − ln(y)`

together with the constant 1, is enough to rebuild the usual scientific-calculator basis — arithmetic, exp and ln, trig, roots, constants like *e*, π, and *i*. Closed programs are a binary tree of identical nodes, and the grammar is just `S → 1 | eml(S, S)`. NAND for continuous math, if you like that analogy.

For example, `e = eml(1, 1)`, `exp(x) = eml(x, 1)`, and `ln(z) = eml(1, eml(eml(1, z), 1))`. Work happens over complex numbers, principal branch.

I found that idea fascinating: most of the operations I was taught as separate buttons on a calculator can stem from one function and one number. I am also really into compilers, and this looked like a language that was still manageable while still forcing me through the basics.

## Why Ada?

In theory I could have used any language I wanted. Cursor wrote the code; I steered. What I noticed along the way is that these models do their best work when they are tightly constrained, and Ada gives you a type system that can enforce some of that out of the box. I also turned on the strictest Alire switches I could: warnings as errors, style checks, contracts, every runtime check, Ada 2022.

There was a second reason. Ada is not C, Python, or JavaScript, and I wanted to see whether a less common language would give Cursor a harder time.

## Why no crates?

There are no third-party Ada libraries. Tokenizers need regular expressions, so I had Cursor build a small in-repo compiler from a regex subset to an NFA. I wanted to see whether skipping packages would hurt performance. This is a simple language, but using custom automata for the tokenizers actually worked incredibly well.

## Architecture

Everything funnels into one IR: a binary tree of `1` and `eml(S, S)`. Front ends differ by format; backends only see that tree.

{% include eml-pipeline.html %}

`preproc`, `tokenize`, and `parse` stop at their dump (expanded text, tokens, or a tree). `compile` and `run` continue from `IR_Eml.Node`. `run` flattens to opcodes and evaluates on a complex stack, while the JavaScript and C emitters walk the tree as nested `eml(...)` calls instead of flattening.

Stack semantics are two instructions: `ONE` pushes 1; `EML` pops Y then X and pushes `eml(X, Y)`.

## Actions

The executable is one binary, `eml`. The front end is chosen from the effective input format.

| Command | What it does |
|---------|----------------|
| `preproc` | Substitute `$VARNAME` from `--var` / `-v` bindings. `.mxeml` and `.teml` only. |
| `tokenize` | Optionally preprocess, then dump the token stream. Accepts `mxeml`, `teml`, and `eml` (not `beml`). |
| `parse` | Build a tree and dump it. `mxeml` dumps the expression AST; the other three dump the IR tree. |
| `compile` | Lower or reconstruct to IR, then emit a compile target. |
| `run` | Flatten IR, evaluate on a `Long_Float` complex stack, print one compact complex value on stdout. No output file. |
| `help` | Usage, or `eml help <command>` for one command. |

Diagnostics print as `[ID] line:column description` (five-digit IDs). Unused `--var` bindings follow `--warn` (`default`, `none`, or `error`).

## Input formats

| Format | Extension | Role |
|--------|-----------|------|
| `mxeml` | `.mxeml` | Math source: `+` `-` `*` `/` `^`, functions (`log`, `sin`, `cos`, `tan`, `sqrt`, `sinh`, `cosh`, `tanh`), constants (`i`, `pi`, `e`, `phi`), and `eml(x, y)` itself. `$VARNAME` is preprocessor paste. |
| `teml` | `.teml` | Nested tree text only: `1` and `eml(S, S)`. Same `$VARNAME` preprocessor. |
| `eml` | `.eml` | Textual stack IR: `ONE` / `EML`, with `--` comments. |
| `beml` | `.beml` | Packed-bit binary of that same instruction stream. Magic `BEML`, big-endian counts, bits `1` = `ONE` and `0` = `EML`. |

`--input` / `-i` is optional (stdin when omitted). If `-i` is omitted, `--input-format` / `-if` is required. When both are present, `-if` overrides the file extension.

## Output formats

`-o` / `--output` is optional on `preproc`, `tokenize`, `parse`, and `compile` (stdout if omitted). When `-o` is set, the extension must match `-of`.

| Action | `-of` | What you get |
|--------|-------|----------------|
| `preproc` | `mxeml` or `teml` | Expanded source. Default is the input format; `-of` must match the input. |
| `tokenize` | `tokens` | `.tokens` dump: one token per line. Default, and the only value. |
| `parse` | `mermaid` | `.syntaxtree` — raw Mermaid `flowchart TD`. Default. `mxeml` dumps the AST; the other formats dump the IR tree. |
| `parse` | `md` | `.md` — Markdown with a fenced Mermaid block. |
| `parse` | `dot` | `.dot` — Graphviz `digraph`. |
| `parse` | `svg` | `.svg` — self-drawn SVG (no Graphviz). |
| `compile` | `beml` | Binary stack IR, `.beml`. Default. |
| `compile` | `eml` | Textual stack IR, `.eml`, with a UTC header. |
| `compile` | `js` | A classic browser script: `eml(x, y)` via [math.js](https://mathjs.org/) (`math.exp` / `math.log`), and an entry function (default `main`, or `--function-name` / `-fn`) of nested `eml(...)` calls. With `-o`, also a companion `.html` that loads a pinned math.js CDN bundle. |
| `compile` | `c` | A standalone C program: `<complex.h>`, `long double complex`, `cexpl` / `clogl`, and `main` printing the result. |
| `compile` | `clib` | A C library `.c` defining `eml` and an entry (default `compute`, or `-fn`). With `-o`, a companion `.h`. `--emit-eml` also declares `eml` in the header; otherwise `eml` stays `static` in the `.c`. |
| `run` | — | One compact complex value on stdout. `-o` and `-of` are invalid. |
| `help` | — | Usage on stdout (`eml help` or `eml help <command>`). |

Same-format compile is rejected (`eml` → `eml`, `beml` → `beml`).

## What went well

Instructing Cursor to generate the right code was fairly easy. I just had to keep the tasks bite-sized: create the tokenizer for this format, allow outputting this other format, and so on.

## What took some time

When building the Ada interpreter, Cursor got stuck a few times on infinite values that show up as mid-steps. The identities are not free of ±∞ — the paper is explicit about that (`ln 0 = −∞`, `e^(−∞) = 0`) — and while Ada and IEEE-754 can live with it, getting the interpreter to live with it took a few rounds.

Also, as usual, JavaScript proved to be a poor language, or maybe I am just not good with it. Ada and the generated C both execute simple expressions such as `1 + 2 * 3`, but the JavaScript backend, at least in Safari, comes back with `Infinity + Infinityi`, which is underwhelming. I am even using an external library for this, [math.js](https://mathjs.org/), and I do not blame the library so much as the language.

## Next

Still on the list:

- Compile to a native binary via LLVM
- Compile to CIL
- Compile to Java bytecode
- Compile to `wat`, and possibly to `wasm`
- A VS Code extension for `.mxeml` / `.teml` / `.eml` files

{% include made-with-cursor.html %}
