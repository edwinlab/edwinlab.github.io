# 09 — Pembuat QR Code

Status: **implementasi selesai; QA sebagian**. Runner browser lulus 19/19 dan route menampilkan QR serta tombol unduh. File hasil unduhan belum dapat diuji manual karena event download CUA timeout; refresh, keyboard manual, console, no-JS, dan panel Network masih pending. Model: **GPT-6 Luna · high**.
Route `/pembuat-qr-code/`; canonical `https://edwinlab.dev/pembuat-qr-code/`.

## Tujuan, scope, dan kepemilikan

QR statis untuk URL atau teks, diproses lokal, dapat diunduh PNG. Berguna untuk poster, profil, dan alamat halaman usaha. Tidak ada QR dinamis/tracking, unggah logo, styling warna, Wi-Fi, pembayaran, pemendek URL, atau pemindaian QR dalam V1.

- [x] Baca README, CONTRACT, 00, dan **hanya fase Q** 00a beserta provenance/API aktual. Semua source HTML/CSS/JS langsung jalan melalui HTTP/GitHub Pages, tanpa build/npm/CDN.
- [x] Miliki hanya `pembuat-qr-code/index.html`, `logic.js`, `tool.js`, CSS lokal bila perlu, `tests/everyday/pembuat-qr-code.html` dan `.test.js`, checklist task ini dan baris tracker09. Shared/vendor/hub/homepage/sitemap tidak diubah.
- [x] Gunakan `makeQrMatrix` dari `/everyday/shared/qr.js`, CSS/`setStatus` lama, `downloadBlob` baru. Decoder tes lokal hanya dimuat runner, tidak halaman tool.

## Algoritme dan UI

- [x] Dua mode `Tautan website` (default) dan `Teks`. Tautan: trim ASCII tepi, wajib `http:`/`https:` dan hostname nonkosong setelah validasi `new URL`; tolak username/password. Gunakan string hasil trim **sebagai payload persis**, jangan serialisasi URL lalu mengubah encoding pengguna. Tidak fetch tautan. Teks: pertahankan newline/spasi, tolak kosong/all-whitespace.
- [x] Tolak lone surrogate sebelum TextEncoder. Maksimum **1000 byte UTF-8**, tepat batas sah. Jelaskan batas byte berbeda dari karakter. Render hasil 1 QR, auto version, ECC M lewat shared; tidak mengimplementasikan encoder sendiri.
- [x] Pure `validatePayload(raw,mode) -> string`; `getQrLayout(moduleCount) -> {modulePixels,quietModules,size}`: `quietModules=4`, `modulePixels=max(2,floor(768/(moduleCount+8)))`, `size=(moduleCount+8)*modulePixels`. Module count valid dari matrix; setiap sel dicat persegi integer, background putih, foreground hitam. PNG natural size tidak distorsi; CSS `max-width:100%;height:auto` untuk preview.
- [x] Canvas memiliki nama aksesibel, payload readonly sebagai alternatif teks. UI textarea berlabel, radio mode, tombol `Buat QR`, `Isi contoh`, `Bersihkan`, `Unduh PNG`; copy payload opsional di luar V1, bukan perluasan fitur.
- [x] `toBlob('image/png')`, periksa hasil nonnull, MIME PNG dan <=20MiB; hanya hasil sukses terbaru dapat diunduh dengan `qr-code.png`. Edit/reset menghapus preview/Blob lama dan menonaktifkan unduh. Hasil toBlob terlambat tidak mengganti QR baru; satu job aktif.
- [x] Status Indonesia spesifik; feature/API/library hilang menjadi error yang dapat dibaca. Contoh tautan `https://edwinlab.dev/`; contoh teks `Halo dunia!`; clear mengembalikan mode URL dan fokus input. Tidak memasukkan input ke URL situs/storage/log/request.
- [x] Keterangan jujur: file QR statis tidak memiliki masa berlaku bawaan; tautan tujuan dapat berubah/tidak tersedia. Tidak menjamin semua kamera dapat membaca QR padat; anjurkan uji hasil sebelum dicetak.

## Fixture dan QA

- [x] Decode PNG sebenarnya menggunakan jsQR terpin dari00a: `https://edwinlab.dev/`, `https://example.com/?a=1&b=dua%20kata`, `Halo dunia!`, `café`, `Halo 👋`, teks multibaris `Satu\nDua`. Bandingkan byte UTF-8 payload serta data decoder; bukan hanya snapshot matrix.
- [x] Mode URL trim tepi; tolak `javascript:alert(1)`, `ftp://example.com`, URL relatif `/halaman`, credential URL dan URL tanpa host. Mode teks boleh memuat tulisan `javascript:...` sebagai teks literal tanpa mengeksekusi/membuka.
- [x] 1000 ASCII dan 250 emoji diterima dan dapat didecode; 1001 ASCII/251 emoji ditolak. Lone surrogate `\uD800`, empty dan whitespace ditolak.
- [x] Matrix 21 menghasilkan modulePixels26, quiet4, size754; matrix57 menghasilkan modulePixels11, size715. Pixel quiet zone benar-benar putih, modul tidak antialias antar sel; output MIME/name cocok.
- [x] Edit saat encoding, reset dan kegagalan toBlob tidak menyisakan unduh lama; error tidak menghapus input. QR bukan image dari endpoint eksternal.
- [ ] Runner mencakup empat ukuran viewport dan decode PNG aktual melalui jsQR. Direct route membuat pratinjau 759×759 dan mengaktifkan unduh; refresh, keyboard manual, decode file yang diunduh, console, no-JS, Network, dan scan kamera fisik belum diverifikasi.

## SEO dan artikel statis

- [x] `lang=id`; title `Pembuat QR Code Gratis untuk Link dan Teks | Edwin Lab`; H1 `Pembuat QR Code`; description `Buat QR code statis dari link website atau teks dan unduh sebagai PNG. Tanpa akun, dengan pemrosesan langsung di browser.`
- [x] Query intent: `buat qr code gratis`, `qr code link`, `qr code teks`. Tidak menjanjikan QR pembayaran atau dinamis.
- [x] Intro, tiga langkah, contoh link, beda teks/tautan, aturan1000byte, pentingnya ruang putih saat cetak, FAQ `Apakah QR kedaluwarsa?`, `Bisa mengubah tujuan setelah dicetak?` (tidak pada QR statis), `Apakah input diunggah?`.
- [x] Canonical/OG/logo/noscript mengikuti kontrak. Related kandidat08 dan hub `/alat/`, aktif hanya ketika target siap. Jangan memberi backlink otomatis ke URL input.

## Selesai dan prompt

- [x] Catat fixture, browser/QA/decoder, file, batas dan `git diff --check`; tanpa commit/push/deploy.

## Bukti eksekusi

Runner browser via HTTP: **19/19 lulus**, termasuk decode jsQR atas PNG aktual, payload batas 1000 byte, quiet zone/pixel, invalidasi saat toBlob menunggu, MIME, unduhan, dan empat viewport. Root memverifikasi direct route menghasilkan preview 759×759 dan mengaktifkan unduh. CUA event subscription untuk file unduhan timeout, sehingga file hasil unduhan manual belum didecode; pengujian decode dilakukan atas PNG dari canvas preview. Console, no-JS, refresh, keyboard manual, panel Network, dan kamera fisik belum diverifikasi. `node --check` untuk ketiga file JS dan `git diff --check` lulus. SHA-256 vendor qrcode-generator/jsQR lokal cocok dengan provenance TODO 00a; decoder jsQR hanya dimuat runner.

```text
Implementasikan hanya docs/everyday-tools/09-pembuat-qr-code.md. Baca README/CONTRACT, pastikan00 dan00a faseQ telah lulus. Gunakan adapter QR lokal yang sudah disiapkan, jangan mengubah shared/vendor. Buat app dan dua file tes miliknya dengan HTML/CSS/vanilla JS, tanpa npm/build/backend/CDN. Terapkan mode URL/teks, UTF-8 max1000byte, quiet zone4modul, PNG dan invalidasi hasil persis task. Verifikasi PNG memakai decoder independen di runner, lalu QA browser. Update checklist dan baris tracker09 hanya berdasarkan bukti. Jangan mengubah homepage/hub/sitemap/task lain atau commit/push/deploy.
```
