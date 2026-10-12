# 11 — Ubah Ukuran Foto

Status: **sebagian — implementasi dan runner lulus; verifikasi manual browser masih terbuka**. Model: **GPT-6 Luna · high**; prasyarat00 dan00a faseI. Eskalasi keGPT-6 Luna high hanya bila fixture penting belum lulus setelah satu perbaikan terarah.
Route `/ubah-ukuran-foto/`; canonical `https://edwinlab.dev/ubah-ukuran-foto/`.

## Scope dan kepemilikan

Perkecil dimensi satu JPEG/PNG dengan rasio aspek terkunci, berdasarkan lebar, tinggi, atau persen. EksporPNG/JPEG/WebP. Bukan crop/pasfoto resmi, ukuran cetakcm/DPI, backgroundremoval, upscaling, batch, atau targetKB.

- [x] Baca README/CONTRACT,00, faseI00a dan APIaktual. Miliki `ubah-ukuran-foto/index.html`, `logic.js`, `tool.js`, CSSlokal bila perlu, `tests/everyday/ubah-ukuran-foto.html`/`.test.js`, checklist/task dan baristracker11 saja.
- [x] Gunakan sharedimage dan downloadBlob serta CSS/status lama; jangan ubah shared/vendor/homepage/hub/sitemap atau tool lain. Hanya HTML/CSS/JS statis tanpa build/npm/CDN/backend.

## Perhitungan dan UI

- [x] Input JPEG/PNG melalui shared00a: max10MiB/12juta piksel/8192pxpersisi. Foto EXIF memakai dimensi bitmap yang sudah berorientasi; tampilkan dimensi asli ini di UI.
- [x] Pure `calculateSize(width,height,mode,value) -> {width,height}`. Original dimensi integerpositifvalid. Mode`width`: inputinteger1..originalWidth, outputheight`max(1,Math.round(originalHeight*value/originalWidth))`. Mode`height` simetris. Mode`percent`: integer1..100, masing-masing dimensi`max(1,Math.round(original*percent/100))`. Jangan scalingberulang dari hasil resize; selalu dari original.
- [x] UI input scalar ASCIIinteger saja, trimASCIIt epi (tanpa spasi di tengah), maxlength8; tolak0/negatif/desimal/eksponen/diatasbatas. Defaultmode width denganoriginalWidth; pindahmode meresetvalue keoriginalHeight/100 sesuai mode. Angka hasil tidak melebihi original. Jelaskan pembulatan piksel bisa sedikit mengubah rasio angka pada gambar sangat kecil.
- [x] Tampilkan dimensi perkiraan segera dari kalkulasi ringan; hasilfile baru dibuat lewat `Ubah ukuran`. Label eksplisit`Lebar (px)`, `Tinggi (px)`, `Persen (%)`; hanya input relevan ditampilkan/aktif. Rasio aspek tetap terkunci, tidak toggle stretch/crop.
- [x] OutputPNG default, JPEG atauWebP pilihan. PNGlosslessencodehasilresize (resize tetapmengubahpixel); JPEG/WebP quality0.9 tetap, tidakmenambahslider. JPEGalpha→putih; WebPunsupportedmemberipesan, bukanextensionpalsu. Output<=20MiB.
- [x] Previewasli/hasil, dimensi danbytes masing-masing, format terpilih, tombolcontoh sintetislokal/clear/download. Nama`foto-resize.png/.jpg/.webp`. Gambar lebihrendahresolusi belumtentu filelebihkecil; jangan menjanjikannya.
- [x] Single nativejob, requestID/cleanup/invalidasi mengikuti00a; editinput/mode/format/filemenonaktifkanunduhlama. Clearresetmode/output/pilihfile danfokusinput. Semua filename/hasilpakaitextContent, data tidakdikirim.

## Fixture wajib

- [x] 1200x800, width600→600x400; width601→601x401; height100→150x100; percent25→300x200; percent100→1200x800.
- [x] 3x2, percent50→2x1; 1x100, percent1→1x1; width1 pada1200x800→1x1; tidak dimensi0. Documentasi tidak mengklaimrasio matematisexact setelahpembulatan.
- [x] Tolakwidth1201/height801, percent101/0, `1e2`, `50.5`, emptydaninputnonASCII. Gantimode meresetbatas/value sesuai original.
- [x] EXIFfixturefoundation→dimensi/orientasibenar; PNGalpha→PNG tetaptransparan, JPEGputih, WebPfeaturedetected. Buka kembaliunduhan danperiksa **dimensifile**bukanhanyaukuranCSSpreview.
- [x] Overcapfile/pixel/side, invalidheader/APNG/formatlain, outputovercap/toBlobnull/formatunsupported memberierror danunduhdisabled; tesvalidatorcap tepat/cap+1 melaluishared.
- [x] Editstale/reset/duakliktidakmenimpahasilbaru atau menumpukjob. FilenameXSS tetapliteral. PreviewURLdibebaskan setelahdiganti.
- [ ] QA320/390/768/1440px, keyboard/mobilepicker, directroute+refresh, formatdownload, console/Network tanpa inputterkirim. Runner menguji empat viewport; direct route dan contoh lokal 160×120 diverifikasi manual, lalu diubah menjadi 80×60 PNG (936→362 byte). Pemeriksaan keyboard, mobile picker, refresh, console, dan Network belum dilakukan.

## SEO dan artikel

- [x] Title`Ubah Ukuran Foto Online dalam Piksel | Edwin Lab`; H1`Ubah Ukuran Foto`; description`Perkecil dimensi foto JPG atau PNG berdasarkan lebar, tinggi, atau persen. Rasio foto tetap dijaga, dengan unduhan PNG, JPEG, atau WebP di browser.`
- [x] Queryintent`ubah ukuran foto online`, `resize foto piksel`, `perkecil dimensi gambar`. Hindari keywordpasfoto3x4/resmi, DPIatau200KB yangtidakdidukung.
- [x] Kontenstatis: cara pakai, contoh1200x800→600x400, beda dimensi/byte, rasio/pembulatan, tipformat/alpha, batas, FAQ`Bisa memperbesar?`(belum),`Apakah foto dipotong?`(tidak),`Apakah filepasti lebihkecil?`(tidak),`Apakah diunggah?`(tidakoleh alat).
- [x] Metadata/canonical/logo/noscript sesuaiCONTRACT; related10/12/hubhanya bila siap.

## Selesai dan prompt

- [x] Laporkan file, fixturepass/fail, QA/browser/download dan `git diff --check`; updatechecklist/tracker11setelahterbukti. Jangancommit/push/deploy. IAB runner lulus 28/28; runner membuka ulang Blob PNG hasil unduhan dan memverifikasi dimensi 600×400. Direct route menghasilkan contoh lokal 160×120; resize manual width 80 memberi 80×60 dan ukuran file 936→362 byte. `node --check` dan `git diff --check` lulus. Console/no-JS/keyboard/refresh/mobile picker/Network masih belum diverifikasi.

```text
Implementasikan hanya docs/everyday-tools/11-ubah-ukuran-foto.md setelah00 dan00a faseI lulus. Baca README/CONTRACT. Gunakan sharedimage read-only, originalbitmap sebagai sumber setiap resize, modewidth/height/percent tanpa upscaling/crop. Terapkan batas, pembulatan, alpha/orientasi/MIME, stalejob dan outputPNG/JPEG/WebP persis task. Buat hanya folder app dan dua file tes miliknya, HTML/CSS/JS tanpa npm/build/CDN/backend. Jalankan fixture dan QA termasuk decode fileunduhan; updatechecklist/baristracker11hanya berdasar bukti. Janganubahshared/hub/homepage/sitemap/tasklain ataucommit/push/deploy.
```
