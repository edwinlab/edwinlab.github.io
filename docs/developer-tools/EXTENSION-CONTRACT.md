# Kontrak tambahan — Developer Tools 14–24

Status: **rencana saja; belum implementasi**. Berlaku untuk backlog 14–24 serta prasyarat 14a. Baca bersama [CONTRACT.md](CONTRACT.md); kontrak lama tetap berlaku kecuali ownership baru (termasuk update baris README milik task) dan pengecualian Markdown di bawah. Instruksi pengguna didahulukan.

## Teknologi, existing files, dan ownership

- HTML, CSS, JavaScript vanilla; GitHub Pages langsung menyajikan file. Tanpa npm/package.json, framework, compiler, bundler, transpiler, backend, atau runtime CDN.
- Native ES modules melalui HTTP/HTTPS dan folder asli dengan `index.html`. Tidak menjanjikan dukungan `file://`.
- Periksa implementasi aktual sebelum memakai helper: `tools/shared/ui.js`, `limits.js`, `json.js`, `tools.css`, `tests/tools/harness.js`, dan `docs/developer-tools/tool-template.html`. Jangan menganggap API dari rencana lama belum dibuat.
- Tool hanya memiliki folder route, runner HTML/JS sendiri, dokumen task, serta baris status miliknya dalam README. Task 14a memiliki vendor baru/provenance dan runner dependency. Task 24 memiliki hub/sitemap/related links/runner integrasi. Tidak mengedit shared/homepage atau memasang vendor sendiri dalam task tool.
- Semua input lokal; tanpa fetch URL pengguna, storage/history, query/hash input, analytics payload, atau eval kode input. File vendor hanya dimuat pemakainya. Jangan mengubah algoritme tools existing.
- Prompt task tidak mengganti model chat. Pilih model di UI sebelum eksekusi. Satu task per sesi; tugas bertahap menyimpan checkpoint dalam task yang sama.

## UX dan batas

- Bahasa publik Inggris; instruksi TODO Indonesia. Gunakan brand, logo, font lokal, shared CSS, breadcrumb `Home → Developer Tools → [tool]`.
- Gunakan label permanen, kontrol native, tombol proses, example/clear/copy; download hanya bila direncanakan. Data pengguna tampil via `.value`/`textContent`.
- Hasil dibatalkan saat input/opsi berubah. Respons async membawa request ID; perubahan/clear/cancel menonaktifkan hasil lama dan respons terlambat diabaikan. Timeout/cancel worker benar-benar terminate.
- Ukuran input/output diukur UTF-8 jika berupa teks. Limit khusus dalam task lebih ketat dari limit shared; tepat batas diterima, satu byte/unit di atasnya ditolak sebelum kerja besar.
- Clipboard gagal memberi seleksi manual; status sukses hanya setelah API sukses. File unduhan memakai basename aman dan URL Blob direvoke setelah dipicu.
- UI menampilkan batas dalam bahasa pembaca, bukan detail worker/request ID/library. Bahasa teknis boleh di panduan lanjut bila membantu memahami hasil.
- QA 320/390/768/1440 px, keyboard/focus, direct route/refresh, stale/error/copy/download, no-JS content, console/network. Catat batas lingkungan; jangan centang tes yang tidak dijalankan.

## Pengecualian sempit untuk Markdown preview

Larangan menaruh HTML input lewat `innerHTML` dalam CONTRACT tetap berlaku di halaman utama. Task 19 boleh membuat **HTML hasil parser yang sudah disanitasi** untuk preview inert di `iframe` sandbox tanpa izin scripts/same-origin/forms/popups/top-navigation. Tidak ada raw HTML pengguna di DOM utama.

- Raw HTML Markdown tidak dirender. Sanitasi tetap wajib untuk output parser, memakai DOMPurify yang dipin oleh 14a, tag/atribut allowlist serta URL policy.
- `srcdoc` hanya menerima dokumen yang dibangun dari HTML tersanitasi ditambah template/style konstan milik aplikasi. CSP di awal head memblokir script dan semua resource/network; gambar/embed/form/SVG/MathML tidak didukung V1. Jangan bergantung sandbox saja untuk mencegah tracking image.
- Preview tidak mengaktifkan navigasi link otomatis. Kode HTML/script ditampilkan literal dalam code block.
- Sanitasi memakai browser DOM, bukan worker DOM-free. Worker boleh menjalankan parsing Markdown. Download HTML menerima hasil sanitasi/policy yang sama, bukan sumber raw atau output parser sebelum sanitasi.
- Jika browser tidak mendukung sanitizer/frame yang dibutuhkan, tampilkan error terkontrol; jangan fallback ke rendering unsafe.

## SEO dan pengujian

- Title/description/H1 unik, canonical `https://edwinlab.dev/<slug>/`, OG/Twitter sesuai template dan image yang sudah ada. Jangan mengklaim social card baru sebelum asset dibuat.
- Pengantar/cara pakai/contoh/limitations/FAQ berguna tersedia di HTML awal. Jangan memberi kuota kata, rating/review palsu, atau klaim volume/ranking.
- Related links hanya ke halaman siap. 14–23 belum boleh muncul di hub/sitemap saat masih rencana. Task 24 mengintegrasikan batch yang lulus.
- Browser-native tests memakai harness existing dan runner `noindex,nofollow`; tidak membuat framework/Node test runner baru. Fixture menguji aturan/hasil serta risiko relevan; jangan menduplikasi semua suite existing pada tiap tool.
- Task 24 menjaga semua route existing, termasuk 11 alat harian; baseline sitemap sekarang **26 URL**, bukan angka 14 dari laporan lama. Hitung file aktual saat integrasi; semua 10 tambahan selesai akan membuat 36 URL bila tidak ada perubahan lain.
- Tugas eksekusi baru selesai setelah fixture inti dan UI teruji. Status awal semua TODO **belum dikerjakan**. Update checklist task + tracker README dengan bukti dan limitations. Status sebagian bila dependency/QA belum lulus.
- Tidak ada commit/push/deploy/perubahan akun/automation dari dokumen ini. Tindakan tersebut mengikuti instruksi langsung dalam sesi eksekusi.

## Ringkasan model dan urutan

Rekomendasi per task memakai GPT-6 Luna medium/high sebagai penilaian scope proyek, bukan benchmark. Medium untuk transformasi terbatas, high untuk parser/diff/keamanan dan integrasi. Task besar dibagi fase agar konteks lebih kecil. Bila gagal, perbaiki reproduksi kecil dan tes terkait; model lebih mahal tidak wajib.

Task 14a boleh dieksekusi per tahap library untuk tool yang dipilih. 15/16/17/20/21/22 tidak membutuhkan vendor baru. 14/18/19/23 membutuhkan tahap readiness yang sesuai. Task 24 dijalankan setelah satu batch siap, bukan menunggu semua tools.
