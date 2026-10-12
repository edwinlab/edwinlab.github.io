# 19 — Markdown Preview

Status: **rencana saja — belum diimplementasikan**. Semua checkbox eksekusi tetap kosong.
Route: `/markdown-preview/`; canonical: `https://edwinlab.dev/markdown-preview/`.
Model setiap tahap: **GPT-6 Luna · high**. Dependency dan security fixtures dikerjakan sebelum UI; satu tahap per chat.

## Tujuan dan scope V1

Preview Markdown untuk README, notes, dan draft documentation: headings, paragraphs, emphasis, lists, blockquotes, fenced/inline code, tables, strikethrough, dan task-list markers. Parser `marked` dengan GFM aktif dan `breaks:false`, tanpa extension. Input Markdown, explicit `Preview Markdown`, example, clear/cancel, sandboxed visual preview, readonly sanitized HTML source, copy HTML, dan download HTML aman.

Raw HTML disabled: block/inline HTML tampil escaped sebagai teks, termasuk tags yang tampak benign. Semua HTML yang dihasilkan parser tetap disanitasi DOMPurify sebelum preview atau export. Links tampil sebagai labels tanpa hyperlink; image syntax tampil sebagai alt-text placeholder tanpa `<img>`. Ini kebijakan V1 agar preview tidak dapat melakukan request atau navigasi. Task-list markers tampil teks `[ ]`/`[x]`, tanpa controls aktif. Tulis batas itu pada UI dan panduan.

Tidak termasuk live preview per keystroke, HTML playground, clickable links, remote images, file upload, URL/import fetch, custom HTML/CSS/JS, syntax highlighting, Mermaid/math, front matter processing, footnotes, plugins, PDF, GitHub-specific extensions/rendering guarantee, autosave, sharing, network API, atau backend. Semua input lokal; hasil preview tetap membatasi formatting Markdown yang menghasilkan tags allowlisted.

## Prasyarat, dependency, dan kepemilikan

- [ ] Baca instruksi repository, README repo, [README.md](README.md), [CONTRACT.md](CONTRACT.md), [EXTENSION-CONTRACT.md](EXTENSION-CONTRACT.md), dan [14a-library-readiness.md](14a-library-readiness.md). Foundation 00 serta readiness `marked` dan DOMPurify 14a harus selesai sebelum tahap 1.
- [ ] Periksa shared aktual: `ui.js` menyediakan `setStatus`, `copyText`, `downloadText`, `readTextFile`; `limits.js` menyediakan UTF-8 `assertTextSize`, baseline 5/10 MiB dan depth 100. Terapkan limit Markdown lebih kecil di bawah tanpa mengubah shared.
- [ ] Miliki hanya `markdown-preview/index.html`, `tool.js`, `logic.js`, `worker.js`, opsional `style.css`, `tests/tools/markdown-preview.test.js`, dan `tests/tools/markdown-preview.html`.
- [ ] Perbarui checkbox/hasil aktual dokumen ini; setelah semua tahap lulus, perbarui hanya row task 19 README sesuai EXTENSION-CONTRACT. Hub/sitemap/navigation/test index tetap integrator.
- [ ] Gunakan shared CSS/helper/template/harness existing. Jangan mengubah shared, vendor/provenance, halaman tool lain, homepage, CNAME, atau manifest global dari task 19.
- [ ] `marked` resmi mempunyai browser UMD `lib/marked.umd.js` dan ESM `lib/marked.esm.js`; gunakan distribusi tepat yang sudah vendored oleh 14a, native module worker untuk ESM atau classic worker+`importScripts` untuk UMD sesuai smoke test. Marked sendiri **tidak melakukan sanitasi**. [Dokumentasi browser resmi Marked](https://marked.js.org/)
- [ ] DOMPurify resmi menyediakan ready browser `dist/purify.min.js` dan membutuhkan browser DOM; 14a mem-pin file/versi/lisensi/checksum serta menguji load order/support. DOMPurify berjalan dalam bounded main-thread sanitizer, bukan worker tanpa DOM. Jangan tambahkan jsdom/backend. [README resmi DOMPurify](https://github.com/cure53/DOMPurify#how-do-i-use-it)
- [ ] 14a memverifikasi renderer API versi dipin, escaping raw HTML/image/link/task markers, worker load, DOMPurify allowlist/support, serta security fixtures minimal. Pakai instance `Marked` tersendiri; jangan mengubah global defaults atau mendaftarkan renderer berulang setiap proses. [API renderer resmi](https://marked.js.org/using_pro#renderer)
- [ ] Tidak ada npm/package.json/framework/bundler/transpiler/compiler/CDN/remote import/runtime download. Jika vendor/support/API tidak tersedia, fail closed dan laporkan blocker dependency, bukan fallback sanitizer regex atau preview raw HTML.

## Boundary keamanan yang wajib

CONTRACT lama melarang input HTML melalui `innerHTML`. Narrow exception pada EXTENSION-CONTRACT hanya mengizinkan **hasil yang sudah disanitasi** ke inert preview sink. Task ini menggunakan `iframe.srcdoc` untuk trusted wrapper + sanitized fragment; tidak menyisipkan raw source/parser HTML atau preview ke main document melalui `innerHTML`, `outerHTML`, `insertAdjacentHTML`, atau `document.write`. Editors/status selalu `.value`/`textContent`.

- [ ] Pipeline wajib: size check → parse/token bounds di worker → renderer dengan raw HTML escaped/inert links/images → generated HTML byte check → DOMPurify strict sanitation → sanitized HTML check → preview/export. Tidak ada sink sebelum sanitizer dan tidak ada fallback render saat sanitizer error/tidak supported.
- [ ] Raw HTML renderer meng-escape `& < > " '` sebagai teks; code blocks/inline code juga tetap escaped. Jangan mengganti seluruh source melalui regex, mengaktifkan obsolete Marked `sanitize` option, atau memakai sanitizer buatan sendiri.
- [ ] Semua link/reference/autolink/image renderer tidak menghasilkan `href`, `src`, `srcset`, `xlink:href`, atau URL attribute lain. Label/alt text tetap escaped/rendered sebagai Markdown text sesuai hook resmi, lalu disanitasi. Jangan memuat images bahkan dari relative/local/data/blob URLs.
- [ ] URL policy V1: **tidak ada URL-bearing attribute pada output fragment**. `javascript:`, `vbscript:`, `data:`, `blob:`, protocol-relative/relative URLs, encoded/obfuscated schemes, fragment URLs, dan http(s)/mailto semuanya inert labels/alt text. URL literal dalam paragraph/code boleh tampil sebagai teks; tidak auto-link menjadi clickable node. Kebijakan ini tidak bergantung pada CSP navigation directive yang belum seragam.
- [ ] DOMPurify menggunakan exact `ALLOWED_TAGS`: `p`, `h1`–`h6`, `blockquote`, `ul`, `ol`, `li`, `pre`, `code`, `strong`, `em`, `del`, `hr`, `br`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `a`; **`ALLOWED_ATTR: ['start']`**, `ALLOW_DATA_ATTR:false`, `ALLOW_ARIA_ATTR:false`, `SANITIZE_DOM:true`, `SANITIZE_NAMED_PROPS:true`. Sanitizer hook versi dipin membolehkan `start` hanya pada `ol` dengan positive decimal integer ≤999.999.999, agar list seperti `5. item` tidak diam-diam mulai dari 1. Semua atribut lain dilarang. Tidak menggabungkan `USE_PROFILES` dengan `ALLOWED_TAGS` karena profile menimpa allowlist. [Konfigurasi resmi DOMPurify](https://github.com/cure53/DOMPurify#can-i-configure-dompurify)
- [ ] Dengan allowlist itu, script/style/form/input/button/iframe/object/embed/svg/math/base/meta/link/media/template/custom elements serta event/style/id/name attributes tidak dapat muncul dalam fragment. Fenced-code language class dan table alignment attributes boleh hilang; tidak menambah allowlist agar output tampak lebih lengkap.
- [ ] `DOMPurify.isSupported` harus true dan API tersedia sebelum controls processing aktif; selain itu status `Safe preview is unavailable in this browser.` Jangan menampilkan unsanitized HTML atau memberi sukses palsu.
- [ ] Preview memakai `<iframe title="Markdown preview" sandbox="" referrerpolicy="no-referrer">`: tanpa allow-scripts, allow-same-origin, forms, downloads, popup, atau top navigation. Jangan mengurangi sandbox untuk resize/readback atau library injection; sanitasi dilakukan sebelum srcdoc.
- [ ] Trusted wrapper srcdoc dan download memiliki CSP meta **sebelum isi/style**: `default-src 'none'; script-src 'none'; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; style-src 'unsafe-inline'`. Satu inline style tetap buatan aplikasi boleh mengatur typography/table/code; user style tetap dilarang. Meta CSP bukan pengganti iframe sandbox. [HTML sandbox](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox), [CSP meta semantics](https://w3c.github.io/webappsec-csp/#meta-element)
- [ ] Fragment sanitized tidak dimodifikasi/diparse ulang oleh library lain setelah sanitasi; wrapper hanya menambahkan konstanta aplikasi yang sudah dipercaya. Sumber HTML textarea menampilkan fragment sanitized. Copy hanya fragment itu; download `markdown-preview.html` memakai trusted wrapper/CSP yang sama, tanpa input mentah, scripts, atau external assets.

## Tahap 1 — library adapter, security pipeline, dan fixtures

Model: **GPT-6 Luna · high**. Deliverable: logic/worker/runner dan fixtures positif+negatif, belum full UI.

- [ ] Buat parsing/renderer adapter `logic.js` dengan input/opsi eksplisit; tanpa akses forms, storage, network, atau globals yang berubah antarrun. Exports parsing worker dan sanitation browser dipisahkan jelas; DOMPurify tidak diimpor oleh worker.
- [ ] Buat worker untuk Marked lexer/renderer; `gfm:true`, `breaks:false`, `async:false`, tanpa plugins/fetch hooks. Renderer dibuat satu kali per worker instance dan diverifikasi untuk block HTML, inline HTML, links/autolinks/reference links, images/reference images, task-list markers.
- [ ] Limit: input **256 KiB UTF-8**, generated/sanitized fragment **1 MiB UTF-8**, full export/wrapper **1 MiB UTF-8**, token count **20.000**, nested token depth **100**. Exact boundary diterima. Count token tree iteratif sebelum renderer; lexer sendiri tetap dibatasi byte dan deadline worker.
- [ ] Deadline worker **3 detik** dari dispatch; timeout terminasi memberi `TIMEOUT`. Cancel/input change/clear/new process terminasi worker dan mengabaikan message dengan request ID lama. Marked resmi merekomendasikan worker+termination untuk parsing yang terlalu lama. [Dokumentasi worker Marked](https://marked.js.org/using_advanced#workers)
- [ ] Tolak output terlalu besar sebelum DOMPurify/iframe/copy/export; helper assertTextSize memakai code INPUT_TOO_LARGE sehingga adapter wajib memberi code/message `OUTPUT_TOO_LARGE` saat output. Jangan sekadar memotong source/HTML menjadi markup rusak.
- [ ] DOMPurify synchronous tidak bisa dihentikan worker timer. Ukur sanitation/render pada fixture maksimum; bila main thread terkunci >250 ms pada browser QA, kecilkan limit secara terdokumentasi atau laporkan blocker sebelum selesai. Jangan menyebut deadline worker sebagai deadline hard untuk sanitizer main thread.
- [ ] Empty/whitespace input memberi idle guidance tanpa sukses kosong; parser/sanitizer/load error menghapus current result, tidak mengubah input, dan menonaktifkan export.

## Fixture browser-native wajib

- [ ] Markdown synthetic mencakup heading, paragraph, bold/emphasis, ordered/unordered list termasuk start 5, blockquote, code/fence, GFM table/strikethrough/task marker; sanitized output memuat struktur expected, starting number benar, code literal escaped, task markers inert text.
- [ ] Single newline tetap soft break karena `breaks:false`; explicit hard break bekerja; Unicode/emoji, CRLF/LF, escaped Markdown, reference links, dan repeated previews sesuai pinned parser. Tidak mengklaim output sama persis GitHub.
- [ ] `[Docs](https://example.invalid/docs)`, autolink, `[anchor](#x)`, relative/protocol-relative/mailto links, dan `![image](https://example.invalid/pixel)` hanya inert text/label. Tidak ada `href`, `<img>`, resource attributes, navigation, atau request network bahkan saat clicked.
- [ ] Raw `<b>hello</b>`, `<script>...</script>`, `<img src=x onerror=...>`, `<iframe srcdoc=...>`, SVG/MathML, form/base/meta refresh/style/import, HTML comments, dan mixed block/inline HTML tampil sebagai escaped text bila raw Markdown HTML; tidak menjadi nodes dari source.
- [ ] URL attacks `[x](javascript:alert(1))`, `data:text/html`, `vbscript:`, mixed-case schemes, entity-encoded/control-character/percent-encoded schemes, malicious reference URLs, quote breakouts, dan nested image/link syntax menghasilkan fragment tanpa URL/event attrs.
- [ ] Uji sanitizer langsung dengan dirty HTML hasil mock parser: scripts, event handlers, style url(), svg/math namespace payload, template, form/input/name/id clobbering, `__proto__`, `data-*`, `aria-*`, resource URLs, iframe/object/embed dan malformed HTML → hanya tags allowlisted tanpa attributes selain valid `ol[start]`. Invalid/misplaced/URL-like `start` ditolak. Pengujian sanitizer wajib meski renderer raw HTML disabled.
- [ ] Classic mutation-XSS fixture dari regression examples DOMPurify versi dipin serta malformed table/SVG/MathML markup tidak membentuk executable nodes setelah dimasukkan ke real sandboxed iframe. Contoh milik repo sanitizer dipakai sebagai security fixtures, bukan klaim semua XSS di dunia sudah dibuktikan.
- [ ] Missing/unsupported DOMPurify, throw sanitizer, parser exception, oversized output/wrapper, depth 101, >20.000 tokens, exact/over UTF-8 limits dengan emoji, dan lexer deadline → fail closed/no srcdoc update/no stale export.
- [ ] DOM fixture memeriksa iframe sandbox kosong dan CSP prefix, tidak ada allow-* escape token, wrapper tanpa user meta/style/scripts, sanitized source copy/download sama dengan hasil current. Contoh marker script tidak pernah berjalan dan main document tidak memperoleh node user HTML.
- [ ] Security test mengamati DOM, console/dialogs/navigation dan Network pada preview aktual melalui browser; tests tidak membaca opaque iframe DOM dengan menambah allow-same-origin. Inspect fragment/wrapper sebelum sink dan gunakan browser observation untuk efek setelah sink; sandbox bukan alasan melewati sanitasi.
- [ ] Cancel/timeout dengan worker fixture terkontrol, edit input saat parsing/sanitation scheduling, job lama datang setelah job baru, clear/error setelah sukses, clipboard denial dan UTF-8 download → hasil/export hanya current request.

## Tahap 2 — UI, static SEO, dan aksesibilitas

Model: **GPT-6 Luna · high**. Mulai sesudah seluruh fixture keamanan tahap 1 lulus.

- [ ] HTML statis memuat breadcrumb, H1/intro, permanently labeled Markdown textarea, explicit preview/example/clear/cancel, iframe title, readonly `Sanitized HTML` textarea, copy/download, batas/link-image/raw-HTML notes, status `aria-live="polite"`, dan noscript.
- [ ] Preview iframe bertinggi terbatas dengan scroll internal; labels dan description menjelaskan links/images inert. Gunakan system fonts dalam trusted frame CSS, code overflow dan tables scroll, bukan menambah remote stylesheet/font.
- [ ] `tool.js` menghubungkan shared status/copy/download dan request IDs; input berubah segera reset iframe ke trusted empty state, kosongkan HTML output, matikan export, dan cancel job. Tombol preview manual; tidak otomatis menjalankan payload besar per keystroke.
- [ ] Download HTML memakai full safe wrapper, UTF-8 meta, filename tetap dan MIME `text/html;charset=utf-8`; copy sanitized fragment sesuai label. Semua input/error/source `.value`/`textContent`, termasuk attacker strings.
- [ ] Contoh sama dengan fixture positif, tanpa data pribadi/remote media; example/clear mengganti source secara sengaja dan mengikuti invalidation. Clipboard denied memberi manual copy instructions melalui shared helper.
- [ ] Title: `Markdown Preview Online — Safe Local Preview | Edwin Lab`; H1: `Markdown Preview`.
- [ ] Meta description: `Preview Markdown locally with headings, lists, tables, and code blocks. Raw HTML, links, and images stay inert in a sandboxed preview with sanitized HTML export.`
- [ ] Intro: `Check the structure of your Markdown locally, with a safe preview for README files and documentation drafts.` Canonical/OG/favicon/logo/lang/schema mengikuti CONTRACT.
- [ ] Panduan HTML statis: paste, preview, inspect sanitized source, copy/download; contoh Markdown nyata, supported GFM features, raw HTML policy, inactive links/images, safety/local privacy, dan limits. Metadata tidak menjanjikan full GitHub compatibility atau arbitrary HTML rendering.
- [ ] FAQ terlihat: `Can I preview raw HTML?`, `Why don't links or images load?`, `Does this match GitHub Markdown exactly?`, `What is included in the HTML download?`; related kandidat `/xml-formatter/` dan `/jsonlint/` hanya jika siap dan terintegrasi.
- [ ] QA 320/390/768/1440 px, keyboard/focus/status/disabled controls, iframe traversal, textarea selection, code/table overflow, accessible labels dan contrast; static help tetap tersedia tanpa JS.

## Tahap 3 — QA dan Definition of Done

Model: **GPT-6 Luna · high**. Completion memerlukan bukti security dan UI browser.

- [ ] Jalankan `/tests/tools/markdown-preview.html` dengan harness existing melalui HTTP lokal; semua fixtures lulus, runner `noindex,nofollow`, pinned vendor terload tanpa bare/remote imports.
- [ ] Direct `/markdown-preview/` dan refresh, positif/negatif preview aktual, examples, stale/clear/cancel/errors, copy success/denied, download safe HTML, keyboard, small/large viewports, dan no-JS content teruji.
- [ ] Console bersih pada normal use; security payload tidak mengeksekusi script/membuka dialogs/navigasi. Network menunjukkan hanya aset lokal aplikasi dan tidak ada request dari source/preview/export content. Tidak ada input ke query/hash/storage/persistent log/analytics.
- [ ] `git diff --check` lulus; audit semua HTML sinks, iframe CSP/sandbox dan dependency provenance. Tidak ada sink raw source atau parser-generated HTML di main DOM.
- [ ] Catat exact Marked/DOMPurify versions, renderer recipe, allowlist, fixture counts, browser+viewport, main-thread timings, timeout/limits, copy/download QA, serta kebutuhan integrasi pada dokumen ini.
- [ ] Centang row 19 README hanya jika semua tahap/security fixtures/QA terbukti lulus. Browser unavailable atau security failing tetap belum selesai dengan reproduksi dan blocker yang jelas. Jangan commit, push, publish, atau deploy.

## Hasil eksekusi

Belum dijalankan. Isi saat eksekusi: tahap/file berubah, pinned dependency versions, fixture lulus/gagal, security+network observations, browser+viewport, timing, actual limits dan integration requests.

## Prompt siap tempel per tahap

```text
Kerjakan tahap 1 saja docs/developer-tools/19-markdown-preview.md dengan GPT-6 Luna reasoning high.
Baca README, CONTRACT, EXTENSION-CONTRACT, 14a-library-readiness dan shared ui/limits aktual.
Pastikan Marked+DOMPurify browser lokal siap. Buat worker adapter, renderer raw-HTML disabled,
strict sanitizer, trusted srcdoc wrapper/CSP dan positive/negative browser fixtures sebelum UI.
Links/images inert, no URL/event attrs, sandbox kosong, no scripts/network. Sanitizer fail closed.
Jangan masukkan raw source/parser HTML ke main DOM, pakai regex sanitizer, CDN/npm/build, atau tambah fitur.
Hanya file milik task; catat bukti tahap 1, jangan mark full completion/commit/push/deploy.
```

```text
Kerjakan tahap 2 saja docs/developer-tools/19-markdown-preview.md dengan GPT-6 Luna reasoning high.
Baca kontrak/ownership dan hasil tahap 1; lanjutkan hanya jika security fixtures lulus.
Buat UI Inggris, sandboxed manual preview, sanitized HTML copy/download, static SEO/help dan aksesibilitas.
Ikuti invalidation/cancel/request IDs, exact iframe CSP/sandbox dan inert links/images policy.
Hanya file task; jangan ubah shared/vendor/global integration. Verifikasi UI dan catat bukti.
Jangan commit/push/publish/deploy.
```

```text
Kerjakan tahap 3 QA docs/developer-tools/19-markdown-preview.md dengan GPT-6 Luna reasoning high.
Jalankan seluruh fixtures+browser QA, security payloads/no-network/no-script, CSP/sandbox sink audit,
stale/cancel/timeouts, sanitizer timings, HTML export/copy, keyboard dan responsive states.
Perbaiki hanya file milik task. Catat hasil aktual; checkbox hanya jika terbukti lulus.
Update hanya row 19 README bila seluruh DoD terpenuhi. Jangan commit/push/publish/deploy.
```
