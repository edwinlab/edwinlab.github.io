# Local browser dependencies

Pinned on 11 October 2026 and extended on 12 October 2026. These files are official prebuilt JavaScript distributions copied from public npm registry archives. No npm installation, package manifest, bundler, transpilation, or build was used. Runtime requests stay local. Load a library only on pages that need it.

| Library | Exact version | Runtime entry | License / official documentation |
|---|---|---|---|
| jsonc-parser | 3.3.1 | `jsonc-parser/main.js` (ESM) | MIT · [Microsoft repository](https://github.com/microsoft/node-jsonc-parser) |
| yaml | 2.8.1 | `yaml/index.js` (ESM) | ISC · [YAML documentation](https://eemeli.org/yaml/) |
| Croner | 10.0.2-dev.0 | `croner/croner.js` (ESM) | MIT · [Croner repository](https://github.com/Hexagon/croner) |
| sql-formatter | 15.6.10 | `sql-formatter/sql-formatter.min.js` (classic UMD) | MIT · [SQL Formatter repository](https://github.com/sql-formatter-org/sql-formatter) |
| diff (jsdiff) | 9.0.0 | `jsdiff/diff.js` (classic UMD, global `Diff`) | BSD-3-Clause · [jsdiff README](https://github.com/kpdecker/jsdiff) |
| xml-formatter | 3.7.0 | `xml-formatter/xml-formatter.js` (classic UMD, global `xmlFormatter`) | MIT; bundled `xml-parser-xo` 4.1.5 is MIT · [xml-formatter README](https://github.com/chrisbottin/xml-formatter) |
| marked | 18.1.0 | `marked/marked.esm.js` (ESM) | MIT · [Marked documentation](https://marked.js.org/) |
| DOMPurify | 3.4.16 | `dompurify/purify.es.mjs` (ESM, dual Apache-2.0/MPL-2.0) | [DOMPurify repository](https://github.com/cure53/DOMPurify) |
| jsonpath-plus | 11.2.0 | `jsonpath-plus/index-browser-esm.js` (ESM) | MIT; bundle includes `jsep` 1.4.0 and the assignment 1.3.0 / regex 1.0.4 plugins (MIT) · [JSONPath Plus README](https://github.com/JSONPath-Plus/JSONPath) |

Each folder includes its upstream `LICENSE`. SQL Formatter's browser bundle embeds Nearley 2.20.1; its license is `sql-formatter/NEARLEY-LICENSE`. The bundled source was compared with Nearley 2.20.1's official archive using the SQL package source map. Argparse is a CLI dependency and is not included in this browser bundle; no CLI/transitive installation is required.

The 12 October browser distributions and transitive dependency archives are pinned in `provenance.json`; npm SHA-512 integrity was checked before extraction. The XML bundle includes the exact `xml-parser-xo` 4.1.5 version in the upstream release lock. JSONPath Plus 11.2.0's upstream lock pins the three bundled jsep packages; their MIT notices are retained beside the runtime. DOMPurify includes both offered license texts. Only the selected browser entries and license notices are shipped; package metadata, CLI and source maps stay out of the website.

## Provenance and reproduction

`provenance.json` records exact archive URLs, upstream SHA-512 integrity, downloaded archive SHA-256, and SHA-256 for every retained runtime/license file. Archive integrity was checked before extraction. Keep the provenance and licenses when updating or copying these dependencies.

To reproduce, download the exact archive URLs listed in provenance.json using curl or a browser. Verify SHA-512 against the recorded integrity, then extract only these paths:

- jsonc-parser: `package/lib/esm/**/*.js` → `jsonc-parser/`. Add `.js` to extensionless relative `from './...'` imports in that tree. **This is the only runtime source modification**; no parser behavior changes.
- yaml: `package/browser/dist/**/*.js` → `yaml/`, retaining the directory tree. Imports already include `.js`; no changes.
- Croner: `package/dist/croner.js` → `croner/croner.js`; unchanged.
- SQL Formatter: `package/dist/sql-formatter.min.js` → `sql-formatter/sql-formatter.min.js`; unchanged and already bundles its browser runtime dependency.
- jsdiff (`diff`): `package/dist/diff.js` → `jsdiff/diff.js`; unchanged classic UMD. Retain `package/LICENSE`.
- xml-formatter: `package/dist/browser/xml-formatter-singleton.js` → `xml-formatter/xml-formatter.js`; unchanged classic UMD. Retain its license and `xml-parser-xo` 4.1.5 MIT license. Its exact whitespace-only leaf limitation is documented in the XML tool task; that route is not linked as ready.
- Marked: `package/lib/marked.esm.js` → `marked/marked.esm.js`; retain package license.
- DOMPurify: `package/dist/purify.es.mjs` → `dompurify/purify.es.mjs`; retain both Apache-2.0 and MPL-2.0 license texts.
- JSONPath Plus: `package/dist/index-browser-esm.js` → `jsonpath-plus/index-browser-esm.js`; retain its MIT license and the bundled jsep 1.4.0 / assignment 1.3.0 / regex 1.0.4 MIT notices.
- Copy package `LICENSE` or `LICENSE.md` to each folder's `LICENSE`. Copy Nearley 2.20.1 `package/LICENSE.txt` to the SQL folder's `NEARLEY-LICENSE`.

Do not copy package.json, CLI files, Node/CommonJS distributions, or source maps into the website. Source maps were used only for license inspection in temporary storage. This is asset preparation, not a build step.

## Browser import examples

```js
import { createScanner, format, applyEdits, SyntaxKind } from '/tools/vendor/jsonc-parser/main.js';
import { parseDocument, isAlias, isMap } from '/tools/vendor/yaml/index.js';
import { Cron } from '/tools/vendor/croner/croner.js?v=10.0.2-dev.0';
import { marked } from '/tools/vendor/marked/marked.esm.js';
import createDOMPurify from '/tools/vendor/dompurify/purify.es.mjs';
import { JSONPath } from '/tools/vendor/jsonpath-plus/index-browser-esm.js';
```

`jsdiff/diff.js` and `xml-formatter/xml-formatter.js` are classic scripts, not ES modules. Load the former with `importScripts()` from a classic worker, and the latter the same way in the XML formatter worker. Marked's browser ESM parser does not sanitize output: always sanitize in the browser with the locally pinned DOMPurify before preview/export. Use JSONPath Plus only with `eval: false` and the selector allowlist enforced by its consumer.

JSON scanner/format APIs are available for future JSONlint lexical transformations. Do not use the vendor's recovery parser result as successful strict validation; shared/json.js checks syntax and guards first. Formatter edits retain source numeric lexemes and duplicate keys.

YAML's `parseDocument(text, { version: '1.2', schema: 'core', intAsBigInt: true })` exposes `doc.errors`, `doc.warnings`, `doc.contents`, scalar/pair/alias AST nodes, and `doc.toJS({maxAliasCount: 0})`. Integer values can be inspected as BigInt before conversion to Number. The future converter must enforce its subset via AST; core schema alone does not reject aliases or unsafe values.

Croner example for **calculation only**, without scheduling a callback:

```js
const cron = new Cron('0 9 1 * 1', { mode: '5-part', timezone: 'UTC' });
try {
  const upcoming = cron.nextRuns(5, new Date('2024-01-29T00:00:00Z'));
} finally { cron.stop(); }
```

Version 10.0.2-dev.0 uses OR when DOM and DOW are both restricted. The `+` DOW modifier selects AND and must be rejected by the future Unix-five-field tool. There is no `legacyMode` flag to add for this version. The tool still needs its grammar whitelist, time horizon, cancel/timeout, and DST fixtures. Mode alone does not restrict all extended syntax.

SQL Formatter must load as a **classic script before** the tool's module:

```html
<script src="/tools/vendor/sql-formatter/sql-formatter.min.js"></script>
<script type="module" src="./tool.js"></script>
```

Then call `globalThis.sqlFormatter.format(text, {language: 'postgresql', keywordCase: 'upper'})` or `language: 'mysql'`. Do not import the UMD file as an ES module: its top-level `this` would be undefined. A classic worker can use `importScripts('/tools/vendor/sql-formatter/sql-formatter.min.js')`, then `self.sqlFormatter.format(...)`. Foundation fixtures verify both page and worker loading.

## Verification

Serve the repository and open `/tests/tools/foundation.html`. Its fixtures cover all four library entry points, native ESM workers for JSON/YAML/Croner, and a classic worker for SQL. The test runner and template are noindex documents and are not public tool pages.

## Croner DST update — 11 October 2026

Pinned the official browser ESM distribution to **10.0.2-dev.0** after 10.0.1 failed the minutely fall-back regression (New York, 2024-11-03 05:59Z; next should be 06:00Z). This is an upstream prerelease containing [fix #344](https://github.com/Hexagon/croner/pull/344), not a local engine modification. Archive SHA-512 and retained-file SHA-256 are recorded in provenance.json; runtime is unchanged from the official archive. Imports use `?v=10.0.2-dev.0` to avoid stale module caches. Foundation and cron fixtures cover the regression. Cron scheduling dialect/DST policy still depends on the pinned library; no universal scheduler compatibility is promised.
