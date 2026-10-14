# Kontrak tambahan — Everyday Tools 14–24

Status: **rencana saja, belum dieksekusi**. Dibuat 12 Oktober 2026. Baca bersama [CONTRACT.md](CONTRACT.md); ketentuan berikut memperluas ownership untuk batch baru. Instruksi pengguna selalu didahulukan.

## Teknologi dan scope

- HTML, CSS, JavaScript vanilla; folder nyata /slug/index.html dengan native ES modules melalui HTTP/HTTPS. GitHub Pages menyajikan file langsung tanpa compiler, build, npm, package.json, framework, backend, atau runtime CDN. Membuka file:// bukan target.
- UI Bahasa Indonesia, lang=id, brand/logo/font lokal existing. Gunakan /tools/shared/tools.css dan contoh struktur pada tool sehari-hari aktual. Konten profil, developer tools, CNAME, .nojekyll, dan algoritme tools existing tetap di luar scope.
- Task 14–23 memiliki folder route sendiri, logic.js, tool.js, CSS lokal bila perlu, tests/everyday/slug.html dan slug.test.js, dokumen task sendiri, serta **baris tracker sendiri** di README. Task 24 memiliki integrasi hub/sitemap/related links/index tests dan runner integrasi tambahan.
- Tidak ada vendor baru yang dibutuhkan V1. Task media 22/23 memakai helper gambar existing. PDF task 12 dan readiness PDF 00a/P tetap terpisah; jangan mengubah statusnya atau menyalin prasyarat PDF ke batch ini.
- Baca implementasi shared aktual sebelum coding. Prasyarat adalah helper yang relevan tersedia dan fixture kritisnya lulus. Checkbox manual task lama yang tidak terkait tidak otomatis memblokir seluruh batch. Jika helper gagal pada kasus yang dibutuhkan, catat reproduksi dan selesaikan melalui task pemiliknya dahulu; jangan mengubah shared/vendor diam-diam.

## API shared yang sudah tersedia

- /everyday/shared/ui.js: copyTextId(text, statusElement) mengembalikan Promise<boolean>; downloadBlob(blob, filename) memicu unduhan lokal dan membersihkan URL. Tidak ada export setStatus di modul ini.
- /tools/shared/ui.js: setStatus(statusElement, {kind, message}); pakai pesan Indonesia. /tools/shared/limits.js: assertTextSize untuk ukuran UTF-8; batas khusus task berlaku.
- /everyday/shared/number.js: parseDecimal(text, options) → coefficient BigInt dan scale; roundRatio dan formatRatio memakai pembulatan half away from zero. Tidak mendukung grouping atau eksponen. Satu koma/titik adalah separator desimal; tool integer menolak separator.
- /everyday/shared/image.js: inspectImage(file), decodeImage(file) → {bitmap, width, height, mime}, encodeImage(bitmap, {width,height,mime,quality,background}) → Promise<Blob>. Input JPEG/PNG statis: 10 MiB, 12 juta piksel, 8192 px/sisi; output 20 MiB. Bitmap sudah berorientasi; jangan memutar EXIF lagi.
- Harness /tests/tools/harness.js menyediakan test/assert/equal/deepEqual/throws/run. Runner baru memakai noindex,nofollow. Index tests baru diperbarui task 24 setelah file nyata tersedia.

## UX, state, dan privasi

- Label tetap, contoh sintetis, proses eksplisit, clear/reset, hasil yang bisa diseleksi, copy/download sesuai task. Input/opsi berubah menghapus hasil sukses dan menonaktifkan ekspor lama. Error mempertahankan input.
- Teks/nama file dinamis melalui value/textContent. Tidak ada eval, HTML input, URL fetch pengguna, upload, analytics input, input di query/hash, localStorage/IndexedDB/history. Timer sengaja tidak menyimpan sesi setelah reload.
- Operasi async memakai ID monotonik dan snapshot input. Clear/ganti input/cancel menginvalidasi hasil; jawaban lama tidak boleh menimpa status baru. Media menjalankan satu job; job native yang sudah berjalan boleh selesai kemudian, tetapi hasil lama harus dibuang dan bitmap/URL dilepas.
- API unsupported/error memberi pesan Indonesia dan ekspor tetap disabled. Copy sukses hanya setelah clipboard promise berhasil; denial menawarkan seleksi manual. Unduhan disebut "dimulai", bukan "sudah tersimpan".
- Batas tepat diterima dan satu di atas ditolak; tidak truncation diam-diam. Tidak ada janji traffic, lossless umum, alarm andal saat perangkat tidur, atau bukti keadilan undian.
- Timer tidak menggunakan aria-live untuk setiap tick. Live status hanya untuk perubahan mulai/jeda/selesai/error; tidak ada suara, notifikasi, atau permission browser baru dalam V1.

## SEO dan QA setiap tool

- Canonical tunggal https://edwinlab.dev/slug/, OG URL sama, viewport, favicon/logo existing, satu H1, title/description unik, breadcrumb Beranda → Alat Online → Tool. JSON-LD BreadcrumbList bila digunakan harus cocok dengan konten terlihat.
- HTML awal berisi intro, panduan, contoh yang benar, batas, dan FAQ khusus tool. Navigasi dan artikel tetap terlihat tanpa JS. Related links hanya ke route siap; task 24 menambah pasangan baru setelah siap.
- Tidak membuat route varian untuk keyword, rating palsu, janji rich results, atau schema yang menyebut fitur belum tersedia. Keyword di task adalah hipotesis intent; tidak ada volume/ranking yang telah diukur.
- Fixture menguji aturan dan failure boundary, bukan sekadar meniru implementasi. Gunakan clock/random injection hanya untuk uji deterministik; browser flow tetap memakai API asli. Decode ulang output gambar dan cek piksel/dimensi/MIME.
- QA HTTP localhost: direct route + refresh, contoh, invalid input, clear/stale/copy/download, keyboard/focus/status, 320/390/768/1440 px, no-JS content, console/Network sejauh tool tersedia, dan git diff --check. Catat unavailable checks sebagai pending, jangan mengklaim bersih tanpa evidence.
- Definition of Done: fitur V1, fixture wajib, dan QA yang relevan lulus; catat tanggal, files, jumlah pass/fail, model aktual bila diketahui, serta keterbatasan. Checkbox task dan row tracker selesai hanya setelah bukti. Status **sebagian** bila masih ada bagian wajib pending.
- Tidak commit/push/deploy, submit Search Console, mengubah akun, membuat automation, atau mengeksekusi task lain dari prompt ini.

## Cara menjaga biaya

Satu task per chat. Baca README/CONTRACT/kontrak ini, satu task, dan shared yang dipakai saja. Jalankan bertahap: logic + fixture → UI + konten → QA + checklist. Prompt tidak mengubah model; pengguna memilih model di pengaturan chat.

GPT-6 Luna mendukung medium/high menurut [OpenAI Docs](https://developers.openai.com/api/docs/models/gpt-6-luna). Pembagian reasoning pada tracker adalah penilaian scope proyek, bukan benchmark. [Panduan pemilihan model](https://developers.openai.com/api/docs/guides/model-selection) menyarankan tugas dengan brief jelas untuk Luna medium. Kalau tes gagal, buat reproduksi kecil dan perbaiki dengan model yang sama sebelum memperbesar scope.

## Sumber API yang diperiksa saat perencanaan

- [Performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) dan [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): clock monotonik dan keterlambatan update tab tersembunyi; perilaku saat sleep perlu batas eksplisit.
- [Crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues): sumber random native untuk pengacak.
- [CreateImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) dan [Canvas.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob): crop/decode/encode lokal dan pemeriksaan MIME hasil.

Tidak ada implementasi, download dependency, pengujian aplikasi, atau perubahan route dalam sesi penyusunan dokumen ini.
