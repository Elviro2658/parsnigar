# Contributing to ParsNegar

Thanks for helping Persian text tooling get better. Contributions of every size
are welcome.

## The most useful thing you can send

A **before/after pair**: the text you had, the output ParsNegar produced, and the
output you expected. That single report is worth more than a general suggestion,
because the rules are all about specific edge cases.

## Reporting a bug

Please include:

1. The input text (as short as possible while still showing the problem).
2. The output ParsNegar produced.
3. The output you expected.
4. Which rules were enabled (or the preset name).
5. The version shown in the footer, and the browser or Node version.

## Working on the code

```sh
node tests/normalize.test.mjs   # the suite must stay green
node bin/parsnigar.js --help    # smoke-test the CLI
```

Guidelines:

- One rule, one change. Keep the rule engine explicit and readable; a reader
  should be able to tell exactly what a rule does to a string.
- Add a test case for every behavioural change.
- Keep the library dependency-free and usable in a plain `<script type="module">`.
- Persian user-facing text should read naturally; code comments are in English.
- Do not introduce network calls. The toolkit is local-only by design.

## Adding a rule

1. Add an entry to `RULES` in `public/persian-text.js` with `id`, `label`,
   `description` and an `apply(text, options)` that returns `{ text, count }`.
2. Mark it `experimental: true` if it can be wrong on real text.
3. Add a checkbox to `public/index.html` (`data-option="<id>"`).
4. Add preset entries in `PRESETS` where relevant.
5. Add tests and a README row.

## Adding a language pack

The rule engine is intentionally language-agnostic. A new Iranian language pack
should be a separate module that reuses `RULES`, `normalize()` and
`computeStats()` and supplies its own character maps and stopword lists.

## License

By contributing you agree that your work is released under the MIT license of
this repository.
