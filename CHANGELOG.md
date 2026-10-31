# Changelog

All notable changes to ParsNegar are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## 1.1.0

### Added
- Offline / installable web app: service worker with precached assets and a web app manifest.
- File loading in the interface (`.txt`, `.md`, `.csv`), processed entirely in the browser.
- Shareable input through the URL (`/?text=...` or `/#text=...`).
- Command line interface: `bin/parsnigar.js` with presets, per-rule flags, `--json` and `--stats`.
- Test suite: `tests/normalize.test.mjs` (14 cases, no dependencies).
- Security headers on every response (CSP, nosniff, referrer policy, permissions policy, frame options).
- English `About this project` section in the interface for international reviewers.
- README: privacy statement, CLI documentation, limitations section.

### Fixed
- The spacing rule returned the literal text `$1` instead of the captured punctuation when a space preceded punctuation (for example `سلام !` produced `سلام$1`).
- The spacing rule no longer reports a meaningless character-difference count; it now counts the actual fixes it applies.

### Changed
- Version strings in the library, the interface footer and the build metadata are now `1.1.0`.

## 1.0.0

### Added
- Initial release: character unification, diacritic and tatweel removal, digit conversion, punctuation and spacing cleanup, ZWNJ prefixes, experimental ZWNJ suffixes, text statistics and a word-level diff view.
- Persian-language interface, RTL layout, light and dark colour schemes, keyboard-accessible controls and reduced-motion support.
