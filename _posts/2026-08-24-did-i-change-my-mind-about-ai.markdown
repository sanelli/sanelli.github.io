---
layout: post
title:  "Did I change my mind about AI? Yes, yes I did."
date:   2026-08-24 21:20:00 +0100
icon: pencil
categories: thoughts
---

The first time I thought about artificial intelligence I was a kid, watching films like [*Terminator*](https://en.wikipedia.org/wiki/The_Terminator) and [*Robocop*](https://en.wikipedia.org/wiki/RoboCop). I do not think my taste in movies has improved much since.

<div class="with-book-cover" markdown="1">
<figure class="book-cover">
  <img src="{{ '/assets/images/covers/intelligenza-artificiale.jpg' | relative_url }}" alt="Front cover of Intelligenza Artificiale: Un approccio moderno, Volume 1, by Stuart Russell and Peter Norvig" width="200" height="284">
  <figcaption>The Italian 2nd edition, Volume 1. Pearson Prentice Hall, 2005.</figcaption>
</figure>

The only time I took AI seriously was at [Politecnico di Milano](https://www.polimi.it), at least twenty years ago. The course was *Intelligenza Artificiale*. It was mostly intelligent agents, search and search algorithms (the <a href="https://en.wikipedia.org/wiki/A%2A_search_algorithm">A&#42;</a> algorithm, for finding solutions to problems), backtracking, logic, and inference. There was also *Soft Computing*: genetic algorithms, fuzzy logic, and neural networks.

I still have the book, [*Intelligenza Artificiale: Un approccio moderno*, Volume 1](https://en.wikipedia.org/wiki/Artificial_Intelligence:_A_Modern_Approach), by [Stuart Russell](https://en.wikipedia.org/wiki/Stuart_J._Russell) and [Peter Norvig](https://en.wikipedia.org/wiki/Peter_Norvig). I even remember writing some code, probably in Java, to train a neural network, or a simulation of lions and monkeys: the lions were supposed to catch the monkeys, and the monkeys were supposed to run away. I probably still have that code in my Gmail account; a classmate and I wrote it.
</div>

## I did not keep up

After that I honestly did not put much effort into following AI, or LLMs. That does not mean nothing happened. In November 2022 [OpenAI released ChatGPT](https://openai.com/index/chatgpt/), and I was still oblivious to what large language models could do. In my head it was something like: nice tool, but it cannot do anything I cannot do myself. That may even have been true at the time. I also thought LLMs were destined to be useless, or useful only in a very thin niche, like blockchain. For a few months everything was blockchain this and blockchain that. I have never needed to write anything with a blockchain, or use a blockchain library, and I suspect most people barely remember what they were for, even if they are probably useful in their corner.

A few years passed. The next real encounters were in the summer and autumn of 2025. The first was on holiday in Mallorca with a friend. I was mostly using Google; they preferred a conversation with ChatGPT. I was very sceptical of the answers. In my mind the model could only repeat what it had been trained on: stale at best, made up at worst. I was still not convinced.

Later that autumn, or maybe a bit earlier, coding models started showing up everywhere, and at Unity there were more and more discussions about using AI to write code, or about what AI could do for customers. A couple of people who reported to me decided to try LLMs for tests and scaffolding. I did not stop them. My line was:

> If you commit that code, you are responsible for that code, no matter whether you, AI, or Stack Overflow wrote it.

I still did not trust AI to produce code I would want in production.

## Then I actually used it

In 2026 I left Unity and went back to SIG. The company line on AI was simple: try it, and see if it helps with the day-to-day work. It did.

Some colleagues gave me a proper introduction to [Cursor](https://cursor.com), and I realised I could save a lot of time and mental energy, especially in a legacy codebase, and spend it on the part that matters: architecture and problem solving. Day by day I got more comfortable with it. I learned the modes, Plan and Ask, when to switch models, and when to trust the model versus my own software-engineering instinct. AI can be wrong. That part did not change.

After a couple of months I wanted Cursor at home too, so I bought myself a Cursor Pro subscription and went back to [Mappa](https://github.com/sanelli/Mappa). Before Cursor, a new feature could take months: not only because there is a lot of code, but because the [Roslyn](https://github.com/dotnet/roslyn) API is poorly documented, and writing tests that cover every case took a huge amount of energy. Since I started using Cursor on Mappa I have shipped three versions: [10.0]({% post_url 2026-06-11-Mappa-v10.0.0 %}), [10.1]({% post_url 2026-07-04-Mappa-v10.1.0 %}), and [10.2]({% post_url 2026-08-09-Mappa-v10.2.0 %}). On top of that I [rebuilt this site]({% post_url 2026-08-16-rebuilding-this-site %}), and in a single day, while I was also cleaning the apartment windows, I wrote a [compiler and interpreter for EML]({% post_url 2026-08-22-EML-an-exp-minus-log-compiler-and-interpreter %}).

## A walk, a meal log, and a change of mind

What made me sit down and write this is something I noticed today, while complaining to myself about how hard it is to track what I eat. For my own reasons I am trying to eat a bit healthier, and a big part of that is knowing what I actually consume. I got a [Fitbit Air](https://blog.google/products-and-platforms/devices/fitbit/fitbit-air/) and installed [Google Health](https://health.google/) on my iPhone. Fine, except logging every meal is tedious, the app UI is confusing and overwhelming, and even the “smart” bits are frustrating. I tried to scan the barcode on a pack of mixed nuts; the portion-size screen came up in Korean, which I do not speak.

On a post-lunch walk I thought: what if I write a small program that reads a JSON file and sends a request to the Google Health API? I have had this kind of idea before. I usually get stuck, because turning it into something real means learning a pile of details: how does this API work, how does auth work, what are the valid values for these fields?

Today, after I got home from work, I opened Cursor, described what I wanted, and built a small set of tools: ask [Gemini](https://gemini.google.com) to turn a markdown log of what I ate (and maybe some photos) into JSON in the right shape, then upload it through the Google Health API. All of that in less than a couple of hours, and I was having fun doing it.

AI, used properly, is very good at removing this kind of roadblock. It brought back the fun of writing something new. The tool is called foody. Once I have used it myself for a while I will make it public and write a post about it.

## So, did I change my mind?

How do I see the future of software engineering? A slightly easier job than it used to be, especially for senior engineers. AI took away a lot of the hurdles that made writing code a chore, and left more room for the part that is actually the job, and possibly the fun part: problem solving. The work will change. Being a software engineer is still a good career.

I do want to say something to junior engineers, and to people studying computer science. It is more or less what my maths teacher told me in primary school, when I was learning arithmetic: do not use a calculator. In your case: do not use AI to write the code and the projects for you. Learn to code the hard way. Sit with the problems that make you a better engineer. Use AI to check your work, or to reason with. If you skip the fundamentals, you will not get them.

I was wrong about AI.

<aside class="album-facts">
  <p class="album-facts-label">Disclosure</p>
  <p>The ideas and stories are mine. I wrote the first draft in Notes, then asked Cursor to make it cleaner English. I might post that original draft later.</p>
</aside>

{% include made-with-cursor.html %}
