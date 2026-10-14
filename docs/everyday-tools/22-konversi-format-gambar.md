# 22 — Konversi Format Gambar

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high, per tahap**.
Route /konversi-format-gambar/; canonical https://edwinlab.dev/konversi-format-gambar/.

## Scope dan prasyarat

Ubah satu JPEG/PNG statis menjadi PNG, JPEG atau WebP dengan dimensi berorientasi yang sama. Fokus memilih format dan memahami transparansi, bukan target ukuran file atau mengubah dimensi. Tidak WebP/HEIC/GIF/SVG input, animasi, batch, URL import, crop, peningkatan resolusi atau targetKB.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT, source image/UI aktual dan bukti 00a fase I. Critical inspect/decode/encode/orientation/MIME fixtures harus lulus; fase PDF 00a/P tidak diperlukan.
- [ ] Miliki konversi-format-gambar/index.html, logic.js, tool.js, CSS opsional; tests/everyday/konversi-format-gambar.html dan .test.js; task/row22. Tidak mengubah shared media/vendor atau kompres-gambar.
- [ ] Reuse decodeImage(file) dan encodeImage(bitmap, {width,height,mime,quality,background}) sesuai API aktual. Tidak perlu library/worker baru.

## Tahap 1 — adapter dan fixture media

- [ ] Input satu JPEG/PNG≤10MiB/12juta piksel/8192px per sisi melalui helper. Validasi signature/headers; APNG/rusak/unsupported tetap ditolak meski filename extension tampak benar.
- [ ] Decode memperoleh bitmap,width,height,mime; bitmap sudah berorientasi EXIF. Output width/height sama dengan hasil decode, tidak resize atau rotate manual.
- [ ] Target PNG default, JPEG/WebP alternatif; quality tetap0,9 untuk JPEG/WebP, PNG tanpa slider. JPEG background putih; PNG/WebP mempertahankan transparansi jika encode berhasil.
- [ ] Output≤20MiB. MIME Blob harus tepat target, null/error/fallbackPNG→error tanpa unduhan berextension palsu. Helper sudah memeriksa ini; task menguji jalurnya.
- [ ] Konversi ke format sumber yang sama tetap re-encode; metadata/encoding/warna dapat berubah. Tidak klaim lossless pixel umum, semua metadata hilang, file pasti lebih kecil, atau hasil memenuhi persyaratan instansi.
- [ ] Fixture PNG/JPEG ke setiap target memakai API native; buka ulang hasil dengan createImageBitmap untuk memeriksa MIME/dimensi. **Jangan memakai decodeImage untuk output WebP**, karena shared input classifier hanya JPEG/PNG.

## Tahap 2 — UI dan lifecycle

- [ ] Picker single JPEG/PNG, target selector, Konversi, Contoh sintetis lokal, Bersihkan, Batalkan, Unduh gambar. Tampilkan input/output dimensi, bytes, format dan preview bounded. Nama output tetap gambar.png/gambar.jpg/gambar.webp melalui downloadBlob.
- [ ] Satu native job aktif; format/file dibekukan selama encoding. ID/snapshot menghindari respons stale. Cancel/clear menginvalidasi output seketika, tetapi tidak berpura-pura bisa menghentikan native promise; job berikutnya dimulai hanya setelah job lama settle/cleanup.
- [ ] Cancel menjaga input sah; clear menghapus input dan previews. Bitmap yang dipakai job tidak ditutup sebelum job selesai. Bitmap/URL hasil lama, temporary preview canvas, dan detached late results dibersihkan saat replace/clear/finally.
- [ ] Download disabled sebelum hasil current sukses; target/input berubah menghapus output. Decode/encode failure mempertahankan file input dan error Indonesia. Nama file textContent, bukan HTML.
- [ ] Preview display bounded≤512px sisi panjang; tidak membuat beberapa canvas full12Mpixel sekaligus. Jangan memproses file saat tiap change quality karena slider tidak tersedia.

## Tahap 3 — fixture dan QA wajib

- [ ] JPEG→PNG dan PNG→JPEG/WebP/PNG menghasilkan dimensi sama dengan oriented bitmap; EXIF6 tidak double rotate, expected visual orientation benar.
- [ ] Synthetic transparent PNG tetap transparan pada PNG; JPEG transparansi→putih (toleransi lossy), output WebP feature-detected. PNG colors diuji pada synthetic source, bukan klaim warna semua foto exact.
- [ ] Exact file/pixel/side/output limits dan cap+1, wrong extension/signature, APNG, empty/rusak, decode rejection, toBlob null/throw/wrongMIME memberi error dan download disabled.
- [ ] Native output dibuka ulang, filename/MIME/suffix dan Blob download dispatch cocok. Unsupported WebP error tidak menghasilkan PNG berlabelWebP.
- [ ] Controlled deferred job: clear/cancel saat decode/encode, completion lama setelah option reset, replace sesudah settle, double-click; tidak stale download/leak/multiple jobs.
- [ ] QA kontrak: picker/example/download aktual bila tersedia, keyboard, 320/390/768/1440px, direct+refresh, no-JS guide, console/Network tanpa upload. Catat unavailable tests, jangan mengarang hasil.

## Konten, SEO, dan selesai

- [ ] Title "Konversi JPG, PNG dan WebP Online | Edwin Lab"; H1 "Konversi Format Gambar".
- [ ] Description "Ubah gambar JPG atau PNG menjadi PNG, JPG, atau WebP di browser. Pertahankan dimensi dan lihat perbedaan format serta transparansi."
- [ ] HTML awal menjelaskan inputJPEG/PNG, output3format, PNGalpha/JPEGwhite, same dimensions, fixed quality/re-encode dan ukuran dapat bertambah. FAQ "Bisa memasukkan WebP?", "Apakah resolusi berubah?", "Mengapa ukuran bertambah?", "Apakah gambar diunggah?".
- [ ] Metadata/noscript/breadcrumb kontrak; related kompres-gambar/ubah-ukuran-foto/hub. Crop foto hanya oleh task24 jika siap.
- [ ] Catat tahap selesai, source APIs, fixtures/browser/output artifacts dan limitations. Checklist/row22 selesai hanya jika semua tahap lulus, partial bila QA pending.

Sumber API: [Canvas.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) menjelaskan ekspor format/quality dan fallback; tool harus memeriksa MIME yang benar-benar dihasilkan.

~~~text
Kerjakan hanya tahap <1 adapter+fixtures / 2 UI / 3 QA> pada
docs/everyday-tools/22-konversi-format-gambar.md dengan Luna high.
Baca kontrak, source image/UI dan bukti 00a-I; PDF readiness tidak diperlukan.
Input single JPEG/PNG, encode PNG/JPEG/WebP dengan dimensi oriented yang sama,
fixed quality0.9, JPEG white, caps/MIME/native lifecycle sesuai task.
Tanpa resize/crop/batch/targetKB/dependency baru. HTML/CSS/JS statis, SEO Indonesia.
Jalankan tes tahap relevan, catat partial sampai semua lulus; update task/row22.
Jangan ubah shared/vendor/tool lain/hub/sitemap atau commit/push/deploy.
~~~
