# ParsNegar — one-page project summary

*Draft for grant applications. Replace every `[bracketed]` item with true
information before sending. Do not send this with placeholders still in it.*

## Project

**ParsNegar** — an open-source Persian text normalization toolkit (library,
offline browser app and CLI).

- License: MIT (public good, no lock-in)
- Status: v1.1.0, working and publicly available
- Code and demo: [public URL of the app]
- Language of the interface: Persian, with an English summary section

## Problem

Persian (Farsi) has hundreds of millions of speakers, yet the tooling around it
is thin and inconsistent. The core issue is not vocabulary but **surface-form
variation**: the same word appears as `دنیا`/`دنيا`, `کتاب`/`كتاب`, with or
without diacritics, with or without kashida, with missing half-spaces (ZWNJ), and
with mixed Persian/Latin digits.

Computers treat every variant as a different string. The result:

- search and deduplication fail ("the same word" is not found),
- statistical and linguistic corpora are noisy,
- machine translation, speech recognition and language models are trained on
  inconsistent input,
- small teams and students have no free, predictable tool to reach for, and the
  proprietary options are not auditable.

## Solution

A small, explicit, dependency-free normalizer whose behaviour can be read and
verified line by line:

1. **Library** (`persian-text.js`): character unification, diacritics, tatweel,
   digits, punctuation, spacing and ZWNJ rules; each rule switchable and counted.
2. **Offline browser application**: nothing is uploaded, no server, no analytics —
   it works without an internet connection, which matters for users in
   low-connectivity and restricted environments.
3. **CLI**: usable inside data pipelines and scripts.
4. **Test suite** with before/after cases, so the behaviour is pinned and
   regressions are visible.
5. **Extensible rule engine** designed to carry other Iranian languages
   (Kurdish, Balochi, Pashto) that have even less tooling.

## Who benefits

Persian-speaking developers, students, researchers, journalists, translators and
data teams; and indirectly any Persian NLP/AI project consuming their data.
Because the license is MIT and the code is readable, other projects can embed the
library instead of reinventing it.

## What funding would be used for

Proposed 12-month work plan (draft):

| Milestone | Deliverable |
| --- | --- |
| M1 | A public Persian normalization **benchmark**: a curated before/after corpus of real-world text, with a documented evaluation script. |
| M2 | Rule engine hardening: rare letter forms, common misspellings, morphological edge cases; experimental rules either made reliable or clearly scoped. |
| M3 | Packaging and distribution: stable releases, CLI documentation, integration examples for corpora and NLP pipelines. |
| M4 | Documentation and community: Persian and English guides, contribution process, onboarding for new contributors. |
| M5 | Language pack prototype for one additional Iranian language on the same engine. |

Indicative budget: **€[amount] over 12 months** — development [x]%,
corpus and testing [x]%, documentation and community [x]%, infrastructure and
administration [x]%.

## Impact measurement

- Adoption: downloads/clones, integrations in other projects, test corpus size.
- Correctness: percentage of benchmark cases handled, regression score per release.
- Ecosystem: number of external contributors and language packs.

## Team

**Hassan Malekan** — project owner and maintainer. Contact: senatormalek777@gmail.com

`[One or two sentences of true background: what you have worked on before,
relevant skills, and how the development work will actually be carried out.
This paragraph must be accurate — write it with Hassan before sending.]`

## European dimension (important for EU-funded programmes)

Several EU programmes require proposals from outside Europe to have a clear
European dimension and a real European partner. Options we should pursue:

- an EU-based open-source project or maintainer who adopts the library as a
  component and joins the proposal,
- an EU research or academic group working on low-resource / Iranian-family NLP,
- an EU language-technology community that can use the toolkit for European
  language minorities.

Candidates to approach (not yet contacted): the ACL-affiliated **SilkRoadNLP**
community for the Iranian language family, and the open-source projects already
inside the NLnet/NGI portfolio that work on text, translation and accessibility.

## Licensing and sustainability

MIT, no contributor licence agreement, no vendor lock-in. The project needs no
infrastructure to run: no server, no database, no ongoing costs, which makes it
cheap to fund and durable after the funding period.
