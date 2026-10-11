# Edwin Lab

Personal website for Edwin Andrianto, a backend engineer and Technical Lead based in Tangerang, Indonesia.

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
- `jsonlint/index.html` and `json-diff/index.html`: browser-based JSON tools.

`index-master.html`, `css/style.min.css`, and `js/app.min.js` are legacy files; the redesigned homepage does not load them.

The homepage and developer tools are ready for the existing GitHub Pages user site, served from the repository root. The existing `CNAME` is `edwinlab.dev`. Routes are real directories with `index.html` files: `/`, `/tools/`, `/jsonlint/`, and `/json-diff/`. GitHub Pages can serve them directly; there is no compiler, package installation, framework, or build step. Native JavaScript modules load over HTTP/HTTPS. Opening pages with `file://` is not supported because root-relative assets and module imports need a web server. Blog content remains at https://edwinlab.dev/blog/ and is linked using absolute URLs.

## Content sources

Career history and education were supplied in the owner's CV. The owner confirmed their current Technical Lead role at OCBC Indonesia and Tangerang location on 11 October 2026. The CV is not included in this repository. Overlapping historical role dates are preserved rather than interpreted as contract or part-time roles.

Public code descriptions come from these repositories and their READMEs:

- https://github.com/edwinlab/golang-api-skeleton
- https://github.com/edwinlab/mocky
- https://github.com/edwinlab/chat-api

Writing titles and original dates come from the owner's blog. These entries are presented as archived notes, not current technical recommendations.

## Checks

```sh
node --check js/site.js
git diff --check
```

Browser review covers 320, 390, 650, 768, 1024 and 1440 px widths, disclosure controls, email-copy feedback, and anchor navigation. Core navigation and disclosure content work without JavaScript. Copy email appears only when the Clipboard API is available in a secure context; a direct mail link remains available.

Developer Tools browser fixtures are available at `/tests/tools/foundation.html`, `/tests/tools/jsonlint.html`, and `/tests/tools/json-diff.html`. These run in the browser without a build. The hub has no application JavaScript; its navigation and cards are ordinary HTML links.
