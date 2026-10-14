# 21 — Pembersih Teks

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · medium**.
Route /pembersih-teks/; canonical https://edwinlab.dev/pembersih-teks/.

## Scope V1 dan ownership

Rapikan spasi/tab dan baris kosong dengan pilihan eksplisit, serta hapus baris duplicate exact bila dipilih. Tidak spelling/grammar correction, perubahan kapital, transliterasi, Unicode normalization, sort, HTML stripping, OCR atau AI.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT dan UI/UTF-8 limits aktual.
- [ ] Miliki pembersih-teks/index.html, logic.js, tool.js, CSS opsional; tests/everyday/pembersih-teks.html dan .test.js; task/row21.
- [ ] Logic transform murni, input/output plain text. Reuse helper UI; tidak mengubah penghitung-kata/ubah-huruf.

## Urutan transform dan batas

- [ ] Input/output maksimal1MiB UTF-8; maksimal20000 elemen hasil split baris setelah CRLF/CR dinormalkan ke LF. Tepat batas diterima, over ditolak sebelum render.
- [ ] Pipeline tetap: normalisasi line ending → trim ASCII space/tab tepi tiap baris jika aktif → collapse rentetan internal space/tab ke satu spasi jika aktif → buang baris kosong ASCII jika aktif → dedup baris exact case-sensitive jika aktif → join LF.
- [ ] Checkbox trim per baris default aktif; collapse internal, hapus baris kosong, dan dedup default nonaktif. Jelaskan normalisasi line endings selalu berlaku. Jangan trim NBSP/karakter Unicode yang berbeda.
- [ ] Split mempertahankan terminal empty element; default trim mempertahankan final newline. Opsi hapus baris kosong/dedup dapat mengubah blank/final-newline sesuai pipeline, dijelaskan di UI.
- [ ] Dedup mempertahankan occurrence pertama serta urutan. "A"/"a" berbeda; "é"/"e+combining accent" berbeda; sumber tidak dinormalisasi/sort. Tanpa hapus blank, beberapa blank dapat menjadi satu jika dedup aktif.
- [ ] Input kosong dan output kosong valid; tampilkan status hasil kosong, copy/download disabled bila tidak ada isi. Tidak membuang data lain untuk membuat hasil tampak sukses.
- [ ] UI input/output readonly, checklist opsi, Bersihkan teks, Contoh, Reset, Salin, Unduh TXT. Perubahan input/opsi menghapus output/ekspor stale. Reset kembali opsi default.

## Fixture wajib

- [ ] Default "  Halo  \r\n\tdunia\t\r\n" → "Halo\ndunia\n"; collapse internal mengubah "a  \t b"→"a b"; NBSP tetap.
- [ ] Semua opsi pada " A \nA\n\nb  b\n B " → "A\nb b\nB"; dedup exact tidak menyamakan b/b kapital atau bentuk Unicode.
- [ ] Input "a\n" default tetap "a\n"; hapus blank menghasilkan "a"; dedup pada dua empty rows hanya menyisakan satu sesuai pipeline. Semua kombinasi opsi memakai expected eksplisit.
- [ ] Blank-only/empty valid, tidak menghasilkan copy palsu. Size/line cap dan cap+1 termasuk emoji multibyte.
- [ ] "<script>alert(1)</script>" tetap teks, bukan HTML stripping/rendering. Result.source tidak dimutasi; normalizeCRLF tidak menciptakan dua newline.
- [ ] Contoh/process/reset/error/copy denial/download Blob content/MIME, edit option stale, keyboard dan long line scroll.

## Konten, SEO, dan selesai

- [ ] Title "Pembersih Teks — Rapikan Spasi dan Baris | Edwin Lab"; H1 "Pembersih Teks".
- [ ] Description "Rapikan spasi dan tab, buang baris kosong, atau hapus baris duplikat sesuai pilihan. Salin atau unduh teks yang diproses lokal."
- [ ] Panduan dan contoh before/after, urutan opsi, duplicate case-sensitive/blank/endings. FAQ "Apakah ejaan diubah?", "Apakah huruf besar dianggap sama?", "Apa yang terjadi pada baris terakhir?".
- [ ] Metadata/noscript/breadcrumb kontrak; related penghitung-kata/ubah-huruf dan hub.
- [ ] Fixture/QA kontrak lulus; catat evidence dan update checklist/row21 saja.

~~~text
Kerjakan hanya docs/everyday-tools/21-pembersih-teks.md dengan Luna medium.
Baca kontrak/helper aktual. Implementasi pipeline LF/ASCII trim/collapse/remove blank/
dedup exact sesuai urutan dan defaults task; jangan mengubah Unicode/ejaan/capital.
HTML/CSS/JS lokal, <=1MiB/20000 split rows, UI/SEO Indonesia, copy/TXT safe.
Jalankan fixture transform/batas/empty/stale dan QA; update task/row21 dengan bukti.
Jangan ubah shared/tool lain/hub/sitemap atau commit/push/deploy.
~~~
