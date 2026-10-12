# Developer tools — rencana eksekusi

Dibuat 11 Oktober 2026. **Foundation, 12 tools awal, navigasi/hub, serta integrasi SEO (00–13) selesai secara lokal. Enam tool tambahan (15–17, 20–22) sudah dibuat, diuji, dan dihubungkan; empat kandidat parser/diff menunggu akses registry untuk memverifikasi library. Beberapa item QA UI manual dan seluruh verifikasi publik belum dijalankan.** Tujuan: menambah halaman developer tools yang berguna dan dapat ditemukan melalui pencarian, dengan identitas Edwin Lab serta link kembali ke profil profesional.

Teknologi: **HTML + CSS + JavaScript vanilla**, tanpa framework, npm, package.json, bundler, backend, atau build. Library parser JavaScript lokal siap browser dipakai hanya untuk fitur yang memerlukannya. Seluruh input diproses di perangkat pengguna.

## Urutan dan tracker

Foundation 00, tool 01–12, hub 02a, dan integrasi lokal 13 telah selesai. Checklist pascadeployment pada task 13 tetap terbuka sampai verifikasi publik benar-benar dilakukan. Nomor menunjukkan urutan rekomendasi, bukan dependency antar-tool: sesudah foundation, satu tool bisa dikerjakan mandiri.

| Selesai | Task dan TODO | Route | Model / reasoning |
|---|---|---|---|
| [x] | [00 — Foundation](00-foundation.md) | Shared assets | GPT-6.1 Sol / medium |
| [x] | [01 — JSON Validator & Formatter](01-jsonlint.md) | `/jsonlint/` | GPT-6 Luna / high |
| [x] | [02 — JSON Diff](02-json-diff.md) | `/json-diff/` | GPT-6 Luna / high |
| [x] | [02a — Menu Developer Tools & hub](02a-navigation-hub.md) | Menu utama, `/tools/` | — |
| [x] | [03 — Timestamp Converter](03-timestamp-converter.md) | `/timestamp-converter/` | GPT-6 Luna / high |
| [x] | [04 — JWT Decoder](04-jwt-decoder.md) | `/jwt-decoder/` | GPT-6 Luna / high |
| [x] | [05 — Base64 Encoder / Decoder](05-base64.md) | `/base64/` | GPT-6 Luna / medium |
| [x] | [06 — URL Encoder / Decoder](06-url-encoder-decoder.md) | `/url-encoder-decoder/` | GPT-6 Luna / medium |
| [x] | [07 — Cron Expression Explainer](07-cron-expression.md) | `/cron-expression/` | GPT-6.1 Sol / medium |
| [x] | [08 — UUID Generator](08-uuid-generator.md) | `/uuid-generator/` | GPT-6 Luna / medium |
| [x] | [09 — JSON ↔ YAML Converter](09-json-yaml-converter.md) | `/json-yaml-converter/` | GPT-6 Luna / high |
| [x] | [10 — JSON ↔ CSV Converter](10-json-csv-converter.md) | `/json-csv-converter/` | GPT-6 Luna / high |
| [x] | [11 — SQL Formatter](11-sql-formatter.md) | `/sql-formatter/` | GPT-6 Luna / high |
| [x] | [12 — Regex Tester](12-regex-tester.md) | `/regex-tester/` | GPT-6.1 Sol / medium |
| [x] | [13 — Integrasi & SEO](13-integration-seo.md) | `/tools/`, sitemap, navigasi | GPT-6.1 Sol / medium |

Prioritas ini berdasarkan kegunaan dan cakupan pengerjaan, bukan hasil pengukuran volume keyword. Ranking maupun jumlah traffic tidak dijamin. Evaluasi impresi/query aktual setelah situs terindeks sebelum menambah variasi tool.

## Backlog tambahan — D01–D10, task 14–24

Dibuat **12 Oktober 2026** sesuai permintaan membuat TODO untuk 10 kandidat developer tools. Setelah eksekusi lokal, **9/10 tool tersedia di hub dan sitemap**. Text Diff, Markdown Preview, dan JSONPath Tester sudah melewati fixture terfokus dan integrasi lokal. XML Formatter tersedia sebagai partial fail-closed: library 3.7.0 mengubah leaf whitespace-only, sehingga route belum dimasukkan ke navigasi publik. Task 14a fase A/C/D lulus smoke; fase B belum siap. Nomor lama 00–13 dipertahankan; D01–D10 adalah kode pilihan, sedangkan 14–23 nomor task.

Baca [EXTENSION-CONTRACT.md](EXTENSION-CONTRACT.md) bersama kontrak existing. Task 14a menyiapkan library hanya untuk consumer yang membutuhkan; task 24 mengintegrasikan batch yang sudah lulus. Semua tool memakai HTML/CSS/vanilla JS, direct folder routes, pemrosesan lokal, dan file siap GitHub Pages tanpa compiler/build.

| Selesai | TODO | Path yang direncanakan | Model / reasoning | Prasyarat |
|---|---|---|---|---|
| [~] | [14a — Readiness library browser](14a-library-readiness.md) | Tidak ada route publik | Luna · high, per fase | A/C/D siap; B partial |
| [~] | [14 / D01 — Text Diff](14-text-diff.md) | `/text-diff/` | Luna · high | 9/9 fixture; QA lanjutan task masih terbuka |
| [x] | [15 / D02 — Hash & Checksum Generator](15-hash-generator.md) | `/hash-generator/` | Luna · medium | Native Web Crypto |
| [x] | [16 / D03 — Password Generator](16-password-generator.md) | `/password-generator/` | Luna · high | Native Web Crypto |
| [x] | [17 / D04 — Color Converter & Contrast Checker](17-color-converter.md) | `/color-converter/` | Luna · high | Shared existing |
| [~] | [18 / D05 — XML Formatter & Syntax Checker](18-xml-formatter.md) | `/xml-formatter/` | Luna · high, per tahap | Fail-closed; whitespace-only leaf belum dapat diformat |
| [~] | [19 / D06 — Markdown Editor & Preview](19-markdown-preview.md) | `/markdown-preview/` | Luna · high, per tahap | 11/11 security fixture; review manual lanjutan terbuka |
| [x] | [20 / D07 — Number Base Converter](20-number-base-converter.md) | `/number-base-converter/` | Luna · medium | Native BigInt |
| [x] | [21 / D08 — URL Parser & Query Editor](21-url-parser.md) | `/url-parser/` | Luna · medium | Native URL/URLSearchParams |
| [x] | [22 / D09 — CSS Gradient Generator](22-css-gradient-generator.md) | `/css-gradient-generator/` | Luna · medium | Shared existing |
| [~] | [23 / D10 — JSONPath Tester](23-jsonpath-tester.md) | `/jsonpath-tester/` | Luna · high, per tahap | 13/13 fixture; review manual lanjutan terbuka |
| [~] | [24 — Integrasi tambahan & SEO](24-extension-integration-seo.md) | Hub/sitemap/related links | Luna · high, per batch | **Parsial:** 9 tool terhubung; XML ditahan |

**Model rekomendasi: GPT-6 Luna (`gpt-6-luna`).** Medium untuk transformasi terbatas; high untuk diff, validasi/parser, randomness kata sandi, dan integrasi. Pilihan reasoning per task adalah penilaian scope proyek, bukan benchmark. [OpenAI Docs: Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) mendukung medium/high; [panduan pemilihan model](https://developers.openai.com/api/docs/guides/model-selection) menempatkan Luna untuk pekerjaan yang scope-nya jelas dan biaya perlu dijaga. Harga API bukan estimasi penggunaan langganan Codex. Pilih model/reasoning di pengaturan chat; teks prompt tidak mengubah model sesi.

Urutan hemat yang disarankan:

1. **Batch ringan: 15 → 20 → 21 → 22**, satu task per sesi; tidak memerlukan library baru. Jalankan 24 untuk batch yang lulus.
2. **Batch berikutnya: 16 → 17**, lalu **14a fase A → 14**. Jalankan 24 lagi untuk tools siap.
3. **Batch parser: 14a fase B → 18**, **14a fase C → 19**, **14a fase D → 23**. Kerjakan per tahap sesuai task; tidak wajib menunggu kandidat lain. Jalankan 24 setiap batch siap.

Fixture browser untuk enam tool awal lulus **43/43**; empat task tambahan memiliki **47/47 focused fixture**; vendor readiness smoke **11/11**. Integrasi sembilan route lulus **13/13**, runner developer lama lulus **29/29**, dan `git diff --check` bersih. Angka ini bukti lokal browser, bukan publik/live. Task XML masih partial: fixture membuktikan leaf whitespace-only ditolak dengan aman karena xml-formatter 3.7.0 menambah/menghapus spasi saat memformat nilai tersebut. Lihat catatan pada 14a dan task 18. Manual keyboard/console review, publish, dan verifikasi live belum dilakukan.

Contoh eksekusi:

```text
Kerjakan hanya docs/developer-tools/15-hash-generator.md.
Baca CONTRACT.md dan EXTENSION-CONTRACT.md serta shared API actual.
Hanya HTML CSS JavaScript vanilla tanpa build/backend. Ikuti scope/limits/fixtures/browser QA pada task.
Setelah ada bukti, update checklist task15 dan baris15 README. Task lain tetap seperti semula.
Jangan commit/push/deploy.
```

Rincian tiap task mencatat hasil lokal 12 Oktober. Penerbitan/push, route live, Search Console, dan traffic belum diverifikasi; status tool harian serta backlog SEO tetap sesuai tracker terkait.

## Cara eksekusi dengan model hemat — task awal 00–13

1. Pilih model dan reasoning pada pengaturan chat; teks prompt tidak otomatis mengganti model.
2. Gunakan satu chat untuk satu task. Berikan README ini, [CONTRACT.md](CONTRACT.md), dan satu TODO target; tidak perlu seluruh riwayat redesign atau semua dokumen sekaligus.
3. Untuk tool, pastikan foundation sudah selesai. Model membaca shared files yang relevan, membuat file sesuai scope, lalu menjalankan fixture dan QA browser dalam TODO.
4. Simpan ringkasan singkat hasil aktual pada dokumen task: file berubah, tes lulus/gagal, limit, dan dependency version. Centang hanya yang sudah terbukti.
5. Jika fixture penting masih gagal setelah satu perbaikan terarah, gunakan GPT-6.1 Sol medium dengan reproduksi minimal dan file terkait. Tidak perlu mengulang semua implementasi.
6. Jalankan 02a untuk navigasi awal setelah 01–02. Setelah satu batch berikutnya selesai, jalankan tugas 13. Publish menjadi langkah terpisah ketika Anda memintanya.

Rekomendasi model di tabel adalah penilaian untuk scope proyek ini, bukan benchmark. Luna cocok untuk pekerjaan yang batas dan fixture-nya jelas; Sol dipakai pada kontrak bersama, semantik cron/DST, isolasi regex, dan review lintas halaman. Dokumentasi resmi juga menekankan pemilihan model berdasarkan kualitas yang diperlukan serta biaya/latensi: [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection). Harga API tidak dipakai untuk memperkirakan biaya langganan Codex Anda.

## Prompt generik

Setiap TODO sudah memiliki prompt khusus. Alternatif ringkas; ganti `<nomor-nama>` dengan nama file target:

```text
Implementasikan hanya docs/developer-tools/<nomor-nama>.md.
Baca docs/developer-tools/README.md dan CONTRACT.md, instruksi repository, serta file shared yang relevan.
Pastikan prasyarat task terpenuhi. Hanya HTML CSS JavaScript vanilla, tanpa npm/framework/build/backend.
Ikuti scope, ownership, UX, SEO, limit, fixture, dan definition of done dalam TODO.
Pertahankan perubahan pengguna; jangan mengerjakan task lain, commit, push, atau deploy.
Jalankan tes browser dan QA; catat bukti serta keterbatasan di dokumen task dan laporan akhir.
```

## Hosting statis tanpa compiler

Semua halaman harus siap disajikan GitHub Pages langsung dari file repository: HTML, CSS, JavaScript, dan dependency browser lokal. Tidak memerlukan compiler atau build aplikasi. Setiap route mempunyai folder dengan `index.html` asli. Native ES modules berjalan langsung di browser melalui HTTP/HTTPS; membuka file dari disk menggunakan `file://` bukan target dukungan. Server file lokal hanya diperlukan untuk preview pengembang.

## Domain dan SEO

Permintaan awal menggunakan `edwinlab.github.io/jsonlint`. Repository saat perencanaan memiliki CNAME `edwinlab.dev`, sehingga rencana mempertahankan domain itu dan canonical `https://edwinlab.dev/jsonlint/`. Integrasi harus memeriksa redirect GitHub Pages, HTTPS, dan deep link aktual. Mengubah domain bukan bagian task ini.

Konten bantuan dan metadata ditulis langsung di HTML agar dapat dibaca tanpa menunggu rendering JavaScript. Jangan membuat halaman kosong hanya untuk mengejar keyword. Rujukan: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), dan [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Batas deliverable saat ini

Implementasi lokal 00–13 selesai; pada 11 Oktober **321/321 fixture browser lulus**, termasuk 28 audit integrasi pada baseline saat itu. Hub kini menautkan **21 developer tools**, sitemap berisi **35 URL publik unik**, dan index tes berisi **26 runner noindex**. Batch tambahan pertama memiliki **43/43** fixture; empat task terbaru **47/47** fixture; vendor smoke **11/11**; integrasi sembilan route **13/13**; integrasi baseline **29/29**. XML Formatter dibuat fail-closed tetapi belum terhubung karena whitespace-only leaf belum dipreservasi. Pemeriksaan keyboard/console manual, deployment, verifikasi live routes/redirect, Search Console, dan baseline traffic tetap belum diverifikasi.
