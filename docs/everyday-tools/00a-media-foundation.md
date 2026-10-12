# 00a — Fondasi QR, gambar, dan PDF

Status: **sebagian selesai**. Eksekusi 12 Oktober 2026 dengan **GPT-6 Luna · high**: Q dan I lulus runner browser; P lulus worker, ekspor, parse ulang, dan terminate, tetapi render visual PDF belum dapat diverifikasi karena PDF viewer IAB menampilkan `about:blank`. Jangan tandai 00a/P selesai sebelum fixture PDF terbuka di viewer yang merender halaman. Task 09 dan 10/11 dapat lanjut pada fondasi Q/I; QA visual PDF task12 tetap terbuka.

## Kepemilikan dan dependency

- [x] Baca README/CONTRACT; miliki `/everyday/shared/qr.js`, `image.js`, `/everyday/vendor/`, `/tests/everyday/vendor/` (decoder QR hanya untuk tes), `/tests/everyday/media-foundation.worker.js` (worker smoke test PDF), fixture media, dan runner media-foundation HTML/JS. Tidak membuat app/hub.
- [x] Semua library adalah **JavaScript siap browser** yang disimpan lokal dengan versi tepat, lisensi, URL package versi, SHA-256 distribusi aktual, serta perubahan path yang dicatat di `everyday/vendor/README.md`. Tidak ada runtime CDN atau npm install; arsip registry cocok dengan identitas dan integrity metadata.
- [x] Versi terverifikasi: `qrcode-generator 2.0.4`, `jsQR 1.4.0` (decoder **hanya tes**), `pdf-lib 1.17.1` UMD. Nama file distribusi/API diperiksa dari package yang benar-benar diunduh.
- [x] Vendor publik hanya ada di `/everyday/vendor/`; decoder jsQR ada di `/tests/everyday/vendor/`. Tes memakai gambar sintetis lokal tanpa data pribadi.

## Fase Q — QR untuk task 09

- [x] Adapter ES module `makeQrMatrix(text) -> boolean[][]` memanggil distribusi lokal qrcode-generator: tipe 0 auto, koreksi M, Byte mode. Set `stringToBytes` ke UTF-8 menggunakan TextEncoder; reject lone surrogate dahulu agar payload tidak berubah menjadi replacement character. Maksimum 1000 byte UTF-8; input kosong/all-whitespace invalid, string lain dipertahankan.
- [x] Kode `INVALID_QR_TEXT`, `INPUT_TOO_LARGE`, `QR_UNAVAILABLE`; tidak ada HTML dari library. Matrix persegi dan semua sel boolean; task 09 menggambar matrix sendiri.
- [x] Decoder independen jsQR membaca PNG hasil-render: `Halo`, `https://edwinlab.dev/`, `kopi & teh`, `café`, `Halo 👋`, 1000 ASCII, 250 emoji (1000 byte), serta teks multibaris. `binaryData` dibandingkan byte UTF-8 dan `data` diperiksa.
- [x] Menolak 1001 byte, lone surrogate, kosong dan whitespace. Kode runner hanya memuat script lokal; source adapter tidak melakukan fetch atau request payload.

## Fase I — Gambar untuk task 10–12

V1 **input JPEG dan PNG saja**; bukan WebP input, SVG, GIF, HEIC atau format animasi. Output JPEG/PNG, dan WebP hanya bila encoder browser menghasilkannya. Pembatasan ini menekan kompleksitas decoder; copy/accept/filetype harus konsisten.

- [x] Batas shared: `MAX_IMAGE_BYTES=10*1024*1024`, `MAX_IMAGE_PIXELS=12000000`, `MAX_IMAGE_SIDE=8192`, `MAX_MEDIA_OUTPUT_BYTES=20*1024*1024`. Ini batas aplikasi, bukan jaminan batas peak memory browser.
- [x] `inspectImage(file) -> Promise<{mime,width,height,orientation}>`: cek ukuran dahulu; signature JPEG/PNG dan header dimensi, tidak percaya extension/MIME browser. Baca paling banyak **64 KiB**. PNG memvalidasi signature/IHDR/chunk bounds dan mencari `acTL` sebelum IDAT; JPEG memvalidasi SOI/marker/segment bounds, SOF dan APP2 MPF. Header yang tidak lengkap dalam 64 KiB ditolak. Ini bukan validasi seluruh stream/piksel; kerusakan setelah header diserahkan ke native decoder. Dimensi dicek sebelum dan sesudah decode. Tidak menulis parser penuh.
- [x] `decodeImage(file) -> Promise<{bitmap,width,height,mime}>`: gunakan `createImageBitmap(...,{imageOrientation:'from-image'})`, cocokkan ukuran hasil dengan orientasi EXIF yang dibaca dari header, dan beri error jika browser tidak menerapkan orientasi dengan benar. Caller menutup bitmap.
- [x] `encodeImage(bitmap,{width,height,mime,quality=0.8,background='#ffffff'}) -> Promise<Blob>`: batas dimensi, canvas 2D, smoothing, JPEG latar putih, PNG/WebP alpha, async `toBlob`, tolak Blob kosong/null, MIME berbeda dan output di atas 20 MiB, lalu lepaskan backing store.
- [x] Kode error media yang direncanakan tersedia. Pilihan MIME WebP gagal jelas bila browser mengembalikan format fallback.
- [ ] Request ID, invalidasi hasil lama, object URL preview, dan batas satu job mengikat lifecycle UI tool. Uji saat task 10–12 karena helper 00a tidak membuat UI aplikasi.
- [x] I1: fixture signature/offset/header/chunk bounds, APNG, JPEG-MPF, scan 64 KiB, ukuran tepat10MiB/cap+1, piksel tepat12juta/cap+1, sisi8192/cap+1, dan kerusakan sesudah header yang harus ditolak native decoder.
- [x] I2: fixture decode/encode JPEG/PNG, EXIF orientation6, alpha PNG, flatten putih JPEG, WebP dengan validasi MIME/alpha bila encoder tersedia, unsupported/fallback, dan `toBlob` null.
- [x] I3 shared-helper: output cap dan cleanup canvas diuji; bitmap selalu ditutup pemanggil. Responsif, stale job, object URL, serta cancel native tidak bisa dibuktikan sebelum halaman tools 10–12 ada; checklist lifecycle ada pada task masing-masing. Browser runner lulus. Console tidak ditandai bersih tanpa inspeksi console.
- [x] Bukti/API fase I dicatat; task 10/11 dapat memakai I, task 12 dapat memakai I sambil menunggu verifikasi visual P.

## Fase P — Distribusi PDF untuk task 12

- [x] Simpan UMD pdf-lib lokal; verifikasi API `PDFDocument.create`, `embedJpg`, `addPage`, `drawImage`, `save`, dan parse ulang `PDFDocument.load` pada **classic worker** `importScripts` lokal. Tidak font/webasset eksternal.
- [x] Smoke satu JPEG sintetis jadi PDF A4 satu halaman, parse ulang jumlah halaman dan MediaBox lulus. PDF raster tidak memiliki OCR/teks selectable.
- [ ] Verifikasi tampilan satu halaman lewat viewer visual. Fixture tersedia untuk diunduh dari runner, tetapi PDF viewer IAB hanya menampilkan `about:blank`; buka file unduhan di viewer yang merender halaman sebelum menandai P selesai.
- [x] Worker test berhasil di-terminate dan hasil terlambat tidak dipakai. Implementasi queue/progress/PDF app tetap milik12.

## Checklist selesai dan prompt

- [x] Fase Q selesai dengan fixture decoder dan provenance.
- [x] Fase I shared-helper selesai dengan fixture bitmap, batas, orientasi, dan cleanup backing canvas. Lifecycle UI diuji per halaman tools.
- [ ] Fase P selesai dengan worker dan **render PDF terverifikasi di viewer visual**.
- [x] Catat versi browser sebagai Codex IAB (versi mesin tidak ditampilkan), file, hasil runner, batas, dan `git diff --check`. Network yang terlihat hanya request localhost untuk HTML/CSS/helper/vendor lokal; source helper tidak melakukan fetch. Console visual tidak tersedia/tercatat, sehingga tidak diklaim bersih. Task lain tidak diubah.

Jalankan pekerjaan kecil secara berurutan dalam satu TODO ini. Selesaikan Q sebelum app 09, I1–I3 sebelum apps 10/11, dan P sebelum app 12; tandai tiap fase berdasarkan buktinya, sementara status keseluruhan tetap sebagian selesai sampai P visual lulus.

```text
Kerjakan docs/everyday-tools/00a-media-foundation.md dalam urutan Q, I1, I2, I3, lalu P menggunakan GPT-6 Luna high. Baca README/CONTRACT. Simpan library browser lokal dengan versi/lisensi/checksum, tanpa npm/build/CDN. Buat QR adapter dan validasi decoder independen; image adapter dengan batas header eksplisit, decoder browser, orientasi/alpha/lifecycle; serta worker tes PDF. Jangan membuat app 09–12 atau mengubah tools lama. Jalankan fixture dan browser QA tiap fase, catat bukti serta update checklist/tracker per fase yang sudah terverifikasi. Jangan menandai P selesai tanpa render visual. Jangan commit/push/deploy.
```

## Catatan eksekusi

- 12 Oktober 2026 · GPT-6 Luna high. Arsip tepat diunduh dari registry npm; SHA-1 dicocokkan dengan metadata registry dan SHA-256 hasil distribusi dicatat pada [vendor README](../../everyday/vendor/README.md). Tidak ada CDN/npm/build.
- Q dan I runner browser lulus; cakupan mencakup decoding QR jsQR, header dan orientasi gambar, alpha, output cap, dan cleanup canvas. P worker menghasilkan PDF, memuat ulang, memeriksa 1 halaman/A4, dan terminate berhasil. Runner final **20/20** lulus di Codex IAB. Frame PDF IAB tetap `about:blank`; saya memverifikasi PDF A4 satu halaman dari pola worker di Preview, tetapi proses Preview terinterupsi sebelum area gambar bisa diperiksa. Karena render PDF hasil worker belum terbukti secara visual, P tetap unchecked dan tracker tetap parsial.
- `node --check` untuk modul/runner/worker serta `git diff --check` lulus. Tidak ada app 09–12 yang dibuat.

Sumber API: [qrcode-generator package 2.0.4](https://registry.npmjs.org/qrcode-generator/2.0.4), [jsQR package 1.4.0](https://registry.npmjs.org/jsqr/1.4.0), [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap), [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob), [pdf-lib](https://pdf-lib.js.org/), [release pdf-lib 1.17.1](https://github.com/Hopding/pdf-lib/releases/tag/v1.17.1).
