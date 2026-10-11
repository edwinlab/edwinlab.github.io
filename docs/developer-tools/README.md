# Developer tools — rencana eksekusi

Dibuat 11 Oktober 2026. **Foundation (00), JSONlint (01), JSON Diff (02), serta menu Developer Tools dan hub (02a) selesai secara lokal. Prioritas berikutnya: Timestamp Converter (03).** Tujuan: menambah halaman developer tools yang berguna dan dapat ditemukan melalui pencarian, dengan identitas Edwin Lab serta link kembali ke profil profesional.

Teknologi: **HTML + CSS + JavaScript vanilla**, tanpa framework, npm, package.json, bundler, backend, atau build. Library parser JavaScript lokal siap browser dipakai hanya untuk fitur yang memerlukannya. Seluruh input diproses di perangkat pengguna.

## Urutan dan tracker

Foundation 00, tool 01–02, dan hub 02a selesai secara lokal. Lanjutkan 03–06 sebagai rilis awal, kemudian tugas 13 untuk audit SEO dan integrasi tool tambahan. Kerjakan 07–12 sebagai perluasan, lalu ulangi checklist integrasi untuk halaman tambahan. Nomor menunjukkan urutan rekomendasi, bukan dependency antar-tool: sesudah foundation, satu tool bisa dikerjakan mandiri.

| Selesai | Task dan TODO | Route | Model / reasoning |
|---|---|---|---|
| [x] | [00 — Foundation](00-foundation.md) | Shared assets | GPT-6.1 Sol / medium |
| [x] | [01 — JSON Validator & Formatter](01-jsonlint.md) | `/jsonlint/` | GPT-6 Luna / high |
| [x] | [02 — JSON Diff](02-json-diff.md) | `/json-diff/` | GPT-6 Luna / high |
| [x] | [02a — Menu Developer Tools & hub](02a-navigation-hub.md) | Menu utama, `/tools/` | — |
| [ ] | [03 — Timestamp Converter](03-timestamp-converter.md) | `/timestamp-converter/` | GPT-6 Luna / high |
| [ ] | [04 — JWT Decoder](04-jwt-decoder.md) | `/jwt-decoder/` | GPT-6 Luna / high |
| [ ] | [05 — Base64 Encoder / Decoder](05-base64.md) | `/base64/` | GPT-6 Luna / medium |
| [ ] | [06 — URL Encoder / Decoder](06-url-encoder-decoder.md) | `/url-encoder-decoder/` | GPT-6 Luna / medium |
| [ ] | [07 — Cron Expression Explainer](07-cron-expression.md) | `/cron-expression/` | GPT-6.1 Sol / medium |
| [ ] | [08 — UUID Generator](08-uuid-generator.md) | `/uuid-generator/` | GPT-6 Luna / medium |
| [ ] | [09 — JSON ↔ YAML Converter](09-json-yaml-converter.md) | `/json-yaml-converter/` | GPT-6 Luna / high |
| [ ] | [10 — JSON ↔ CSV Converter](10-json-csv-converter.md) | `/json-csv-converter/` | GPT-6 Luna / high |
| [ ] | [11 — SQL Formatter](11-sql-formatter.md) | `/sql-formatter/` | GPT-6 Luna / high |
| [ ] | [12 — Regex Tester](12-regex-tester.md) | `/regex-tester/` | GPT-6.1 Sol / medium |
| [ ] | [13 — Integrasi & SEO](13-integration-seo.md) | `/tools/`, sitemap, navigasi | GPT-6.1 Sol / medium |

Prioritas ini berdasarkan kegunaan dan cakupan pengerjaan, bukan hasil pengukuran volume keyword. Ranking maupun jumlah traffic tidak dijamin. Evaluasi impresi/query aktual setelah situs terindeks sebelum menambah variasi tool.

## Cara eksekusi dengan model hemat

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

Foundation 00, JSONlint 01, JSON Diff 02, dan hub 02a sudah diimplementasikan dan memiliki laporan tes lokal. Tool 03–12 serta audit integrasi 13 masih terbuka. Tidak ada eksekusi model atau deployment yang dijadwalkan otomatis.
