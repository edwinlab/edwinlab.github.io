# 23 — Crop Foto / Potong Gambar

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high, per tahap**.
Route /crop-foto/; canonical https://edwinlab.dev/crop-foto/.

## Scope dan prasyarat

Potong satu JPEG/PNG menggunakan koordinat piksel atau preset crop tengah 1:1,4:3,3:4,16:9. Hasil tidak di-resize; pengguna dapat mengoperasikan semua fungsi melalui field/tombol keyboard. Tidak drag editor, rotasi, background removal, ukuran cetak/DPI, pasfoto resmi, face detection atau batch.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT, helper image/UI dan bukti 00a fase I. Uji native bitmap crop atas decoded image; PDF readiness tidak diperlukan.
- [ ] Miliki crop-foto/index.html, logic.js, tool.js, CSS opsional; tests/everyday/crop-foto.html dan .test.js; task/row23.
- [ ] Pure geometry dalam logic.js; bitmap/DOM di adapter tool.js. Reuse shared inspect/decode/encode/download tanpa menambah opsi crop ke shared.

## Tahap 1 — geometri dan adapter

- [ ] Original dimensions dari bitmap berorientasi, integer positif valid pada cap media. Free rectangle {x,y,width,height}: x,y integer≥0; width,height integer≥1; x+width≤W dan y+height≤H. Tolak di luar bounds sebelum native crop.
- [ ] Field integer ASCII ≤8 karakter, tanpa plus/decimal/eksponen. Posisi dihitung dari kiri atas gambar berorientasi. Default free rectangle seluruh gambar.
- [ ] Preset ratio a:b dalam pasangan primitive: k=floor(min(W/a,H/b)); jika k<1 error; cropW=a×k, cropH=b×k; x=floor((W-cropW)/2), y=floor((H-cropH)/2). Rasio pixel exact, remainder sisi dapat tidak simetris1px.
- [ ] Pilih preset mengisi semua field dan preview overlay. Manual edit salah satu field pindah ke mode Bebas. Mode ini tidak diam-diam mengubah rasio/lebar/tinggi yang diinput.
- [ ] Native crop createImageBitmap(originalBitmap,x,y,width,height,{imageOrientation:'none'}) menghasilkan temporary bitmap dari sumber **yang sudah oriented**. Verifikasi dimensi; unsupported/error → controlled error. Jangan menerapkan EXIF kedua kali.
- [ ] Encode croppedBitmap melalui shared encodeImage dengan width/height crop yang sama. PNG default; JPEG/WebP fixedquality0,9, JPEG putih. Tutup temporary bitmap di finally. Tidak ada scaling pada output.

## Tahap 2 — UI dan lifecycle

- [ ] Picker JPEG/PNG, preset, label X(px)/Y(px)/Lebar(px)/Tinggi(px), original dimensions, crop preview rectangle yang noninteractive, Potong foto, Contoh sintetis, Bersihkan, Batalkan, Unduh.
- [ ] Gambar preview≤512px sisi panjang dengan ratio sumber; overlay memakai proporsi x/W,y/H,w/W,h/H, bukan menganggap CSS pixel sama dengan source pixel. Field numeric tetap sumber kebenaran.
- [ ] Input cap10MiB/12juta pixel/8192sisi, output≤20MiB; file helper menolak animasi/rusak/format unsupported. Crop tidak mengurangi requirement validasi sumber sebelum decode.
- [ ] Satu job native; snapshot rectangle/format/file, controls dibekukan saat bekerja. Clear/cancel invalidates current ID/output; native promise boleh settle kemudian dan resource dilepas. Job baru menunggu cleanup job lama, tidak bertumpuk.
- [ ] Original bitmap dijaga selama job memakai referensinya dan baru ditutup setelah replace/clear aman. Semua URL/canvas/temp bitmap di-cleanup. Output stale tidak enable download; error menjaga sumber/rectangle.
- [ ] Download crop.png/crop.jpg/crop.webp via shared helper, MIME/suffix tepat. Filename/usertext tidak interpolasi HTML. Perubahan geometry/target menghapus hasil lama sebelum user ekspor.

## Tahap 3 — fixture dan QA wajib

- [ ] W1200,H800: 1:1→{x200,y0,w800,h800}; 3:4→{x300,y0,w600,h800};16:9→{x0,y62,w1200,h675};4:3→{x68,y1,w1064,h798}.
- [ ] Full free rect valid; x=W-1,y=H-1,w1,h1 valid; negative/zero/noninteger/overflow dimensi ditolak. 1×1 dengan preset16:9 error, tidak output0pixel.
- [ ] Pure presets tidak mengubah source; exact ratio dan source bounds invariant. Odd remainder dijelaskan, tidak mengubah expected demi tampilan.
- [ ] Synthetic4×4 colored quadrants: free crop{x2,y0,w2,h2} menghasilkan top-right quadrant dengan dimensi2×2. Decode BlobPNG dan cek sample RGBA, bukan CSS preview saja.
- [ ] EXIF6 crop memakai posisi visual yang benar; alphaPNG terjaga/JPEGwhite, nativeWebP MIME detection, no upscale. Unsupported crop/decode/encode/null/toBlob wrongMIME/outputcap memberi error.
- [ ] Request stale/cancel/clear/replace/double-click diuji dengan delayed native adapter; temporary/originalbitmap dan objectURL dilepas dengan lifecycle benar.
- [ ] Browser QA kontrak, keyboard numeric/preset, long skinny source dan320px preview, direct+refresh, native download reopened, no-JS/static guide dan Network tanpa upload.

## Konten, SEO, dan selesai

- [ ] Title "Crop Foto Online — Potong JPG dan PNG | Edwin Lab"; H1 "Crop Foto".
- [ ] Description "Potong foto JPG atau PNG dengan koordinat piksel atau rasio tengah. Lihat area potong, pilih format, dan unduh hasil di browser."
- [ ] HTML awal cara pilih crop/preset/coordinates, contoh1200×800→800×800, beda crop/resize, pixel ratio/presisi, format/alpha dan bounds. FAQ "Apakah foto di-resize?", "Bisa pasfoto resmi?", "Mengapa preset menyisakan piksel?", "Apakah foto diunggah?".
- [ ] Metadata/noscript/breadcrumb kontrak; related ubah-ukuran-foto/kompres-gambar/hub. Konversi format oleh task24 setelah siap.
- [ ] Catat fixture artifacts/orientation/browser/limits; update task/row23 sendiri. Status partial sampai tahap1–3 terbukti.

Sumber API: [CreateImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) mendukung source rectangle dan ImageBitmap. Pengaturan orientasi/crop dan cleanup harus diverifikasi atas browser nyata.

~~~text
Kerjakan hanya tahap <1 geometry+adapter / 2 UI / 3 QA> pada
docs/everyday-tools/23-crop-foto.md dengan Luna high.
Baca kontrak dan helper media aktual; verify 00a-I/crop API, bukan PDF phase.
Numeric crop source pixels+center presets exact primitive ratios, bitmap oriented,
native crop lalu shared encode same dimensions; one job/caps/cleanup/stale sesuai task.
Tanpa drag editor/pasfoto/resize/newvendor. HTML/CSS/JS statis, UI/SEO Indonesia.
Jalankan fixture geometry/pixel/orientation/native exports dan QA yang relevan.
Update task/row23 sesuai proof, partial bila pending; jangan ubah shared/hub/sitemap
tool lain atau commit/push/deploy.
~~~
