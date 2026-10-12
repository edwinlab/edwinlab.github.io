# Edwin Lab

Personal website for Edwin Andrianto, a backend engineer and Technical Lead based in Tangerang, Indonesia.

## SEO review and improvement backlog

The website is live at https://edwinlab.dev/. The 12 October 2026 review and implementation TODOs for the homepage, blog integration, developer tools, and everyday tools are in [docs/seo-improvements/README.md](docs/seo-improvements/README.md). The review separates verified source/live findings from Search Console, HTTP-header, analytics, and performance checks that still need evidence. Creating the backlog does not mark its implementation tasks complete.

## Preview

No installation or build is required. From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/.

## Edit

- `index.html`: live page, biography, experience, repositories, writing and metadata.
- `css/site.css`: responsive layout, typography and brand colors.
- `js/site.js`: copy-email control, local WIB clock and active navigation.
- `assets/edwinlab-logo.png`: the owner's original logo.
- `fonts/manrope`, `fonts/instrument-serif`, `fonts/dm-mono`: self-hosted fonts with license files.
- `favicon/manifest.json`: site identity and icon configuration.
- `tools/index.html` and `tools/hub.css`: the static Developer Tools directory.
- Each developer-tool directory contains a real `index.html` plus local vanilla JavaScript.
- `sitemap.xml` and `robots.txt`: canonical public routes and crawler guidance.
- `tests/tools/index.html`: the noindex browser-fixture directory.
- `.nojekyll`: serve ready static files on GitHub Pages.

`index-master.html` is an archived 2022 profile marked `noindex`, with links to the current homepage and LinkedIn profile. `css/style.min.css` and `js/app.min.js` are legacy files; the redesigned homepage does not load them.

The homepage and developer tools are ready for the existing GitHub Pages user site, served from the repository root. The existing `CNAME` is `edwinlab.dev`. Routes are real directories with `index.html` files: `/`, `/tools/`, and the twelve tools listed below. GitHub Pages can serve them directly; there is no compiler, package installation, framework, or build step. Native JavaScript modules load over HTTP/HTTPS. Opening pages with `file://` is not supported because root-relative assets and module imports need a web server. Blog content remains at https://edwinlab.dev/blog/ and is linked using absolute URLs.

## Content sources

Career history and education were supplied in the owner's CV. The owner confirmed their current Technical Lead role at OCBC Indonesia and Tangerang location on 11 October 2026. The CV is not included in this repository. Overlapping historical role dates are preserved rather than interpreted as contract or part-time roles.

Public code descriptions come from these repositories and their READMEs:

- https://github.com/edwinlab/golang-api-skeleton
- https://github.com/edwinlab/mocky
- https://github.com/edwinlab/chat-api

Writing titles and original dates come from the owner's blog. These entries are presented as archived notes, not current technical recommendations.

Additional Developer Tools TODOs (14–23), browser-library readiness (14a), and batch integration (24) are in [docs/developer-tools/README.md](docs/developer-tools/README.md). These are unimplemented plans with scoped prompts, browser fixtures, and GPT-6 Luna medium/high recommendations.

## Checks

```sh
node --check js/site.js
git diff --check
```

Browser review covers 320, 390, 650, 768, 1024 and 1440 px widths, disclosure controls, email-copy feedback, and anchor navigation. Core navigation and disclosure content work without JavaScript. Copy email appears only when the Clipboard API is available in a secure context; a direct mail link remains available.

Developer Tools browser fixtures are listed at `/tests/tools/` and run without a build. Local verification on 11 October 2026: **321/321 fixtures passed** across foundation, twelve tools, and integration. The integration runner audits static metadata, links/assets, sitemap, direct refresh, examples, errors, copy/download preparation, stale results, local resources, no-JavaScript content, and responsive layouts. Actual download-file persistence is browser-dependent; fixtures verify Blob content and download dispatch.

The hub has no application JavaScript; its navigation and cards are ordinary HTML links. Heavy local dependencies load only in their consuming tools. SQL and regex processing run in terminable workers; user regex never executes on the main thread.

| Tool | Route |
|---|---|
| JSON Validator & Formatter | `/jsonlint/` |
| JSON Diff | `/json-diff/` |
| Unix Timestamp Converter | `/timestamp-converter/` |
| JWT Decoder | `/jwt-decoder/` |
| Base64 Encoder / Decoder | `/base64/` |
| URL Encoder / Decoder | `/url-encoder-decoder/` |
| Cron Expression Explainer | `/cron-expression/` |
| UUID v4 Generator | `/uuid-generator/` |
| JSON ↔ YAML Converter | `/json-yaml-converter/` |
| JSON ↔ CSV Converter | `/json-csv-converter/` |
| SQL Formatter | `/sql-formatter/` |
| JavaScript Regex Tester | `/regex-tester/` |

All tools process input locally without uploads or browser storage. Their documented limits and dialect/data-type constraints still apply. New pages are locally ready; publication, live HTTPS/redirect checks, Search Console submission, and traffic measurement are separate steps. See `docs/developer-tools/13-integration-seo.md` for evidence and remaining public checks.
