# 10 — Kompres Gambar

Status: **sebagian — implementasi dan runner lulus; verifikasi manual browser masih terbuka**. Model: **GPT-6 Luna · high** setelah 00 dan fase I00a lulus. Bila fixture masih gagal setelah satu perbaikan terarah, pecah reproduksi minimal menjadi langkah lebih kecil dengan GPT-6 Luna yang sama.
Route `/kompres-gambar/`; canonical `https://edwinlab.dev/kompres-gambar/`.

## Tujuan dan batas V1

Mengecilkan ukuran file satu foto melalui pengaturan kualitas JPEG/WebP, dengan dimensi piksel tetap. Input JPEG/PNG. Tidak batch, input WebP/HEIC/SVG/GIF, target ukuran pasti200KB, resize, crop, atau klaim hasil selalu lebih kecil/tanpa perubahan kualitas. PNG transparan yang diekspor JPEG memakai latar putih dengan penjelasan terlihat.

- [x] Baca README/CONTRACT/00 dan fase I00a. Miliki hanya `kompres-gambar/index.html`, `logic.js`, `tool.js`, CSS lokal opsional, `tests/everyday/kompres-gambar.html` dan `.test.js`, task/checklist dan baris tracker10.
- [x] Shared `/everyday/shared/image.js`, `downloadBlob`, CSS/status lama read-only; vendor/helper tidak diduplikasi. HTML/CSS/JS langsung melalui HTTP tanpa build/compiler/npm/CDN/backend.

## Algoritme, batas, dan UX

- [x] Pilih satu file lewat input `accept="image/jpeg,image/png"`; validasi isi memakai shared, bukan extension. Maksimum10MiB,12juta piksel dan8192px per sisi; tampilkan batas sebelum pilih. Label tipe file dan dimensi berasal hasil decode berorientasi benar.
- [x] Format output JPEG(default)/WebP, kualitas integer60–95 default80. Slider dengan nilai terlihat dan label, bukan input ambigu0..1; shared menerimaquality/100. Dimensi output tepat dimensi bitmap. Tidak encode ulang pada setiap gerakan slider; tombol `Kompres gambar` eksplisit.
- [x] Pure fungsi `summarizeBytes(originalBytes,resultBytes) -> {deltaBytes,savedPercent,isSmaller}`; `deltaBytes=original-result`, `savedPercent=100*delta/original`, `isSmaller=result<original`. Input size integer positif; pembulatan tampilan1desimal. Jangan menyebut hemat bila delta<=0. Tampilkan byte tepat bersama KiB/MiB dengan label basis1024.
- [x] Ukuran file bukan dimensi: hasil utama byte awal/akhir, perubahan persen, dimensi; dua preview berlabel asli/hasil. Jika lebih besar, pesan `Hasil lebih besar dari file asli. Coba kualitas lebih rendah atau gunakan file asli.` Unduh hasil tetap boleh; tidak diam-diam mengunduh original sebagai hasil kompresi.
- [x] Native encoder dapat memberi ukuran berbeda antar browser; jangan expected byte count exact untuk fixture lossy. Check MIME hasil WebP; bila unsupported, error dan instruksi pilihJPEG, tidak fallbackPNG berextensionwebp.
- [x] Tombol `Kompres gambar`, `Gunakan contoh` (fixture sintetis lokal kecil), `Bersihkan`, `Unduh hasil`. Download fixed basename `gambar-kompres.jpg` atau `.webp`; output<=20MiB, Blob sukses saja. Contoh harus milik task atau reuse fixturepublik kecil lokal dengan provenance, jangan menautkan seluruh direktori tes ke UI publik.
- [x] Ubah file/kualitas/format menghapus hasil dan statuslama, unduhdisabled; single nativejob+requestID sesuai00a. Bersihkan melepaskan previewURL/bitmap/Blob dan mereset opsi, fokusfileinput. Pending nativejob boleh selesai tetapi hasilnya dibuang; jangan mengklaim cancel menghentikan enginebrowser.
- [x] Render nama file textContent; preview objectURL lokal, cleanup saatdiganti/unload. Encode foto baru membuat file baru, tidak menjanjikan seluruh metadata/profilwarna tetap sama atau dihapus forensik. Tidak upload/URLinput/storage/analyticsfile.

## Fixture dan QA

- [x] Ringkasan100000→60000byte = delta40000,40%,smallertrue;100000→100000=0%,false;100000→110000=-10%,false. Tolak ukuran0/negatif/noninteger pada purefunction.
- [x] JPEG1200x800 tetap1200x800 dengan outputJPEG; PNG transparan keJPEG menunjukkan latarputih; PNG keWebP menjagaalpha bila encoder tersedia. Toleransi pixelJPEG untuklossy, bukan equality semua pixel.
- [ ] EXIForientation6 darifixturefoundation menampilkan orientasi dan dimensi yang benar persis sekali. Hasil fileunduhan diverifikasi ulang dengandecoderbrowser. (Orientasi dan dimensi sudah diuji; hasil unduhan belum dibaca ulang secara manual.)
- [x] Kualitas60/95 diterima,59/96/80.5/nonnumberditolak; tepatinputcapditerima olehvalidatorbatas,cap+1ditolak sebelumdecode. Invalidheader/APNG/formatlain/bukanfile ditolak olehshared.
- [x] WebPunsupported, toBlobnull, outputovercapdiinjeksikan untukverifikasierror dan no-download; PNGsederhana yang menghasilkanJPEGlebihbesar menunjukkanpesanlebihbesar.
- [x] Gantifile/reset/editopsisaatjobaktif tidakmempublikasikanhasil lama; tidakterjadi duadecodeaktif; clipboardtidakdibutuhkan. Nama`<img...>.png` tetapteks.
- [ ] QA320/390/768/1440px, keyboard, inputfilemobile, directroute/refresh, preview/unduhasli, console/Network tanpa upload. (Runner 4 ukuran lulus; direct route dan contoh PNG→JPEG diverifikasi manual. Keyboard, inputfile mobile, refresh, console, dan Network belum diverifikasi.)

## SEO dan konten statis

- [x] Title `Kompres Gambar JPG dan PNG Online | Edwin Lab`; H1 `Kompres Gambar`; description `Kompres gambar JPG atau PNG menjadi JPEG atau WebP. Atur kualitas, bandingkan ukuran file, dan unduh hasil dengan pemrosesan lokal di browser.`
- [x] Intent `kompres gambar online`, `kompres jpg`, `perkecil ukuran foto`. **Jangan** memasang title/landing `kompres200KB` atau `kompresPNG lossless` karena V1 tidak melakukannya.
- [x] Artikel menjelaskan langkah, beda ukuranfile/piksel, kualitaslossy, PNGalpha→JPEGputih, kemungkinanhasil lebihbesar, batas/tipe, dan FAQ unggah/format/targetukuran. Contoh ukuran adalah aritmetika100000→60000byte, bukan janji hasil semua foto.
- [x] Canonical, OG, logo, noscript, relatedkandidat11/12 hanya setelahsiap, mengikutiCONTRACT.

## Selesai dan prompt

- [x] Catat fixturepass/fail, browser/format, QA/unduh, file, `git diff --check`. Updatechecklist/tracker10hanyadenganbukti; jangancommit/push/deploy. IAB runner: 26/26 lulus; browser dapat membuat JPEG lokal dan menampilkan ukuran nyata 961→1947 byte beserta peringatan hasil lebih besar. Direct route dan contoh PNG 160×120 diverifikasi. CUA tidak menyediakan bukti console, dan QA keyboard, no-JS, refresh, inputfile mobile, Network, serta pembacaan ulang file unduhan masih tertunda.

```text
Kerjakan hanya docs/everyday-tools/10-kompres-gambar.md. Baca README/CONTRACT dan pastikan00 serta00a faseI sudah lulus. Reuse image.js read-only; jangan membuat decoder/helper baru. Buat app statis JPEG/PNG input, JPEG/WebP output, kualitas60–95 tanpa resize/batch/targetKB. Terapkan batas, MIME check, alpha, orientasi, invalidasi job dan download sesuai task. Jalankan fixture/QA browser termasuk hasil yang lebih besar dan stalejob. Update checklist dan baris tracker10 berdasarkan bukti. Jangan ubah shared/homepage/hub/sitemap/tools lain atau commit/push/deploy; tanpa npm/build/backend/CDN.
```
