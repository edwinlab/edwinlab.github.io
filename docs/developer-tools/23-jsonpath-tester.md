# 23 — JSONPath Tester

Status: **implementasi dan integrasi lokal selesai; checklist QA manual lanjutan masih sebagian.** JSONPath Plus 11.2.0 dipin lokal; fixture selector/security 13/13 dan integrasi route lulus.
Model: **GPT-6 Luna · high**, per tahap. Jika fixture gagal, perbaiki reproduksi kecil atau pecah tahap; pemilihan model lain hanya jika pemilik menginginkannya.

## Tujuan dan batas kerja

- Route asli: `/jsonpath-tester/`; canonical: `https://edwinlab.dev/jsonpath-tester/`.
- Uji selector terhadap JSON lokal dan tampilkan array pasangan `{path, value}`, jumlah match, serta error yang dapat diperbaiki.
- UI dan bantuan publik bahasa Inggris; instruksi implementasi bahasa Indonesia.
- V1 memakai **subset selector JSONPath Plus**: root, property, index array nonnegatif, wildcard, recursive descent, union sederhana, dan slice maju. **Bukan implementasi penuh RFC 9535** dan bukan dukungan seluruh fitur JSONPath Plus.
- Tidak termasuk filter `?()`, computed/script selector `()`, ekspresi JavaScript, regex, arithmetic, type selectors `@...()`, parent `^`, property-name operator `~`, backtick escape, transform/update JSON, JSONC/JSON5, schema validation, upload URL, atau editor kode besar.
- Hanya HTML/CSS/JavaScript vanilla, native browser ES modules, dan dependency lokal resmi siap browser. Tidak ada npm/package.json, framework, bundler, transpiler, backend, atau build aplikasi.

## Prasyarat, dependency, dan kepemilikan

- [ ] Baca instruksi repository, `README.md` repository, [README.md](README.md), [CONTRACT.md](CONTRACT.md), [EXTENSION-CONTRACT.md](EXTENSION-CONTRACT.md), [01-jsonlint.md](01-jsonlint.md), dan [14a-library-readiness.md](14a-library-readiness.md).
- [ ] Foundation 00 dan readiness 14a **fase D** harus selesai. Jangan mulai implementasi sebelum distribusi JSONPath Plus lokal, lisensi, versi tepat, checksum, import browser, worker, dan fixture aman dinyatakan siap oleh fase D. Fase A/B/C tidak menjadi prasyarat task ini.
- [ ] Baca **file aktual** `tools/shared/json.js`, `limits.js`, `ui.js`, template, dan `tests/tools/harness.js`; jangan mengasumsikan helper tambahan sudah tersedia.
- [ ] Miliki hanya `jsonpath-tester/index.html`, `tool.js`, `logic.js`, `worker.js`, opsional `tool.css`/`worker-client.js` di folder ini, `tests/tools/jsonpath-tester.test.js`, `tests/tools/jsonpath-tester.html`, dan checkbox/catatan hasil dalam dokumen task ini.
- [ ] Pakai CSS/UI/parser/limits shared. Boleh memperbarui **hanya row 23** dalam README tracker sesuai EXTENSION-CONTRACT. Jangan mengubah shared helper, vendor/provenance, tool lain, homepage, hub, registry, sitemap, robots, bagian README lain, atau direktori tes umum. Ketidakcukupan shared/dependency dilaporkan dengan reproduksi, lalu diselesaikan melalui task pemiliknya.
- [ ] Import hanya entry lokal yang disahkan 14a; jangan bare-import package, mengambil source `src/` yang masih membutuhkan dependency, memakai CDN runtime, atau mengunduh dependency saat pengguna menjalankan tool.

**Catatan riset 12 Oktober 2026, bukan bukti readiness selesai:** metadata registry resmi saat diperiksa menunjukkan `jsonpath-plus` **11.2.0**, MIT, arsip `https://registry.npmjs.org/jsonpath-plus/-/jsonpath-plus-11.2.0.tgz`. Distribusi `dist/index-browser-esm.js` dalam arsip itu tidak memiliki import eksternal; browser UMD juga tersedia sebagai `dist/index-browser-umd.cjs`. ESM menyertakan runtime JSEP beserta plugin assignment/regex: 14a harus memverifikasi versi/lisensi dependency yang benar-benar dibundel, bukan menyalin rentang semver sebagai versi tepat. Jangan memasang versi `latest` atau menganggap source branch utama sama dengan arsip rilis.

Distribusi yang diperiksa memakai sintaks regex `/v` dan mempunyai jalur native `Script` yang menggunakan `new Function`. Jalur tersebut **tidak boleh dipakai**: tool mengunci `eval: false` dan menolak sintaks evaluasi sebelum memanggil library. Jangan mengklaim seluruh bundle tidak mengandung `Function`. Readiness wajib memeriksa import di browser target dan module worker; jangan menambahkan polyfill/build atau memodifikasi engine secara diam-diam bila import gagal. Rujukan resmi: [JSONPath Plus](https://jsonpath-plus.github.io/JSONPath/docs/ts/index.html), [repository upstream](https://github.com/JSONPath-Plus/JSONPath), dan [metadata versi 11.2.0](https://registry.npmjs.org/jsonpath-plus/11.2.0).

## Kontrak selector V1

- [ ] Buat scanner/validator allowlist yang membaca **seluruh query**, bukan blacklist karakter atau satu regex kompleks. Validator hanya mengenali grammar terbatas; JSONPath Plus tetap merupakan engine selector, bukan parser/traversal pengganti buatan sendiri.
- [ ] Wajib mulai dengan `$`. Boleh trim whitespace di luar query; tidak ada teks sisa, komentar, tambahan statement, atau implicit root.
- [ ] Dot property: `.name`, dengan identifier ASCII `[A-Za-z_$][A-Za-z0-9_$]*`; `. *` bukan wildcard valid, sedangkan `.*` valid.
- [ ] Bracket property: `['name']` atau `["name"]`. V1 membatasi isi key pada satu atau lebih huruf ASCII, digit, `_`, `$`, spasi biasa, titik, atau `-`. Key seperti `first name`, `a.b`, `x-y`, `__proto__`, `constructor`, dan `prototype` boleh. Empty key, Unicode key, quote/backslash escape, control characters, dan tanda selector lain dalam key belum didukung; beri error batas dialect, jangan memilih key yang berbeda diam-diam.
- [ ] Index: `[0]`, `[1]`, dan seterusnya; integer desimal canonical nonnegatif yang safe. Tolak index negatif, leading zero selain `0`, exponent, decimal, `+`, dan angka di luar safe integer.
- [ ] Wildcard: `.*` dan `[*]`; recursive descent: `..name` dan `..*`. Bentuk lain sesudah `..` belum didukung V1.
- [ ] Union: `[0,2]` atau `['active','empty']`; anggota seluruhnya index atau seluruhnya quoted property. Boleh spasi di sekitar anggota/koma; tidak ada campuran, selector bersarang, filter, atau trailing comma. Pertahankan urutan anggota dan duplicate matches; jangan deduplicate otomatis.
- [ ] Slice: `[start:end]` / `[start:end:step]`, bound nonnegatif boleh kosong, end eksklusif, step default `1` atau integer positif. Dukung `[:2]`, `[1:]`, `[::2]`, `[0:3:2]`; tolak bound negatif, step `0`/negatif, exponent, decimal, serta terlalu banyak `:`. Slice hanya berlaku pada array.
- [ ] Batasi query 4 KiB UTF-8, maksimal 64 segmen dan maksimal 128 total anggota union sebelum library dipanggil. Semua validasi diulang dalam worker; jangan mempercayai main thread sebagai satu-satunya penjaga.
- [ ] Query malformed menghasilkan `INVALID_QUERY`; fitur yang sengaja dikecualikan menghasilkan `UNSUPPORTED_SELECTOR` dengan bantuan singkat. Library boleh lebih permisif, tetapi tidak boleh memperluas grammar UI secara diam-diam.

## JSON, hasil, dan properti literal

- [ ] JSON diparse **di worker** dengan `parseSafeJSON(text)`. Gunakan shared `MAX_TEXT_BYTES = 5 MiB`, `MAX_DEPTH = 100`; jangan cukup memakai `JSON.parse` atau validator sintaks JSONlint.
- [ ] Pertahankan error shared: `INVALID_JSON`, `DUPLICATE_KEY`, `UNSAFE_NUMBER`, `INPUT_TOO_LARGE`, `MAX_DEPTH`, termasuk posisi jika tersedia. Duplicate decoded keys, angka non-finite, integer-valued di luar safe integer, dan nonzero underflow ditolak. Angka besar dalam string tetap string.
- [ ] Jelaskan batas presisi desimal JavaScript. Tool ini memilih nilai hasil parse, bukan mempertahankan numeric lexeme, escape spelling, atau `-0` dalam download; JSONlint adalah tool terpisah untuk lexical formatting.
- [ ] `parseSafeJSON` aktual memakai guard token kemudian native `JSON.parse`: `__proto__`, `constructor`, dan `prototype` adalah **own data properties**. Jangan menolak nama itu hanya karena namanya, merge JSON ke konfigurasi, memakai spread/assign untuk membentuk konfigurasi dari input, atau menulis ke prototype.
- [ ] Library dipanggil dengan opsi buatan aplikasi: `eval: false`, `ignoreEvalErrors: false`, `wrap: true`, `flatten: false`, `resultType: 'all'`. Jangan menyediakan pilihan untuk mengganti `eval`, sandbox pengguna, callback pengguna, atau custom type callback.
- [ ] Nilai array tetap satu nilai match; jangan flatten. Hasil selalu array `{path, value}` dengan path absolut bracket notation dari library, mengikuti urutan penemuan engine. No matches adalah sukses dengan `[]`, bukan error.
- [ ] Callback aplikasi mengambil **hanya** `path` dan `value`. Jangan serialize/kirim `parent`, `parentProperty`, atau seluruh objek internal engine ke main thread.
- [ ] Adapter akar menangani query tepat `$` secara eksplisit: satu match `{path:'$', value:root}`, termasuk `0`, `false`, `null`, string, array, dan object. Pada distribusi yang diperiksa, library langsung memberi `undefined` untuk root falsy; jangan mengubahnya menjadi no matches. Selector non-root terhadap scalar root menghasilkan `[]`.
- [ ] Terima hanya hasil yang berasal dari member JSON: parent object nonnull harus memiliki `Object.hasOwn(parent, parentProperty)`; parent array harus menunjuk index elemen canonical dalam rentang dan own property. Selain match root, parent scalar bukan container JSON. Dengan guard callback ini, `$.s.length`, `$.s[0]`, dan `$.a.length` tidak mengeluarkan properti buatan string/array JavaScript. Jangan mengambil inherited functions/prototypes.
- [ ] Tidak memodifikasi input hasil parse. Contoh/fixture harus dibuat dengan teks JSON lalu `parseSafeJSON`, bukan object literal `{__proto__: ...}` yang mengubah prototype.

## Batas kerja dan lifecycle worker

- [ ] Seluruh parse, pemanggilan library, traversal, perhitungan budget, dan serialisasi hasil berjalan dalam module worker lokal. Main thread hanya memeriksa ukuran/query awal, mengirim teks, dan merender hasil yang sudah dibatasi.
- [ ] Batas **2.000 kandidat match** dan **2 MiB UTF-8 untuk seluruh JSON hasil serializable**, lebih ketat daripada shared `MAX_OUTPUT_BYTES = 10 MiB`. Budget mencakup path, nilai, escaping JSON, bracket, comma, dan envelope yang ditransfer; jangan menghitung panjang karakter sebelum escaping saja.
- [ ] Gunakan callback library untuk menghitung kandidat saat ditemukan dan melempar error aplikasi saat kandidat ke-2.001; ini menghentikan traversal sebelum engine menyelesaikan alokasi seluruh result array. Hitung juga kandidat yang dibuang guard parent agar jalur itu tetap dibatasi. Jangan menunggu seluruh hasil lalu `.slice(0, 2000)`.
- [ ] Serialize/budget tiap record sebelum disimpan, dengan pemeriksaan budget total; jangan menumpuk subtree berulang hingga ukuran tak terbatas. Satu subtree besar boleh gagal output budget. Pesan `MATCH_LIMIT`/`OUTPUT_TOO_LARGE` tidak mengembalikan hasil parsial dan meminta pengguna mempersempit query.
- [ ] Main thread menerapkan deadline keras **2 detik sejak dispatch**, memakai `worker.terminate()` saat timeout. Timer di dalam worker saja tidak dapat menghentikan traversal sinkron. Status `TIMEOUT` berbeda dari `No matches`.
- [ ] Sediakan Cancel; terminate worker saat cancel, timeout, edit input/query, clear, atau run baru. Bersihkan timer dan listener pada semua jalur; worker baru dibuat untuk run berikutnya agar cache query tidak tumbuh antar-run.
- [ ] Pakai request ID monotonik; respons job lama, termasuk error terlambat, tidak boleh mengubah hasil/status job baru. Input berubah langsung menghapus/menandai hasil stale dan menonaktifkan copy/download.
- [ ] Tangani worker import/error/messageerror dengan pesan yang dapat dipahami; bila Worker tidak tersedia, tampilkan `WORKER_UNAVAILABLE`, tanpa fallback eksekusi sinkron main thread.
- [ ] Jangan pernah memanggil `eval`, `new Function`, atau interpreter ekspresi atas query/input. `eval: false` adalah penjaga tambahan di engine, bukan pengganti allowlist. Jangan mengubah query tak didukung menjadi query lain agar tampak sukses.
- [ ] Semua error mempertahankan input pengguna dan menonaktifkan hasil lama. Kode tambahan stabil: `INVALID_QUERY`, `UNSUPPORTED_SELECTOR`, `MATCH_LIMIT`, `OUTPUT_TOO_LARGE`, `TIMEOUT`, `CANCELLED`, `WORKER_UNAVAILABLE`, `PROCESSING_ERROR`.

## TODO UI, privasi, dan SEO

- [ ] Salin shell Edwin Lab foundation: brand/logo asli, Home/Tools yang sudah ada, breadcrumb, H1, area kerja, bantuan statis, footer, dan `<noscript>`.
- [ ] Sediakan label permanen `JSON input`, `JSONPath query`, `Matches`; tombol `Run query`, `Cancel`, `Example`, `Clear`, `Copy results`, dan `Download JSON`. Output readonly dapat diseleksi; nama download `jsonpath-matches.json`.
- [ ] Gunakan satu output JSON array pasangan path/value, count, status Running/Success/No matches/Cancelled/Timed out/limit/error. Jangan membuat tabel ribuan DOM nodes atau menyorot seluruh input JSON V1.
- [ ] Contoh default sintetis book/title/price; contoh query wildcard, recursive descent, union, dan slice. Tombol process eksplisit; tidak menjalankan query pada setiap keystroke.
- [ ] Data pengguna masuk `.value`/`textContent`, tidak melalui `innerHTML`. Tidak ada input di fetch/XHR/beacon/API/analytics, URL query/hash, console log, localStorage/sessionStorage, atau log persisten. Tidak ada fetch URL pengguna.
- [ ] Pakai shared status `aria-live="polite"`, clipboard dengan fallback manual, Blob download/revoke, fokus terlihat, keyboard run yang terdokumentasi jika dibuat, dan panel responsif 320/390/768/1440 px.
- [ ] Title: `JSONPath Tester — Values & Paths | Edwin Lab`; H1: `JSONPath Tester`.
- [ ] Meta description: `Test JSONPath selectors against JSON locally. Inspect matching values and paths with property, wildcard, union, recursive, and slice examples.`
- [ ] HTML awal memuat `lang="en"`, viewport, favicon, canonical absolut, OG title/description/url/logo lokal, intro, cara pakai, contoh, serta batas dialect dan ukuran/waktu. Structured data WebApplication/BreadcrumbList opsional sesuai contract; tanpa rating atau klaim rich result.
- [ ] Intro: `Select values from a JSON document and inspect the exact paths that matched.` Bantuan menyatakan `This tool supports a selector-only subset of JSONPath Plus. Filters and JavaScript expressions are disabled. It is not a full RFC 9535 implementation.`
- [ ] Jelaskan dot/bracket notation, wildcard, end slice eksklusif, no matches versus error, array-valued matches, literal own keys, batas angka safe, dan presisi desimal. FAQ terlihat: dialect apa, mengapa filter gagal, mengapa query tidak cocok, bagaimana membaca paths, dan apakah JSON diupload.
- [ ] Jangan membuat keyword pages tambahan atau mengklaim volume/ranking/traffic. Related links menuju `/jsonlint/`, `/json-diff/`, dan `/json-csv-converter/` hanya jika target siap; integrasi global milik task 24.

## Fixture deterministik — wajib di browser saat implementasi

Riset sementara atas ESM resmi 11.2.0 memverifikasi selector pada tabel melalui Node; **ini bukan acceptance browser dan tidak mencentang TODO**. Readiness 14a dan tool harus menjalankannya ulang atas versi lokal yang benar-benar dipin. Jika pin berubah dan behavior tidak sesuai, laporkan ke 14a; jangan mengarang dukungan atau mengganti hasil fixture agar lulus.

Gunakan sumber JSON berikut untuk tabel:

```json
{"store":{"book":[{"title":"A","price":8},{"title":"B","price":12},{"title":"C","price":5}],"bicycle":{"price":19}},"active":false,"empty":null}
```

Kolom paths di bawah adalah string path persis dalam urutan hasil; assertion membandingkan array pasangan `{path, value}`, bukan nilai saja.

| Query | Values | Paths |
|---|---|---|
| `$.store.book[0].title` | `["A"]` | `["$['store']['book'][0]['title']"]` |
| `$['store']['book'][1]['title']` | `["B"]` | `["$['store']['book'][1]['title']"]` |
| `$.store.book[*].title` | `["A","B","C"]` | `["$['store']['book'][0]['title']","$['store']['book'][1]['title']","$['store']['book'][2]['title']"]` |
| `$..price` | `[8,12,5,19]` | `["$['store']['book'][0]['price']","$['store']['book'][1]['price']","$['store']['book'][2]['price']","$['store']['bicycle']['price']"]` |
| `$.store.book[0,2].title` | `["A","C"]` | `["$['store']['book'][0]['title']","$['store']['book'][2]['title']"]` |
| `$['active','empty']` | `[false,null]` | `["$['active']","$['empty']"]` |
| `$.store.book[0:3:2].title` | `["A","C"]` | `["$['store']['book'][0]['title']","$['store']['book'][2]['title']"]` |
| `$.store.book[:2].title` | `["A","B"]` | `["$['store']['book'][0]['title']","$['store']['book'][1]['title']"]` |
| `$.store.book[1:].title` | `["B","C"]` | `["$['store']['book'][1]['title']","$['store']['book'][2]['title']"]` |
| `$.store.book[::2].title` | `["A","C"]` | `["$['store']['book'][0]['title']","$['store']['book'][2]['title']"]` |
| `$.missing` / `$.store.book[99]` | `[]` | `[]` |

- [ ] Seluruh baris tabel lulus; query `$.store.book` menghasilkan **satu** record path `$['store']['book']` dan value array berisi tiga book.
- [ ] `$.store.book[0,0].title` menghasilkan dua record identik untuk `A`, mempertahankan duplicate union.
- [ ] Pada `{"a.b":1,"first name":2,"x-y":3}`, bracket queries memilih value `1`/`2`/`3` dan normalized path sesuai nama literal; dot `$.a.b` bukan alias untuk `a.b`.
- [ ] Query `$` pada `0`, `false`, `null`, `"ok"`, `[]`, dan `{}` menghasilkan satu record root. Selector non-root pada scalar root menghasilkan `[]`.
- [ ] Root `{"x":1,"nested":{"x":2}}`, query `$..*` menghasilkan values `[1,{"x":2},2]` dan paths `["$['x']","$['nested']","$['nested']['x']"]`; ulangi `$..x` menghasilkan `[1,2]` dengan path masing-masing.
- [ ] Pada teks `{"__proto__":{"polluted":true},"constructor":{"prototype":{"x":2}},"prototype":3,"toString":"own"}`, `$['__proto__']` memilih object literal, `$['constructor']['prototype']['x']` memilih `2`, `$['prototype']` memilih `3`, dan `$['toString']` memilih string `own`; semua paths persis bracket notation. `$.hasOwnProperty` tidak cocok; prototype object/global tetap sama sebelum/sesudah run.
- [ ] Pada `{}`, `$.constructor`/`$.toString`/`$.__proto__` → `[]`; pada `{"s":"abc","a":[7]}`, `$.s.length`/`$.s[0]`/`$.a.length` → `[]` lewat guard member JSON. Jangan menampilkan inherited/synthetic properties.
- [ ] `$.store.book[?(@.price < 10)]`, `$.store.book[(@.length-1)]`, `$..book[?(@.constructor)]`, dan payload berisi assignment/function call → `UNSUPPORTED_SELECTOR` sebelum engine. Tambahkan fixture langsung library dengan `eval:false` yang memastikan filter/computed selector throw bila grammar guard sengaja dilewati; pesan internal boleh dinormalisasi, tidak di-hard-code.
- [ ] Query `$..@string()`, `$.x^`, `$.x~`, backtick escape, union campuran, unsupported escaped/Unicode property, negative index/slice, serta `[0:3:0]` ditolak. Unclosed bracket/quote dan query `$.x;alert(1)` gagal; tidak ada code execution.
- [ ] Bypass main validation lewat pesan worker manual tetap ditolak. Instrumentasikan worker untuk memastikan accepted/rejected queries tidak memanggil `eval`/`Function` atas input; tidak menggunakan interpreter `safe` sebagai fallback.
- [ ] Shared errors: invalid JSON/trailing comma/comments, duplicate `{"a":1,"\u0061":2}`, `9007199254740993`, `1e400`, dan `1e-4000` ditolak; string `"9007199254740993"`, `false`, `null`, dan Unicode value tetap benar. Depth 100 diterima, 101 ditolak.
- [ ] JSON/query tepat batas byte diterima, di atas batas ditolak; emoji membuktikan limit memakai UTF-8. Query di atas segment/union budget ditolak sebelum traversal.
- [ ] Array 2.000 scalar elements query `$[*]` diterima bila budget output cukup; 2.001 kandidat menghasilkan `MATCH_LIMIT` tanpa hasil parsial. Budget output menghitung escaped string/path; tepat batas diterima dan satu byte di atas gagal tanpa mengirim/merender hasil besar.
- [ ] Error callback menghentikan traversal; tidak ada array seluruh match sebelum limit. Query banyak recursive segmen terhadap JSON lebar dijalankan dengan worker asli; timeout/cancel menjaga heartbeat/scroll UI dan run kecil berikutnya berhasil.
- [ ] Run cepat berulang, edit saat running, clear, cancel, timeout, import error, dan respons request lama tidak dapat memulihkan output/copy/download stale. JSON berupa `<img src=x onerror=...>` tetap teks dan tidak membuat elemen HTML.

## QA, integrasi, dan selesai jika

- [ ] `/tests/tools/jsonpath-tester.html` memakai harness browser-native dan `noindex,nofollow`; seluruh fixture penting lulus pada **worker browser nyata**, console bersih. Tidak cukup menguji Node atau pure wrapper saja.
- [ ] Buka langsung `/jsonpath-tester/` melalui HTTP lokal dan refresh; import ESM/worker/dependency semuanya lokal, tanpa 404/CSP/import error. Run, no matches, invalid query/JSON, contoh, cancel, clear, copy/manual fallback, dan isi Blob download teruji.
- [ ] Keyboard/label/fokus/live status, 320/390/768/1440 px, teks panjang, responsive stacking, dan JavaScript disabled diperiksa. H1, panduan, metadata, contoh, link, serta `<noscript>` tetap berada dalam HTML statis.
- [ ] Network/storage/URL menunjukkan tidak ada input dikirim/disimpan; main thread tidak menjalankan query engine. Batas/deadline nyata serta respons usang teruji.
- [ ] `git diff --check` lulus dan diff hanya file milik task. Jangan commit/push/deploy.
- [ ] Catat file, versi/checksum dependency dari 14a, fixture lulus/gagal, browser/viewport, deadline/cancel, limit, guard properti, serta limitation aktual dalam hasil eksekusi di bawah. Centang hanya pekerjaan yang terbukti; bila QA browser tidak tersedia, tool belum selesai.
- [ ] Update checklist task ini dan hanya row 23 README berdasarkan bukti; gunakan status sebagian bila QA belum lulus. Serahkan route/card/related links/test runner ke [24 — integrasi ekstensi](24-extension-integration-seo.md) untuk hub, sitemap, daftar tes, dan dokumentasi route. Tidak menambahkan live link ke tool yang belum siap.

Baris tracker sudah tersedia dalam README; executor hanya memperbarui status row 23 miliknya, tanpa mengubah rows lain:

```markdown
| [ ] | [23 — JSONPath Tester](23-jsonpath-tester.md) | `/jsonpath-tester/` | GPT-6 Luna / high |
```

## Prompt siap tempel — bertahap

Pilih model/reasoning pada pengaturan chat; teks prompt tidak mengganti model otomatis. Mulai setelah 14a fase D selesai.

**Tahap 1 — implementasi tool dan fixture:**

```text
Implementasikan hanya docs/developer-tools/23-jsonpath-tester.md dengan GPT-6 Luna reasoning high.
Baca README.md developer tools, CONTRACT.md, EXTENSION-CONTRACT.md, instruksi repository,
01-jsonlint.md, 14a-library-readiness.md, dan API shared aktual. Readiness JSONPath Plus harus selesai.
Miliki hanya folder jsonpath-tester/, dua runner/fixture tests/tools/jsonpath-tester.*, dan catatan task ini.
Buildless HTML/CSS/vanilla JS, UI Inggris, route /jsonpath-tester/, dependency lokal resmi siap browser.
Grammar selector allowlist saja; eval:false selalu, tidak ada filter/script/type/parent/property operator.
Parse dengan parseSafeJSON di worker, preserve literal own properties, adapter root falsy dan guard member JSON.
Wajib worker 2 detik/termination, 2.000 kandidat, output 2 MiB UTF-8, callback abort, stale request cancellation.
Jangan ubah shared/vendor/hub/sitemap/tool lain atau bagian README selain row23. Jangan commit/push/deploy.
Jalankan fixture browser-native dan QA worker/UI sampai scope selesai, lalu catat bukti dan limitation aktual.
Jika dependency/contract belum memadai, berikan reproduksi dan blocker 14a; jangan membuat engine/build pengganti.
```

**Tahap 2 — perbaikan terarah jika tes gagal:**

```text
Lanjutkan task 23 saja. Perbaiki fixture/QA yang masih gagal dengan reproduksi minimal,
tanpa memperluas grammar atau menonaktifkan eval:false/worker/budget/guard properti.
Pertahankan ownership dan perubahan pengguna. Ulangi tes terkait serta QA yang terkena perubahan.
Jika fixture penting tetap gagal, catat reproduksi dan pecah langkah berikutnya dengan Luna yang sama.
Jangan centang hasil yang belum terbukti dan jangan commit/push/deploy.
```

**Tahap 3 — integrasi oleh pemilik task 24:**

```text
Integrasikan JSONPath Tester yang sudah lulus task 23 melalui docs/developer-tools/24-extension-integration-seo.md.
Perbarui hanya file global yang dimiliki task 24: hub/related links, registry bila ada, sitemap,
direktori tes, dan README/tracker sesuai kontrak. Periksa route nyata dan metadata setelah integrasi.
Jangan membuat link ke tool yang belum selesai; jangan menandai deployment/public QA selesai tanpa bukti.
Jangan commit/push/deploy kecuali ada instruksi pengguna terpisah.
```

## Hasil eksekusi

Implementasi dan integrasi lokal selesai; 13/13 fixture browser serta route smoke lulus dengan JSONPath Plus 11.2.0 lokal. Console/keyboard manual QA dan item DoD yang belum terbukti tetap terbuka.


## Hasil eksekusi — 12 Oktober 2026

- Route HTML/CSS/vanilla JS selesai dan tertaut pada Developer Tools hub serta sitemap oleh task 24. Tidak memerlukan compiler atau build; library runtime dipin lokal.
- Browser fixtures: 13/13 fixtures; worker module, selector allowlist, eval disabled, prototype/falsy root, dan output budget diuji.
- Integrasi HTTP localhost memverifikasi canonical/metadata, no-JavaScript guide, sample workflow, clipboard/download dispatch, tidak ada pengiriman input, dan lebar 320/390/768/1440px. Console/keyboard manual review belum dicatat; detail checkbox spesifikasi yang belum teruji tetap terbuka.
