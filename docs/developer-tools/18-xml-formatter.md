# 18 — XML Formatter

Status: **rencana saja — belum diimplementasikan**. Semua checkbox eksekusi tetap kosong.
Route: `/xml-formatter/`; canonical: `https://edwinlab.dev/xml-formatter/`.
Model setiap tahap: **GPT-6 Luna · high**. Jalankan satu tahap per chat agar konteks kecil; tahap berikutnya memakai hasil tahap sebelumnya.

## Tujuan dan scope V1

Format dokumen XML 1.0 sederhana untuk konfigurasi dan payload API: satu root, element hierarchy, attributes/namespaces, empty elements, comments, dan single-line text-only leaves. Pilihan indentasi 2/4 spasi atau tab; default 2 spasi. Input/output teks, tombol `Format XML`, example, clear, cancel, copy, dan download `.xml`; seluruh input diproses lokal.

**Kebijakan whitespace:** pengguna menyetujui penggantian whitespace-only di antara child elements untuk indentasi melalui checkbox `Whitespace between child elements is indentation in my XML`; default unchecked dan Format belum aktif. Tanpa DTD/schema, tool tidak dapat membuktikan whitespace tersebut tidak bermakna. Teks pada leaf, termasuk leading/trailing spaces, tetap persis setelah normalisasi XML standar; jangan trim, collapse, atau menambahkan newline di dalam leaf. Tampilkan batas ini sebelum tombol format dan jelaskan hasil bukan canonical XML atau bukti ekuivalensi untuk setiap aplikasi XML. Aturan XML tentang whitespace dan `xml:space` menjadi alasan scope konservatif ini. [Spesifikasi XML 1.0](https://www.w3.org/TR/xml/#sec-white-space)

V1 tidak memformat mixed content dengan significant text + child markup, multiline text leaves, CDATA, processing instructions selain declaration, atau atribut `xml:space` apa pun beserta inheritance-nya. Dokumen yang well-formed tetapi berada di luar subset memberi pesan `This XML is well-formed, but its content is outside this formatter's supported subset.` dengan alasan spesifik; jangan mengaku XML invalid. Input tetap utuh, output/copy/download kosong. Dukungan lebih luas menjadi task terpisah setelah fixture preservasi dibuktikan.

Tidak termasuk minify, XML↔JSON, HTML repair, DTD/XSD validation, XPath, sorting attributes/elements, entity expansion, canonicalization/signatures, encoding transcoder, URL fetch, file upload, backend, telemetry, atau penyimpanan draft. DOCTYPE/internal subset/external entities ditolak seluruhnya sebelum native XML parser dipanggil. XML declaration versi 1.0 boleh tanpa encoding atau dengan UTF-8; versi/encoding lain ditolak karena input dan download V1 berupa XML 1.0/UTF-8. BOM U+FEFF awal boleh diterima dan dibuang dari output dengan catatan; BOM di tempat lain mengikuti validasi XML. Quote delimiters, entity spelling, dan empty-tag spacing/style boleh dinormalisasi library bila decoded values dan isi leaf tetap sama; source byte-identical bukan janji V1.

## Prasyarat, dependency, dan kepemilikan

- [ ] Baca instruksi repository, README repo, [README.md](README.md), [CONTRACT.md](CONTRACT.md), [EXTENSION-CONTRACT.md](EXTENSION-CONTRACT.md), dan [14a-library-readiness.md](14a-library-readiness.md). Foundation 00 dan readiness 14a untuk XML harus selesai sebelum tahap 1.
- [ ] Periksa sumber shared aktual: `tools/shared/ui.js` mengekspor `setStatus`, `copyText`, `downloadText`, `readTextFile`; `limits.js` mengekspor `assertTextSize`, `MAX_TEXT_BYTES` 5 MiB, `MAX_OUTPUT_BYTES` 10 MiB, `MAX_DEPTH` 100. Tool ini memakai limit lebih kecil di bawah, bukan mengubah shared helper.
- [ ] Miliki hanya `xml-formatter/index.html`, `logic.js`, `tool.js`, `worker.js`, opsional `style.css`, serta `tests/tools/xml-formatter.test.js` dan `tests/tools/xml-formatter.html`.
- [ ] Perbarui checkbox dan hasil aktual pada dokumen ini; saat seluruh tahap terbukti selesai, perbarui hanya row task 18 pada README sesuai EXTENSION-CONTRACT. Homepage/hub/sitemap/test index diserahkan ke integrator.
- [ ] Gunakan `/tools/shared/tools.css`, helper shared, template existing, dan harness browser-native; jangan mengubah tool lain, shared, vendor, provenance, CNAME, atau manifest global dari task 18.
- [ ] Pakai library lokal yang dipin/dibuktikan pada 14a. Kandidat resmi `xml-formatter` menyediakan `dist/browser/xml-formatter-singleton.js` dengan global `xmlFormatter`; gunakan file browser siap pakai itu dalam classic worker melalui `importScripts`, tanpa menjalankan compiler/bundler upstream. ESM package dengan bare import bukan bukti kompatibilitas native browser. [README resmi xml-formatter](https://github.com/chrisbottin/xml-formatter#on-the-browser)
- [ ] Readiness mencatat exact version, sumber archive, bundled `xml-parser-xo`/dependency license, checksum, load order, API, dan smoke fixtures subset ini. `strictMode:true` dan `throwOnFailure:true` wajib bila API versi terpilih mendukungnya; formatter tidak menjadi satu-satunya validator XML.
- [ ] Jangan memakai library default tanpa pemeriksaan: opsi `collapseContent`/newline dapat mengubah text. Kunci recipe berdasarkan versi 14a; gagal preservasi adalah blocker subset/adapter, bukan alasan memakai formatter regex atau DOM parse→serialize. [Source resmi formatter](https://github.com/chrisbottin/xml-formatter/blob/master/src/index.ts)
- [ ] Jika file vendor/API readiness belum tersedia atau fixture subset gagal setelah satu perbaikan terarah, laporkan reproduksi minimal dan hentikan pekerjaan yang bergantung padanya. Jangan menambah npm, package.json, framework, bundler, transpiler, CDN, remote import, backend, atau parser XML pengganti.

## Tahap 1 — adapter dan fixtures sebelum UI

Model: **GPT-6 Luna · high**. Deliverable: logic, worker, runner noindex, fixture lulus; belum menandai keseluruhan tool selesai.

- [ ] Buat `logic.js` berisi validation/classification, opsi eksplisit, error terstruktur, dan pemeriksaan preservasi; tanpa akses form, network, storage, atau perubahan DOM halaman. `DOMParser` hanya membuat XML document inert untuk pemeriksaan, tidak pernah menjadi sumber serialisasi output.
- [ ] Urutan pipeline: cek UTF-8 byte/BOM → preflight declaration/depth → tolak DOCTYPE → native `DOMParser` dengan MIME `application/xml` → cek parser error → cek subset → formatter worker → batas output → parse output dan bandingkan preservasi → baru hasil tersedia.
- [ ] Preflight hanya guard batas/declaration, memakai scanner state-aware yang memahami quotes, comments, CDATA, dan processing instruction boundaries. Jangan menganggap substring `<!DOCTYPE` di comment/CDATA sebagai declaration; jangan memakai replace/split `><`, regex indentation, atau scanner sebagai validator XML lengkap. Source invalid tetap ditolak native parser.
- [ ] Tolak DOCTYPE aktual termasuk bentuk SYSTEM/PUBLIC/internal subset sebelum `DOMParser`; jangan resolve entity, XInclude, stylesheet PI, schemaLocation, atau namespace URI. Namespace URI adalah data identifier, bukan URL untuk di-fetch.
- [ ] Syntax validation memeriksa satu root, matching tags, XML names/namespaces, quoted/unique attributes, illegal chars, escaped ampersands, entity/reference syntax, dan declaration. Tangani parsererror document aktual, bukan menolak element pengguna bernama `parsererror`; line/column hanya tampil bila browser memberikannya secara andal.
- [ ] Setelah well-formed, lakukan traversal iteratif sebelum formatter: depth ≤100, jumlah nodes ≤20.000; namespace prefixes/URIs tetap data. `__proto__`, `constructor`, dan `prototype` bukan konfigurasi atau prototype keys.
- [ ] Classify unsupported dengan alasan: mixed text+child element/comment/PI, newline dalam leaf text, CDATA, non-declaration PI, atau `xml:space` attribute. Jangan mencoba menyelamatkan format dengan trimming/removing node, menyisipkan `xml:space`, atau memformat hanya sebagian dokumen tanpa pemberitahuan.
- [ ] Untuk supported single-line text leaf, pakai recipe library 14a agar text/whitespace tidak berubah; jika perlu `ignoredPaths`, over-preserve semua element pada path sama daripada merusak leaf. Jangan mengaktifkan opsi minify, filter removal, forced self-close, atau sorting; quote normalization bawaan hanya diterima bila decoded attribute values identik.
- [ ] Post-check output dengan native parser. Bandingkan element order, qualified names+namespace URI, attributes+decoded values, comments+isinya, declaration policy, dan seluruh supported leaf text dengan input. Hanya whitespace-only di antara child elements pada scope yang disetujui boleh berbeda; jangan mengabaikan semua text nodes atau hanya membandingkan `.textContent` root.
- [ ] Periksa supported leaf text persis setelah normalisasi XML, termasuk leading/trailing spaces, predefined/numeric references, dan Unicode. Tidak boleh double-escape entity, mengubah decoded value, trim text, atau mengabaikan whitespace-only leaf. Jika library melakukan perubahan di luar kebijakan, return `PRESERVATION_FAILED`, pertahankan input, dan jangan menampilkan hasil.
- [ ] Limit tool: input **1 MiB UTF-8**, output **2 MiB UTF-8**, depth **100**, nodes **20.000**. Exact byte/depth/node boundary diterima; over boundary ditolak dengan code `INPUT_TOO_LARGE|OUTPUT_TOO_LARGE|MAX_DEPTH|TOO_MANY_NODES` yang sesuai. Cek output sebelum post-parse/render/copy/download.
- [ ] Seluruh pemanggilan formatter berada di worker; timeout **5 detik** dari dispatch memberi `TIMEOUT` dan terminasi. Cancel/clear/input/options berubah menerminasi worker, menaikkan request ID, dan mengabaikan jawaban usang. Tidak memakai timer main thread untuk mengklaim dapat menghentikan synchronous XML parse.
- [ ] Native validation/post-check terbatas input/output di atas; ukur parse/classify pada fixture maksimum. Jika satu operasi main thread mengunci UI >250 ms pada browser QA, kecilkan limit secara terdokumentasi atau laporkan blocker sebelum UI selesai; jangan mengklaim batas waktu worker mencakup native parsing.

## Fixture browser-native wajib

- [ ] `<root><item id="1">alpha</item><item id="2"/></root>` menghasilkan snapshot indentasi 2/4/tab dari library dipin; formatting ulang dengan opsi sama idempotent.
- [ ] `<root><value>  alpha  </value><empty></empty></root>` mempertahankan leaf spaces dan empty element; `<value> </value>` tidak dibuang/dikonversi menjadi empty string.
- [ ] `<?xml version="1.0" encoding="UTF-8"?><n:root xmlns:n="urn:example"><n:item key="a &amp; b">00123 &lt; 9 &#x1F600;</n:item></n:root>` menjaga namespace, decoded attribute/leaf values, numeric-looking text, dan emoji; quote/reference style boleh mengikuti library jika tidak mengubah data.
- [ ] Quoted attribute berisi `>`/`&quot;`, komentar berisi text `<node>`, Unicode names, LF/CRLF antarelemen, declaration, BOM, dan newline final mengikuti kebijakan terdokumentasi tanpa kehilangan data.
- [ ] `<!-- note --><root><a>one</a><!-- keep me --><b/></root><!-- end -->` mempertahankan comments dan urutannya; output string berisi `<script>` tetap literal dalam editor.
- [ ] `<p>Hello <b>world</b> !</p>`, multiline leaf, `<![CDATA[a < b]]>`, PI non-declaration, dan `xml:space="preserve"`/`default` termasuk inherited → well-formed tetapi unsupported; input unchanged, no formatted output. `<p><b>x</b> <i>y</i></p>` tidak otomatis dianggap aman berdasarkan tag name: sebelum consent tidak diformat, dan panduan menjelaskan consent mengganti whitespace antar-child bahkan bila aplikasi menganggapnya bermakna.
- [ ] `<root><a></root>`, `<a/><b/>`, `<root a="1" a="2"/>`, unquoted attribute, unbound prefix, invalid name, bare `&`, `&unknown;`, `&#0;`, malformed comment/CDATA/declaration → invalid, input unchanged, no success/output.
- [ ] `<parsererror xmlns="urn:example">ordinary data</parsererror>` tidak ditolak hanya karena element name; error browser nyata tetap terdeteksi.
- [ ] `<!DOCTYPE root SYSTEM "https://example.invalid/dtd"><root/>`, PUBLIC declaration, internal entity, recursive/entity bomb, dan external file entity → `DOCTYPE_UNSUPPORTED` sebelum native parse, tanpa request network. `<!DOCTYPE` dalam comment atau literal CDATA tidak memicu guard declaration; CDATA sendiri memberi unsupported sesuai scope.
- [ ] Namespace/schemaLocation/XInclude-looking attributes tidak menimbulkan fetch; `__proto__` attribute/element tetap data atau controlled unsupported tanpa prototype mutation/data loss.
- [ ] Mock formatter yang menghapus attribute/comment/leaf spaces, mengubah decoded entity value, atau mengembalikan invalid XML ditolak `PRESERVATION_FAILED`; perubahan indentation antar-child saja diterima sesudah consent pada subset. Normalisasi quote/entity/empty-tag style tanpa perubahan data diterima sesuai kebijakan.
- [ ] Exact/over UTF-8 limits dengan emoji, depth 100/101, nodes 20.000/20.001, output terlalu besar, dan limit sebelum formatter/post-parse teruji.
- [ ] Worker timeout/cancel, error formatter, respons terlambat, edit input/indent saat processing, lalu job baru membuktikan hanya hasil terbaru dapat muncul. Timer terminasi diuji dengan worker fixture terkontrol, bukan payload berbahaya yang tidak bounded.

## Tahap 2 — UI, static SEO, dan aksesibilitas

Model: **GPT-6 Luna · high**. Mulai hanya sesudah tahap 1 lulus.

- [ ] Buat HTML statis dengan breadcrumb, H1, intro, label `XML input`/`Formatted XML`, textarea readonly output, indent select, whitespace-consent checkbox default unchecked, explicit action/example/clear/cancel/copy/download, notes batas/subset, status `aria-live="polite"`, dan noscript.
- [ ] `tool.js` memakai helper shared aktual; gunakan `.value`/`textContent` untuk semua XML/errors. Format tidak berjalan per keystroke. Copy/download aktif hanya setelah sukses current input/options; download `formatted.xml` dengan MIME `application/xml;charset=utf-8`.
- [ ] Setiap input/option/consent change menghapus output/status sukses, menonaktifkan copy/download, dan membatalkan job; Format hanya aktif ketika consent dicentang. Error tidak menghapus input. Clipboard rejection memberi manual-selection fallback melalui helper shared.
- [ ] Tulis contoh synthetic configuration yang benar-benar supported dan contoh mixed-content unsupported. Hindari klaim dapat memformat SVG/documents arbitrary atau whitespace selalu aman.
- [ ] Title: `XML Formatter Online — Format XML Locally | Edwin Lab`; H1: `XML Formatter`.
- [ ] Meta description: `Format simple XML configuration and API documents in your browser. Choose indentation, keep leaf text intact, and get clear syntax and unsupported-content messages.`
- [ ] Intro: `Make simple XML easier to read with local formatting and clear limits for whitespace-sensitive content.` Canonical/OG/favicon/logo/lang/schema mengikuti CONTRACT.
- [ ] Panduan HTML statis: paste XML, review whitespace policy, choose indent, format, copy/download; before/after supported example, well-formed vs schema-valid, mixed content/CDATA/xml:space/DOCTYPE restrictions, UTF-8 policy, dan local processing.
- [ ] FAQ terlihat: `Why is mixed content unsupported?`, `Can whitespace change XML meaning?`, `Are DTDs or external entities loaded?`, `Does formatting validate an XSD?`; related kandidat `/jsonlint/` dan `/json-yaml-converter/` hanya bila target siap.
- [ ] CSS per-tool hanya kebutuhan khusus; ukuran 320/390/768/1440 px, long text scroll dalam editor, keyboard/focus/disabled states dan contrast teruji. Tidak ada editor framework, syntax highlighting dependency, atau remote font.

## Tahap 3 — QA dan Definition of Done

Model: **GPT-6 Luna · high**. Checkbox tahap sebelumnya tidak cukup tanpa browser QA.

- [ ] Jalankan `/tests/tools/xml-formatter.html` melalui HTTP lokal dengan harness existing; seluruh fixture wajib lulus, runner `noindex,nofollow`, console bersih, dependency hanya origin lokal.
- [ ] Verifikasi direct `/xml-formatter/` + refresh, examples, unsupported/invalid errors, clear/cancel/stale state, keyboard, copy success/denied, download bytes/UTF-8, mobile dan desktop, serta no-JS help.
- [ ] Periksa Network saat DOCTYPE/external-looking XML, namespace URLs, dan HTML-like text: tidak ada request yang berasal dari input. Tidak ada input di URL/storage/log persisten/analytics.
- [ ] `git diff --check` lulus; file ownership/provenance/import lokal benar. Catat subset aktual, library exact version, fixture counts, main-thread timing, timeout/limits, screenshots/QA, dan integrasi diperlukan pada dokumen ini.
- [ ] Seluruh tahap dan security/preservation fixture terbukti lulus sebelum mencentang task 18 pada README. Bila browser tidak tersedia, catat belum terverifikasi dan biarkan completion checkbox kosong. Jangan commit, push, publish, atau deploy.

## Hasil eksekusi

Belum dijalankan. Isi saat eksekusi: tahap selesai, file berubah, versi/recipe dependency, fixture lulus/gagal, browser+viewport, timing, batas support sebenarnya, dan kebutuhan integrasi.

## Prompt siap tempel per tahap

```text
Kerjakan tahap 1 saja pada docs/developer-tools/18-xml-formatter.md dengan GPT-6 Luna reasoning high.
Baca README, CONTRACT, EXTENSION-CONTRACT, 14a-library-readiness dan shared ui/limits aktual.
Pastikan dependency XML 14a lulus. Buat logic/worker dan browser fixtures sebelum UI.
Ikuti subset konservatif, DOCTYPE rejection sebelum native parsing, exact leaf preservation,
post-format comparison, limits, timeout/cancel/request IDs. Jangan buat parser/formatter regex,
DOMParser→XMLSerializer formatting, npm/build/CDN, atau fitur di luar scope.
Hanya file milik task; tulis bukti tahap 1 pada dokumen, jangan tandai task lengkap/commit/push/deploy.
```

```text
Kerjakan tahap 2 saja pada docs/developer-tools/18-xml-formatter.md dengan GPT-6 Luna reasoning high.
Baca kontrak/ownership dan hasil tahap 1; lanjutkan hanya jika fixtures inti telah lulus.
Buat UI Inggris serta HTML SEO statis persis scope V1, shared styles/helpers, invalidation dan aksesibilitas.
Tampilkan batas whitespace dan unsupported XML dengan jelas. Hanya file milik task; jangan ubah vendor,
shared/global navigation/sitemap. Verifikasi UI terkait dan catat bukti; jangan commit/push/deploy.
```

```text
Kerjakan tahap 3 QA pada docs/developer-tools/18-xml-formatter.md dengan GPT-6 Luna reasoning high.
Jalankan seluruh browser fixtures dan QA langsung sesuai TODO, termasuk data preservation, DOCTYPE/no-network,
timing, cancel/stale output, UTF-8 download, keyboard dan responsive states.
Perbaiki hanya file milik task. Catat hasil aktual dan batas dukungan. Centang hanya bukti yang lulus;
update hanya row 18 README bila semua DoD terpenuhi. Jangan commit/push/publish/deploy.
```
