# 08 — Pembuat Link WhatsApp

Status: **implementasi selesai; QA sebagian**. Runner browser lulus 25/25; route dan contoh diperiksa, tanpa membuka tautan eksternal. Console, no-JS, keyboard manual, refresh, dan panel Network belum diverifikasi.
Model awal: **GPT-6 Luna · high**. Prasyarat [00-foundation.md](00-foundation.md). Jika fixture penting tetap gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan menandai selesai sebelum terbukti.
Route: `/link-whatsapp/`; canonical: `https://edwinlab.dev/link-whatsapp/`. UI Indonesia, `lang="id"`.

## Tujuan dan scope

Membuat satu URL click-to-chat `https://wa.me/` dari nomor seluler Indonesia dan pesan opsional. V1 diberi label jelas **nomor seluler Indonesia (+62)**, tanpa pilihan negara yang menyesatkan. Tidak ada pencarian akun aktif, verifikasi nomor, QR code, shortening link, pesan massal, auto-open, atau pengiriman pesan. Ini generator tautan mandiri, tidak mengklaim afiliasi resmi WhatsApp.

- [x] Baca instruksi repository, [README.md](README.md), [CONTRACT.md](CONTRACT.md), [00-foundation.md](00-foundation.md), dan shared exports aktual.
- [x] Miliki hanya `link-whatsapp/index.html`, `link-whatsapp/tool.js`, `link-whatsapp/logic.js`, opsional `link-whatsapp/tool.css`, `tests/everyday/link-whatsapp.html`, `tests/everyday/link-whatsapp.test.js`, catatan/checklist dokumen ini, serta baris tracker 08 di README sesuai kontrak.
- [x] Runner mengimpor `/tests/tools/harness.js`, `noindex,nofollow`. Existing `/tools/shared/tools.css`, `ui.js`, `limits.js` read-only; copy Indonesia memakai `/everyday/shared/ui.js`.
- [x] Hanya HTML/CSS/JavaScript vanilla ES modules langsung GitHub Pages, tanpa npm, compiler, build, backend, CDN, API WhatsApp, library nomor telepon, atau dependency runtime. Jangan mengubah shared files, hub, homepage, sitemap, CNAME, atau developer tools.

## Format resmi dan keputusan produk

[WhatsApp Help Center: How to use click to chat](https://faq.whatsapp.com/5913398998672934) diperiksa saat perencanaan: URL memakai nomor internasional tanpa tanda plus/pemisah; pesan awal memakai parameter `text` yang telah URL-encoded. Membuka tautan menyiapkan chat, dan penerima perlu memiliki akun WhatsApp aktif. Keterbatasan digit dan normalisasi Indonesia di bawah adalah **kebijakan input V1 tool ini**, bukan klaim memvalidasi alokasi nomor operator atau akun aktif.

- [x] Cantumkan link Help Center dalam panduan HTML. Pertahankan angka nol di bagian nomor selain nol trunk pertama; instruksi menghapus zero pada nomor internasional tidak berarti menghapus seluruh digit `0`.
- [x] URL selalu diawali literal `https://wa.me/` dan angka yang dihasilkan parser sendiri. Tidak menerima URL dari input nomor, custom host, atau skema protocol lain.

## Parsing nomor, pesan, dan URL

- [x] Export fungsi murni `normalizeIndonesianPhone(raw) -> canonicalDigits` dan `createWhatsAppLink(phoneRaw,messageRaw) -> {phone,message,url}`. Tidak menyentuh DOM, jaringan, clipboard, storage, atau location.
- [x] Nomor raw maksimal 64 UTF-16 code units sebelum trim, melebihi → `PHONE_TOO_LONG`. Pangkas whitespace ASCII di tepi; field wajib. Di dalam, hanya digit ASCII `0–9`, spasi ASCII, tanda `-`, `(`, `)`, dan satu plus opsional di depan setelah separator dihapus. Hapus spasi/kurung/hyphen; urutan/susunan kurung tidak bermakna dan tidak perlu seimbang.
- [x] Bentuk ringkas yang diterima: `^08[0-9]{8,11}$`, `^628[0-9]{8,11}$`, atau `^\+628[0-9]{8,11}$`. Yang lokal `08…` diganti hanya nol awalnya dengan `62`; `+62…` dibuang plusnya; `62…` tetap. Hasil selalu `^628[0-9]{8,11}$`, total 11–14 digit. Semua lainnya → `INVALID_PHONE`.
- [x] Tolak nomor `8…` tanpa awalan, `0062…`, `+6208…`, kode negara lain, telepon rumah, ekstensi `x123`, titik/slash, plus ganda/tengah, huruf, digit Unicode, line break/tab di tengah, atau banyak nomor. Jangan menebak nomor tidak lengkap.
- [x] Pesan opsional string; normalisasi `\r\n` dan sisa `\r` menjadi `\n` tepat sekali, lalu pertahankan semua isi termasuk spasi tepi. Pesan kosong persis `""` tidak memiliki query; pesan berisi spasi tetap pesan. Jangan decode teks yang terlihat seperti `%20`.
- [x] Batas pesan setelah normalisasi: maksimal 500 Unicode code points (`Array.from(message).length`) dan 2000 byte UTF-8, tepat batas diterima. Sebelum normalisasi batasi raw pesan 2000 UTF-16 code units; raw melebihi atau hasil melebihi batas → `MESSAGE_TOO_LONG`. Beri counter code point, bukan `textarea.maxLength=500` yang menghitung code units dan merusak batas emoji.
- [x] Tolak unpaired surrogate dan kontrol U+0000–001F selain tab U+0009/newline U+000A, serta U+007F, dengan `INVALID_MESSAGE`. Jangan membocorkan URIError. Emoji/surrogate pair valid diterima.
- [x] Jika pesan nonempty, URL = `"https://wa.me/" + phone + "?text=" + encodeURIComponent(message)`. Panggil `encodeURIComponent` **sekali** pada pesan mentah yang sudah dinormalisasi. Jangan meng-encode seluruh URL, memanggil decodeURIComponent, atau mengubah spasi menjadi plus. Gunakan output encodeURIComponent native termasuk perilaku `! ' ( ) *`.
- [x] Maksimum URL akhir 8192 karakter ASCII (`URL_TOO_LONG` bila terlampaui); batas 500 code point/2000 byte membuat output lazim tetap di bawahnya. Satu hasil saja, tanpa batch/file upload. Preview pesan melalui textContent, bukan innerHTML.

## UX, state, dan pengecualian privasi eksternal

- [x] Label `Nomor seluler Indonesia (+62)` pada `type="tel"`, maxlength 64; hint `Contoh format: 08…, 628…, atau +628…`. Label textarea `Pesan awal (opsional)` dan counter `0/500 karakter` disertai catatan emoji dihitung satu code point.
- [x] Load kosong tanpa hasil. Tombol `Buat link`, `Isi contoh`, `Bersihkan`, `Salin link`, dan link aksi `Buka di WhatsApp — mengirim nomor dan pesan ke WhatsApp`.
- [x] Contoh sintetis `0812-3456-7890` dengan pesan `Halo, saya ingin bertanya.`; tandai sebagai format contoh yang perlu diganti nomor sendiri, bukan kontak terverifikasi. QA tidak membuka/mengirim apa pun ke nomor contoh.
- [x] Tombol buat hanya membangun URL lokal. Tampilkan nomor normalisasi, URL readonly yang bisa diseleksi, dan pesan preview. Jangan memicu `window.open`, klik programatik, redirect, fetch/prefetch, atau membuat request ke wa.me setelah mengetik/menghitung.
- [x] **Pengecualian privasi yang disengaja:** nomor/pesan tetap di browser selama pembuatan; saat pengguna sendiri mengklik `Buka di WhatsApp`, URL membawa nomor dan pesan ke WhatsApp. Jelaskan di dekat aksi. Link eksternal `target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"`; membuka chat tidak sama dengan mengirim pesan, pengguna masih menekan kirim di WhatsApp.
- [x] URL hasil hanya dipasang pada href aksi sesudah hasil valid. Input nomor/pesan, contoh, atau clear berubah → hapus hasil dan href segera, sembunyikan/disable aksi, disable copy. Link lama tidak boleh tetap dapat difokus/click saat stale. Jangan sekadar `aria-disabled` pada href yang masih aktif.
- [x] `Isi contoh` mengisi tanpa menghitung. `Bersihkan` kosongkan semua, hasil, preview, counter, status dan href, lalu fokus nomor. Error mempertahankan input, fokus field terkait, pesan Indonesia spesifik, `aria-live="polite"`.
- [x] Copy hanya URL persis yang terlihat; gunakan helper copy Indonesia dengan fallback manual. Tidak ada clipboard read, analytics input, log nomor/pesan, input pada URL halaman sendiri, localStorage/sessionStorage, atau riwayat tautan.

## HTML dan SEO

- [x] Title: `Pembuat Link WhatsApp +62 dengan Pesan | Edwin Lab`.
- [x] Meta description: `Buat link WhatsApp untuk nomor Indonesia 08, 62, atau +62 dengan pesan awal opsional. Salin tautan wa.me tanpa menyimpan nomor ke kontak.`
- [x] H1: `Pembuat Link WhatsApp`.
- [x] Intro: `Ubah nomor seluler Indonesia menjadi tautan wa.me yang siap dibagikan. Tambahkan pesan awal bila diperlukan, lalu salin tautannya atau pilih sendiri untuk membukanya di WhatsApp.`
- [x] HTML statis memuat tiga langkah: isi nomor, pesan opsional, buat/salin; contoh normalisasi `0812-3456-7890 → 6281234567890`; jelaskan kode negara, privasi saat membuka, batas pesan, dan ketergantungan akun penerima aktif.
- [x] FAQ terlihat: `Apakah nomor harus diawali +62?` → 08/62/+62 diterima dan dinormalisasi; `Apakah tool memeriksa akun WhatsApp aktif?` → tidak; `Apakah pesan langsung terkirim?` → tidak, tautan hanya menyiapkan chat/pesan awal; `Kapan nomor dan pesan keluar dari browser?` → ketika pengguna membuka tautan eksternal atau membagikan hasil; `Mengapa pesan terlihat memiliki %20?` → URL encoding spasi, tampilan chat memulihkan teks; `Apakah nomor luar Indonesia didukung?` → V1 hanya seluler Indonesia.
- [x] Hipotesis intent, **bukan volume terukur**: `buat link whatsapp`, `link wa dengan pesan`, `ubah nomor 08 ke link wa`, `generator wa me Indonesia`. Jangan membuat route duplikat per awalan nomor atau mengklaim ranking.
- [x] Canonical, OG, favicon/logo lokal, viewport, breadcrumb, satu H1 dan `<noscript>` tersedia pada HTML awal. Related candidate `/url-encoder-decoder/` dengan label `Periksa URL encoding`; hanya tautkan bila halaman siap dan QA lulus. Tidak perlu menambah related link yang tidak relevan demi jumlah.

## Fixture wajib saat eksekusi

Untuk semua fixture URL gunakan nomor sintetis tanpa menjalankan navigasi eksternal. Base `https://wa.me/6281234567890`.

- [x] Nomor `081234567890`, `6281234567890`, `+6281234567890`, dan ` +62 (812) 3456-7890 ` semuanya → `6281234567890`.
- [x] Nomor `081200000000` → `6281200000000`; nol internal tetap utuh.
- [x] Nomor `0812345678` → `62812345678` (batas bawah); `0812345678901` → `62812345678901` (batas atas).
- [x] `081234567` dan `08123456789012` → `INVALID_PHONE` (di luar panjang kebijakan V1).
- [x] `81234567890`, `006281234567890`, `+62081234567890`, `+14155552671`, `02112345678`, `0812.3456.7890`, `081234567890x1`, `++6281234567890`, digit Unicode, kosong → `INVALID_PHONE` masing-masing.
- [x] Raw nomor 65 karakter → `PHONE_TOO_LONG`; tab/newline di tengah → `INVALID_PHONE`; separator 64 karakter dengan digit sah masih tunduk pada pola nomor setelah normalisasi.
- [x] Pesan `""` → URL base tanpa `?text=`.
- [x] Pesan `"Halo dunia"` → base + `?text=Halo%20dunia`.
- [x] Pesan `"A&B + 10%"` → base + `?text=A%26B%20%2B%2010%25`.
- [x] Pesan literal `"%20"` → base + `?text=%2520`; bukan spasi dan bukan `%252520`.
- [x] Pesan `"Halo\r\nDunia\rLagi"` → normalized `"Halo\nDunia\nLagi"`, URL base + `?text=Halo%0ADunia%0ALagi`.
- [x] Pesan `"Hai 👋"` → base + `?text=Hai%20%F0%9F%91%8B`; pesan `" "` → base + `?text=%20`.
- [x] Pesan `"<b>Halo</b>"` → base + `?text=%3Cb%3EHalo%3C%2Fb%3E`; preview menampilkan teks literal, tanpa elemen `<b>`.
- [x] `"a".repeat(500)` diterima; 501 → `MESSAGE_TOO_LONG`. `"😀".repeat(500)` diterima, count 500, UTF-8 2000 byte, URL base + `?text=` + `"%F0%9F%98%80".repeat(500)`; 501 → `MESSAGE_TOO_LONG`.
- [x] Lone surrogate `"\uD800"`, NUL `"\u0000"`, DEL `"\u007F"` → `INVALID_MESSAGE`; tab `"A\tB"` diterima dengan `?text=A%09B`.
- [x] Hasil valid lalu input diubah/clear/error: href lama hilang, copy dan buka tidak dapat dipakai; klik `Buat link` tidak melakukan request atau membuka tab eksternal.

## Acceptance dan bukti

- [ ] Runner `/tests/everyday/link-whatsapp.html` via HTTP lulus 25/25 tanpa membuka chat; console bersih dan refresh belum diverifikasi. Direct route `/link-whatsapp/` serta contoh membangun nomor +6281234567890 dan pratinjau telah diperiksa.
- [ ] Runner mencakup 320/390/768/1440, karakter/emoji/newline, counter, contoh/clear, clipboard berhasil/ditolak, error dan stale href. Keyboard manual, refresh, no-JS, console, dan panel Network belum diperiksa.
- [ ] Atribut aksi dan URL diperiksa oleh runner tanpa klik eksternal; panel Network belum diperiksa. Tidak membuka nomor contoh atau mengirim pesan.
- [x] HTML awal memuat pengantar, langkah, contoh, FAQ, metadata dan kebijakan privasi yang sesuai pengecualian eksternal. Tidak mengklaim seluruh alur selalu lokal setelah tombol buka.
- [x] `git diff --check` lulus; catat file, fixture lulus/gagal, QA aktual, pembatasan nomor/pesan, dan kebutuhan integrasi. Tidak commit, push, atau deploy.

## Bukti eksekusi

Runner browser via HTTP: **25/25 lulus**. Root memverifikasi direct route dan contoh yang membentuk `+6281234567890` dengan pratinjau pesan. Tautan WhatsApp eksternal tidak diklik. `node --check` lulus untuk logic, UI, dan test; `git diff --check` lulus. Pemeriksaan console, no-JS, refresh, keyboard manual, dan panel Network belum dilakukan. Normalisasi mengikuti kebijakan format input V1; tool tidak mengonfirmasi alokasi operator atau akun aktif.

## Prompt eksekusi mandiri

```text
Implementasikan hanya docs/everyday-tools/08-link-whatsapp.md.
Baca instruksi repository, docs/everyday-tools/README.md, CONTRACT.md, dan 00-foundation.md. Pastikan foundation selesai.
Gunakan GPT-6 Luna reasoning high yang dipilih di pengaturan chat; UI Indonesia lang=id. Hanya HTML CSS JavaScript vanilla statis GitHub Pages, tanpa npm/compiler/build/CDN/backend.
Ikuti normalisasi seluler Indonesia, encode pesan tepat sekali, batas Unicode, link wa.me tetap, dan pengecualian privasi saat pengguna membuka link. Jangan auto-open, mengirim pesan, mengecek akun, atau mengubah shared files.
Jalankan runner browser-native, QA browser tanpa membuka nomor contoh, dan git diff --check; catat bukti aktual. Jika fixture penting gagal sesudah satu perbaikan terarah, isolasi reproduksi minimal dan lanjutkan per langkah kecil dengan Luna yang sama, tanpa melonggarkan tes.
Jangan mengerjakan task lain, commit, push, atau deploy. Laporkan kebutuhan integrasi dan verifikasi yang belum dilakukan.
```
