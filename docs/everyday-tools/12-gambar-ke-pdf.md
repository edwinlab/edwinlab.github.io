# 12 — Gambar ke PDF

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**; lebih sesuai untuk urutan file, lifecycle worker, batas memori, dan validasi PDF. Prasyarat00,00a faseI danP lulus. Task ini bisa ditunda tanpa menahan tool murah lain.
Route `/gambar-ke-pdf/`; canonical `https://edwinlab.dev/gambar-ke-pdf/`.

## Scope dan kepemilikan

Gabungkan JPEG/PNG menjadi PDF A4, satu gambar per halaman, portrait atau landscape untuk seluruh dokumen, urutan bisa diubah. Proseslokal. Bukan PDF merger/editor, PDFtoJPG, OCR, teksselectable, kompresPDFexisting, password, tanda tangan atau dukunganHEIC.

- [ ] Baca README/CONTRACT/00 dan faseI/P00a; gunakan pdf-lib lokal terpin, imagehelper/read-only, downloadBlob, CSS/statuslama.
- [ ] Miliki `gambar-ke-pdf/index.html`, `logic.js`, `tool.js`, `worker.js` (classic), CSSlokalopsional, `tests/everyday/gambar-ke-pdf.html`/`.test.js`, checklist/task/tracker12. Tidak mengubahvendor/shared/toolslain/hub/homepage/sitemap.
- [ ] HTML/CSS/JSlangsungdiHTTP/GitHubPages, tanpa build/compiler/npm/CDN/API/backend.

## Batas, gambar, dan PDF

- [ ] Max10file; masing-masing<=10MiB, totalbytesfile<=30MiB; perfile<=12juta piksel/8192pxpersisi. Tolakpilihanbatch yangmelewatibatas sebagai satuoperasi; daftar sebelumnya tetap. Fileduplicateboleh, karenapenggunabisasengajamengulanghalaman. Tampilkanjumlah/total/batas sebelumproses.
- [ ] Inspectsemuafiledulu, tetapi decode/normalisasikan **satu per satu**, langsungclosebitmap/canvas. Tidak menyimpan arrayRGBA semua file. Thumbnail dibuatrendahresolusi maksimal160pxsisipanjang, URLdilepas saatitemdihapus/reset; inputoriginalFiletetaplokal.
- [ ] Pure `getPageSize(orientation)` memakaiA4portrait `210*72/25.4` x `297*72/25.4`point; landscape dibalik. Margin10mm=`10*72/25.4` setiap sisi.
- [ ] Pure `fitImage(w,h,pageW,pageH,margin)` menghasilkan`{x,y,width,height}` dalamPDFpoint: `scale=min((pageW-2*margin)/w,(pageH-2*margin)/h)`, width=w*scale,height=h*scale,x=(pageW-width)/2,y=(pageH-height)/2. Fit/center tanpa crop/distorsi, seluruhgambar termasuk alpha ada di halaman.
- [ ] Normalisasigambar keJPEGquality0.9 denganlatarputih danorientasibenar. Rasteruntukembed dibatasitarget**150pixel perinci ukuranlayoutPDF**, tanpa upsamplingbitmap: `r=min(1,fit.width*150/72/w,fit.height*150/72/h)`; width=`max(1,floor(w*r))`, heightanalog. Gunakan fit daridimensioriginal untukdrawPDF sehingga aspectlayoutkonsisten; roundingrastermaksimumsatupixel dijelaskaninternal.
- [ ] CopyUIsebelumgenerate: foto dipasang keA4 dan dikodeulangsebagaiJPEG untukmengendalikanukuran; transparansimenjadiputih; kualitas/metadata dapatberubah; tidakOCR. Jangan menyebutlossless/dokumenarsip atau meningkatkanresolusi gambar kecil.
- [ ] Workerclassic memuatUMDlokal viaimportScripts, menerima normalizedJPEG ArrayBuffersecaraseri dengantransferlist dan index. Appendhalamanberurut diPDFDocument. Acknowledge perhalaman agar main tidakmengirim semuaimage sekaligus. Mainmelepaskanreferensibytes sesudahtransfer; workerboleh menyimpan PDFresources dalamcap.
- [ ] TombolBuatPDF membekukansnapshoturutan/orientasi. Progress`Menyiapkan gambar N dari M`/`Menyusun PDF`; janganpersenpalsu. Workeridle watchdog15detik sejakpesan terakhir, resetperack; tahapsavePDF15detik. Timeout/Cancel/error terminasiworker danhapusoutputparsial; jobIDmembuangpesanlama. Decode native yangsedangberjalan mungkinbaru selesai kemudian, hasilnya tetapdibersihkan. Tidakmenjalankanlebihdarisatujob.
- [ ] Sesudahsave, cekUint8Array<=20MiB sebelumBlobPDF. Hanyaoutputlengkapdownload`gambar.pdf`. Limitoutputmemberiinstruksi kurangi jumlah/dimensi file, bukanmemotonghalaman. ParseulangPDFpadates, bukanruntimewajibsetiapklik.

## UI dan privasi

- [ ] InputmultipleJPEG/PNG, daftarbernomor dengannama(dimtextContent), thumbnail, dimensi, bytes. Tombol`Naik`,`Turun`,`Hapus` peritem berlabelnama/indexaksesibel; jangan drag-only. Ujungdaftarmenonaktifkantombolyangtakberlaku. Penambahanfilemempertahankanurutanpilihanbrowser danmenambahkan diakhir.
- [ ] RadioPortrait/Landscape, margin10mm tetapdijelaskan, tombolcontohsintetislokal/bersihkan/buatPDF/batalkan/unduh. Editlist/optionssaatidle menghapusunduhanlama. Saatgenerate nonaktifkanedit, izinkanBatalkan; clearmembatalkanjobdahulu.
- [ ] TidakpreviewsemuaPDFlewatiframeopaqueuntukmenilaihasil; tampilkanringkasan jumlahhalaman/orientasi/bytes, unduhuntukview. Tidakupload/URLuser/storage/analyticsinput. Error mempertahankandaftarfile yangsudahsah.

## Fixture dan QA

- [ ] Purepageportrait≈595.27559055x841.88976378pt; landscapeinverse. Untuk1200x800portrait, fit≈538.58267717x359.05511811pt,x≈28.34645669,y≈241.41732283; toleransi1e-6. Squarefitwidth=height=min(areaW,areaH); tidakkeluarmargin.
- [ ] SatuJPEG→1halamanA4; JPEG+PNG→2halaman urutanbenar; urutNaik/Turun/Hapus tercermin padaPDFrender. ParseulangpakaiPDFDocument.load lalucekpagecount/MediaBox; gunakanmarkerwarnateks besar sintetis untukmembuktikanurutanvisual.
- [ ] EXIForientation6 tidakdouble-rotate; PNGalpha jadi putih; gambarkecil tidakdi-upsamplepadaJPEGintermediate (tetapbolehditampilkanlebihbesardalamPDFpoint). Gambarportrait/landscape sangatpanjangfit tanpa crop.
- [ ] Filecount10diterima,11ditolak; total30MiBtepatditerimaolehvalidatorbatas, +1ditolak; perfilecap/format/pixelbatas mengikuti00a. UnitvalidasimerangkaitestFilemetadata, tidakmenganggapbyteacakbisadecode.
- [ ] Workerfailure/loadlibraryerror/timeout/cancel/setelahclear: tidakadaPDFparsial, tidakpesanlamamenimpastatus, tidakworkertertinggal. Outputover20MiBdiinjeksikanmenghasilkanerror. Duakliktidakduajob.
- [ ] PDFdownloadmemilikiMIMEapplication/pdf danheader%PDF; **buka minimal dua artifactPDF di viewerbrowser** (portraitdanlandscape) untukcekterbaca/urutan/alpha/rotasi/margin. Parsecount saja tidakcukup.
- [ ] QA320/390/768/1440px, keyboardreorder, directroute/refresh, filepicker/progress/error, console/Network tanpaupload. Catatbrowser,fileoutputuji,limitaktual. TidakmenambahOCRatauPDFfitur lainuntukmelewatites.

## SEO dan artikel

- [ ] Title`JPG dan PNG ke PDF Online | Edwin Lab`; H1`Gambar ke PDF`; description`Gabungkan gambar JPG dan PNG menjadi PDF A4. Atur urutan halaman, pilih portrait atau landscape, lalu unduh PDF yang dibuat langsung di browser.`
- [ ] Intent`jpg ke pdf`, `png ke pdf`, `gabungkan foto jadi pdf`; kontenmenjelaskan1foto/halaman,10file/30MiB,format/quality150ppi/alpha, urutan, langkah,FAQ`Apakah teksbisa diseleksi?`(tidakOCR),`Apakah PDFyangada dapatdigabung?`(tidak),`Apakah fotodikirim?`(tidakoleh alat).
- [ ] Canonical/OG/logo/noscript ikutCONTRACT, related10/11hanya bilasiap. JanganmembuatvarianrouteJPG/PNGyangduplikat.

## Selesai dan prompt

- [ ] Catatfixture/QA/renderartifact, browser, file, `git diff --check`; centangtask/tracker12hanyabukti nyata. Jangancommit/push/deploy.

```text
Kerjakan hanya docs/everyday-tools/12-gambar-ke-pdf.md setelah00 dan00a faseI/P selesai dengan bukti. Baca README/CONTRACT. Reuse sharedimage serta pdf-lib UMD lokal terpin; janganmengubahvendor/shared. Buat app dan classicworker miliknya, JPEG/PNG inputmaks10file/30MiB, A4 oneimageperpage, normalisasi150ppi JPEGquality0.9 whitebackground, urutanaksesibel, progress/cancel/timeout danoutputcap persis task. HanyaHTML/CSS/JS tanpa npm/build/backend/CDN. Jalankanfixturetermasukworkererror/stale, parsePDF danbukaartifactnyata untukQAvisual; updatechecklist/tracker12hanyabukti. Janganubahhomepage/hub/sitemap/tools lainataucommit/push/deploy.
```
