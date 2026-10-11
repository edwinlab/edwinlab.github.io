# 08 — UUID Generator

Status: rencana saja; implementasi belum dibuat.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `medium`**. Rekomendasi berdasarkan cakupan tugas, bukan benchmark.
URL: `/uuid-generator/`.

## Tujuan dan batas pekerjaan

Menghasilkan UUID versi 4 secara lokal, satu atau massal hingga 1.000, dengan API crypto native browser.
UI dan konten publik berbahasa Inggris. Fokus MVP adalah output standar lowercase berformat 8-4-4-4-12.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat

- [ ] Baca `README.md` dan `CONTRACT.md` di direktori rencana ini.
- [ ] Pastikan `00-foundation.md` selesai dan tes foundation lulus.
- [ ] Baca instruksi repository serta pertahankan perubahan pengguna yang sudah ada.
- [ ] Gunakan HTML statis dan ES module `.js`; tidak perlu package, backend, atau build.

## File yang dikerjakan

- `uuid-generator/index.html` — kontrol jumlah, output, konten SEO, dan metadata.
- `uuid-generator/logic.js` — validasi count dan generator dengan sumber crypto diinjeksi untuk tes.
- `uuid-generator/tool.js` — adapter crypto browser, event, output, copy, dan download.
- `tests/tools/uuid-generator.test.js` — pengujian browser-native memakai runner foundation.
- `tests/tools/uuid-generator.html` — halaman runner tes yang dibuka melalui HTTP lokal.
- Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js` sesuai `CONTRACT.md`.
- Gunakan shared `limits.js` untuk `assertTextSize`; `setStatus`, `copyText`, dan `downloadText` mengikuti signature kontrak.
- Prasyarat teknis: hanya HTML/CSS/JavaScript vanilla; tanpa npm, package.json, Node test runner, framework, atau build.
- Perubahan registry/sitemap/file bersama hanya menurut prosedur kontrak.

## TODO implementasi

- [ ] Sediakan input `Number of UUIDs`, default `1`, min `1`, max `1000`, step `1`.
- [ ] Sediakan `Generate UUIDs`, `Copy all`, `Download .txt`, dan `Clear`.
- [ ] Jangan menghasilkan UUID otomatis saat load; generation terjadi melalui tindakan pengguna.
- [ ] Trim count, lalu terima hanya digit desimal ASCII; validasi integer 1–1000 secara eksplisit.
- [ ] Jangan menggunakan `parseInt` tanpa validasi, sehingga `2abc`, `1.5`, dan `1e3` ditolak.
- [ ] Count berupa `001` boleh ditafsirkan 1; spasi hanya di tepi boleh di-trim.
- [ ] Gunakan `crypto.randomUUID()` sebagai jalur utama bila tersedia.
- [ ] Bila randomUUID tidak tersedia, fallback hanya `crypto.getRandomValues(new Uint8Array(16))`.
- [ ] Pada fallback, set version nibble ke `4`, variant ke RFC-compatible `10`, lalu format hex lowercase.
- [ ] Tidak ada fallback `Math.random`, timestamp, incremental counter, atau library UUID.
- [ ] Jika kedua API crypto tidak tersedia/gagal, tampilkan error dan jangan mengeluarkan hasil parsial.
- [ ] Injeksi sumber randomness pada logic untuk tes deterministik; UI selalu memakai crypto browser asli.
- [ ] Hasil berbentuk array string; rendering satu UUID per baris dalam output read-only.
- [ ] Generate ulang menggantikan batch lama, bukan menambahkan diam-diam.
- [ ] Ubah count menandai hasil stale sesuai kontrak; clear menghapus hasil dan status dengan jelas.
- [ ] `Copy all` menggunakan newline antar UUID; sediakan feedback sukses/gagal dan seleksi manual.
- [ ] Download berupa UTF-8 `text/plain`, satu UUID per baris, nama `uuids-v4.txt`.
- [ ] Panggil `downloadText(text,'uuids-v4.txt','text/plain;charset=utf-8')`; lifecycle object URL ditangani helper shared.
- [ ] Nonaktifkan copy/download jika tidak ada hasil atau hasil stale; generate ulang mengaktifkannya.
- [ ] Terapkan batas total input teks 5 MiB dari kontrak sebelum validasi count, walaupun input normal sangat pendek.
- [ ] Render dengan value/`textContent`, tanpa interpolasi HTML input.
- [ ] Tidak ada network generation, telemetry, local/session storage, riwayat UUID, atau input pada query/hash URL.

## Fixture dan tes wajib

- [ ] Count `1`, `1000`, `001`, dan ` 2 ` diterima dengan jumlah yang sesuai.
- [ ] Count `0`, `1001`, `-1`, `1.5`, `1e3`, `2abc`, `NaN`, whitespace saja, dan empty ditolak.
- [ ] Fixture byte nol pada fallback menghasilkan `00000000-0000-4000-8000-000000000000`.
- [ ] Fixture byte `ff` seluruhnya menghasilkan `ffffffff-ffff-4fff-bfff-ffffffffffff`.
- [ ] Bytes `00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f` menghasilkan `00010203-0405-4607-8809-0a0b0c0d0e0f`.
- [ ] Semua hasil match pola `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`.
- [ ] Generator diinjeksi yang mengembalikan nilai berurutan dipanggil tepat sebanyak count yang valid.
- [ ] Count tidak valid tidak memanggil sumber crypto sama sekali.
- [ ] Stub crypto tidak tersedia atau melempar error menghasilkan error terkontrol, tanpa hasil parsial.
- [ ] Serialize dua UUID menghasilkan tepat satu newline di antaranya dan nilai tetap utuh.
- [ ] Tes deterministik tidak menjadikan keunikan acak sebagai bukti keamanan atau jaminan zero collision.
- [ ] Browser smoke test crypto asli menghasilkan batch 1 dan 1.000; output format/jumlah benar, UI tetap responsif.

## SEO dan konten statis

- [ ] Title: `UUID v4 Generator — Generate Bulk UUIDs Online | Edwin Lab`.
- [ ] H1: `UUID Generator`.
- [ ] Description: `Generate one or up to 1,000 UUID v4 identifiers locally in your browser. Copy your batch or download it as a text file with no signup required.`
- [ ] Canonical dan social metadata mengikuti kontrak, termasuk trailing slash.
- [ ] Tulis panduan tiga langkah: pilih jumlah, generate, copy/download.
- [ ] Jelaskan UUID v4 memakai randomness dan format standar 36 karakter termasuk tanda hubung.
- [ ] Gunakan contoh statis `550e8400-e29b-41d4-a716-446655440000` dan labeli sebagai contoh, bukan output baru.
- [ ] Sebutkan kasus penggunaan: test fixture, identifier resource, dan seed data development.
- [ ] FAQ: `Which UUID version is generated?`, `Can I generate UUIDs in bulk?`, dan `Are UUIDs generated on a server?`.
- [ ] Hindari klaim pasti unik atau aman sebagai password/token rahasia.
- [ ] Tautkan `/jsonlint/`, `/timestamp-converter/`, dan `/tools/` secara kontekstual.
- [ ] Teks penjelas tersedia dalam HTML awal; tambahkan pesan noscript.

## Di luar scope

UUID v1/v3/v5/v7, namespace input, password/token generator, format custom, database insertion, dan deduplikasi global.

## Definition of done

- [ ] Halaman `/tests/tools/uuid-generator.html` menunjukkan seluruh tes lulus; console bersih dan `git diff --check` lulus.
- [ ] Browser QA count batas, regenerate, copy, download beserta isinya, clear, dan error crypto.
- [ ] UI mengikuti shared design, dapat dioperasikan keyboard, dan tidak overflow pada 320 px.
- [ ] Network tab tidak menunjukkan pengiriman data; refresh `/uuid-generator/` berhasil.
- [ ] Laporkan file berubah, hasil tes, dan batasan; jangan memublikasikan situs.

## Prompt eksekusi siap tempel

> Implementasikan hanya `docs/developer-tools/08-uuid-generator.md` setelah membaca README.md dan CONTRACT.md di direktori itu serta memeriksa 00-foundation selesai. Model rekomendasi GPT-6 Luna (`gpt-6-luna`) reasoning medium. Gunakan shared UI, HTML statis/ES modules, crypto.randomUUID atau fallback getRandomValues dengan version/variant bits benar; jangan Math.random. Batas jumlah 1–1.000. Buat pure logic yang dapat dites deterministik, tombol copy/download, dan konten SEO statis. Integrasi file bersama mengikuti kontrak. Jalankan tes dan browser QA; jangan publish, commit, atau menambah dependency.
