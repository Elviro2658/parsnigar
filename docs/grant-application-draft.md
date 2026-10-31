# ParsNegar — grant application pack (draft)

Two things are in this file:

1. An **eligibility email** to send *before* writing the full application.
2. A **draft application skeleton** for NLnet / NGI Zero (the best-fitting
   programme for this project).

> **Read this first.** Everything in `[square brackets]` must be replaced with
> true information about you. Do not send an application containing claims that
> are not accurate about your background, skills or plans — grant reviewers
> check, and a false statement can disqualify the project permanently. The
> project facts (what the toolkit does, license, status) are verifiable: the
> code is public.

---

## 0. Before anything: the two blocking questions

Two things decide whether this application is worth sending. Ask them in one
short email, and don't write the full application until you have answers.

1. **Can a resident of Iran apply and receive a grant?**
   NLnet's published eligibility text says there are "no categorical exclusions
   of persons who may not receive support", but proposals from outside
   Horizon Europe countries need a clear **European dimension**. Confirm what
   that means in practice for a solo applicant.
2. **How would the money be paid?**
   NLnet pays by bank transfer in EUR. Iranian bank accounts cannot receive
   international transfers. This must be solved *before* applying, not after
   being accepted.

---

## 1. Eligibility email (draft)

**Subject:** Eligibility question — applicant resident in Iran, open-source Persian text toolkit

Dear NLnet team,

I would like to submit a proposal to your open call, and I want to confirm
eligibility before I take your time with a full application.

**The project:** ParsNegar, an open-source (MIT) Persian text normalization
toolkit — a dependency-free JavaScript library, an offline browser application,
and a command line tool. It unifies Arabic letter forms, removes diacritics and
kashida, handles the Persian half-space (ZWNJ), normalizes digits and
punctuation, and reports statistics and a diff. It is a digital commons for a
language that has very little free tooling. The code and a live demo are public:
[demo URL].

**My questions:**

1. I am **resident in Iran**. Your eligibility page states there are no
   categorical exclusions, but that proposals from outside Horizon Europe
   countries need a clear "European dimension". What would count as a sufficient
   European dimension for a solo applicant — for example, an EU-based
   collaborator, an EU open-source project adopting the library, or an EU
   academic partner in low-resource language technology?
2. **Payments:** how are grants paid, and is there a payment route that works for
   a grantee who cannot receive international bank transfers? I want to be sure a
   grant could actually reach me before applying.
3. Is there a preference between your active funds for a project of this kind
   (text normalization, language technology, open data)?

Thank you for your time — a yes/no on the first two points is enough for me to
decide whether to submit.

Best regards,
Hassan Malekan
senatormalek777@gmail.com

---

## 2. Application skeleton (NLnet / NGI Zero style)

### Contact

- Name: Hassan Malekan
- Email: senatormalek777@gmail.com
- Country of residence: Iran
- Organisation: (none — applying as an individual; NLnet accepts individuals
  without a legal entity)
- Website / repository: `[project URL]`

### Project title

ParsNegar — an open normalization standard for Persian text

### Abstract (100–150 words)

Persian text on the web is inconsistent at the character level: Arabic letter
forms, optional diacritics, kashida, missing half-spaces and mixed digit sets
mean the same word is written many ways. Every downstream task — search,
deduplication, corpora, machine translation, speech recognition, language
models — inherits that noise. ParsNegar is an open-source (MIT) toolkit that
normalizes Persian text with explicit, inspectable rules: a dependency-free
JavaScript library, an offline browser application where no text leaves the
device, and a command line tool. Work under this grant would add a public
normalization benchmark, harden the rule engine, package stable releases, and
extend the engine to a second Iranian language.

### Relevance to the fund / the internet as a commons

- **Digital commons**: MIT-licensed, dependency-free, no vendor, no server, no
  telemetry. It can be embedded by anyone.
- **Language diversity**: Persian has very little free tooling; normalization is
  the prerequisite for everything else. The rule engine is built to extend to
  Kurdish, Balochi and Pashto, which have even less.
- **Privacy and resilience**: the application runs fully client-side and works
  offline, so it is usable where connectivity is poor or filtered.
- **Interoperability**: a documented, testable normalization standard is
  reusable by other projects instead of each team writing its own ad-hoc rules.
- **European dimension**: `[describe the real European partner: an EU-based
  open-source project that adopts the library, or an EU academic/community
  collaborator in low-resource NLP. Must be a real, contacted partner.]`

### Technical approach

- Pure JavaScript rule engine (`RULES` table), each rule explicit, individually
  switchable, and reporting how many replacements it made.
- No dependencies, no build step required to use the library; works in the
  browser as an ES module and in Node for CLI use.
- Deterministic, inspectable behaviour: every change is visible in a word-level
  diff, and edge cases are pinned by a test suite.
- Offline-first web app (service worker + manifest), strict security headers,
  no network calls at all.

### Deliverables

| # | Deliverable | Notes |
| --- | --- | --- |
| 1 | Public Persian normalization benchmark corpus + evaluation script | Real-world before/after pairs, versioned in the repository |
| 2 | Rule engine v1.2 (rare forms, common misspellings, morphological edge cases) | With regression tests per release |
| 3 | Stable releases + integration guide (corpora, NLP and translation pipelines) | Reproducible builds |
| 4 | Persian and English documentation + contribution guide | Reviewable by non-developers |
| 5 | Language pack prototype for one additional Iranian language | Same engine, new character maps and stopword lists |

### Timeline (12 months)

- **Months 1–3** — benchmark: collect and license evaluation text, build the
  scoring script, publish baseline numbers.
- **Months 4–6** — rule engine hardening driven by the benchmark's failures.
- **Months 7–9** — packaging, releases, integration examples, documentation.
- **Months 10–12** — language pack prototype, community onboarding, final report.

### Budget (draft — must be a real number you can defend)

| Item | Share | Purpose |
| --- | --- | --- |
| Development | `[x]%` | rule engine, benchmark tooling, language pack |
| Corpus and testing | `[x]%` | sourcing, licensing and reviewing evaluation text |
| Documentation and community | `[x]%` | Persian/English docs, onboarding, review of contributions |
| Infrastructure and admin | `[x]%` | hosting, releases, accounting |

Total: **€`[amount]` over 12 months.**

### Team and prior work

`[This is the part only you can write, and it must be true. One short paragraph:
what you have built or worked on before, what you are good at, and how the work
will actually get done. If the development is carried out with AI assistance or
with a collaborator, say so plainly — reviewers care about honesty and
feasibility far more than about a perfect CV.]`

### Sustainability after the grant

No running costs: no server, no database, no paid dependencies. The library stays
MIT and usable indefinitely. Ongoing maintenance can be covered by later small
grants, bounty work, or adoption by other projects.

---

## 3. Other programmes to send the same material to

- **Mozilla Technology Fund** — open-source technology in the public interest; up to $50,000.
- **Shuttleworth Foundation Fellowship** — explicitly not limited by geography; individual-focused.
- **O'Shaughnessy Fellowship** — up to $100,000 equity-free, open worldwide.
- **Superteam Earn** — bounties paid in USDC to a crypto wallet; the fastest route to a first real income, and a useful signal of working in public.

## 3b. Bank-based grants: the legitimate "no foreign account" route

Paying a grant into a **friend's or relative's private account abroad is not a
workable route**, and it is not a route worth taking:

- grant agreements are made with the *beneficiary*, and funds must reach that
  beneficiary. Paying a third party's account usually fails the funder's own
  compliance checks;
- it creates tax and reporting exposure for the person who owns the account;
- it puts a personal relationship at risk if anything goes wrong (frozen account,
  an audit, a misunderstanding).

The proper structure for exactly this problem is **fiscal hosting**: an
established non-profit becomes the legal recipient of the grant and holds the
money for the project, while the project stays fully autonomous. This is a normal
arrangement for open-source work that has no legal entity.

Candidates to investigate (both are EU-based, which also helps with the
"European dimension" requirement):

- **Open Source Europe** (non-profit, Belgium) — provides fiscal hosting to open
  source projects without a legal entity of their own: opensourceeurope.org
- **Open Source Collective** (non-profit, US) — the largest fiscal host for open
  source: docs.oscollective.org

The question to ask them in writing, before anything else:

> "I maintain an MIT-licensed open-source project. I cannot open a bank account in
> my country of residence. Can you act as a fiscal host for a grant awarded to
> this project, and what payout options can you offer to a maintainer who cannot
> use Wise, PayPal or a local bank?"

If the answer is no, the realistic path for the first grant stays crypto-native
(Superteam bounties, Giveth, web3 ecosystem grants that pay to a wallet).

## 4. What must be true before sending

- [ ] A crypto wallet exists and can receive funds (or another payout route is confirmed).
- [x] A professional email address is set up: senatormalek777@gmail.com (enable two-factor authentication on it).
- [ ] The eligibility email has been answered by NLnet.
- [ ] A real European partner is identified and has agreed in writing.
- [ ] Every `[bracketed]` item is replaced with true information.