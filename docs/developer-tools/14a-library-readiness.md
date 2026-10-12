# 14a — Readiness library browser untuk tambahan tools

Status: **terblokir sementara — registry tidak dapat di-resolve dari lingkungan ini; fase A–D tetap belum siap.** Model: **GPT-6 Luna · high, per fase**. Tidak membuat public tool/route. Jalankan hanya fase dependency untuk tools yang akan dieksekusi: A→14, B→18, C→19, D→23. Tools15/16/17/20/21/22 tidak memerlukan task ini.

## Scope, ownership, dan batas

Baca CONTRACT/EXTENSION-CONTRACT, `tools/vendor/README.md`, `provenance.json`, dan harness aktual. Siapkan **distribusi resmi yang sudah siap browser** secara lokal, tanpa npm install/build/bundler/package.json/framework. Unduh archive versi tepat saat eksekusi, verifikasi integrity sebelum ekstraksi, pin runtime/license files yang diperlukan. Dokumentasi/asset preparation tidak mengubah behavior tool existing.

Miliki vendor baru `tools/vendor/jsdiff/`, `xml-formatter/`, `marked/`, `dompurify/`, `jsonpath-plus/`, tambahan entri pada README/provenance vendor, dan `tests/tools/extension-libraries.{test.js,html}` plus `extension-libraries.worker.js` bila diperlukan. Hanya fase yang dijalankan boleh menambah dependency terkait. Tidak mengubah existing vendor/shared API/homepage/hub/sitemap atau mendownload semua library jika hanya satu fase diminta. Runner tidak dimasukkan index sampai task 24; buka direct URL untuk tes fase.

## Aturan setiap fase

- [ ] Periksa source/distribusi/API/lisensi primer terkini; pilih versi **rilis stabil tepat** dan catat alasan bila memakai versi berbeda dari research candidate. Tidak memakai latest/floating URL saat runtime.
- [ ] Catat archive URL, integrity upstream, SHA-256 archive/retained files, license runtime dan dependency bundled, bentuk module/global, serta penyesuaian import path jika ada. Pertahankan provenance existing.
- [ ] Copy hanya distribusi siap browser plus license; jangan vendor Node-only dependencies lalu menambah bundler. Jika tidak bisa berjalan tanpa build, fase menjadi dependency belum siap dan laporkan reproduksi.
- [ ] Periksa bare imports/require/Node globals, worker import, dan resource network lokal. Penyesuaian `.js` pada import relatif boleh tercatat; perubahan perilaku library tidak menjadi solusi default.
- [ ] Uji API/version yang benar-benar dipin dalam fixture browser; jangan menganggap README upstream membuktikan runtime compatibility.
- [ ] Setiap fase mencatat hasil sendiri. Fase lain tetap unchecked; update row 14a README sebagai sebagian atau selesai hanya dengan bukti.

## Fase A — Text Diff / jsdiff

Candidate upstream: [kpdecker/jsdiff](https://github.com/kpdecker/jsdiff). README upstream menyediakan browser `dist/diff.js`/`diff.min.js`, global `Diff`; archive rilisan harus benar-benar memuatnya.

- [ ] Simpan entry klasik siap browser di `tools/vendor/jsdiff/diff.js` plus license/provenance. Jangan import classic UMD sebagai ESM dengan asumsi global sama.
- [ ] Classic worker `importScripts` memuat library; dynamic import hanya fixed local module untuk adapter. Validasi jalur load bersama pilihan implementasi worker task14.
- [ ] Probe `diffArrays` dengan newline-preserving line tokens untuk unchanged/added/removed, termasuk EOF/CRLF. Tidak mengaktifkan ignoreCase/ignoreWhitespace.
- [ ] Probe `maxEditLength`/`timeout` menghasilkan abort yang terdeteksi (upstream dapat mengembalikan undefined), bukan hasil sukses kosong. Task14 masih memakai main-thread deadline/terminate independen.
- [ ] Catat opsi/API tepat; tidak menambahkan word-diff/merge fitur yang tidak direncanakan.

## Fase B — XML formatter

Candidate: [chrisbottin/xml-formatter](https://github.com/chrisbottin/xml-formatter). Research melihat package `dist/browser/xml-formatter-singleton.js` dengan global `xmlFormatter`; entry ESM utama memiliki bare import, sehingga bukan entry runtime yang otomatis bisa dipakai.

- [ ] Verifikasi singleton resmi dari archive stabil, pin `tools/vendor/xml-formatter/xml-formatter.js`; audit lisensi bundled parser dan path/API worker klasik.
- [ ] Probe strict/indentation/collapse options aktual; default permissive/recovery tidak dianggap validator sukses.
- [ ] Supported formatting subset task18: element-only hierarchy dan single-line text-only leaf. Native DOMParser tetap validasi sebelum/semantik sesudah format. DOCTYPE tidak diterima. Mixed significant text, xml:space, multiline text, CDATA/non-declaration PI boleh divalidasi jika task18 mendukung tetapi tidak diformat.
- [ ] Fixture `<root><n a="1">hello &amp; world</n><e/></root>`, namespaces, attribute escaping dan empty elements menghasilkan XML valid dengan attributes/leaf text sama. Entity spelling/quote/empty-tag style tidak dijanjikan byte-identical.
- [ ] Fixture mixed content/xml:space/multiline leaf/CDATA membuktikan consumer menolak formatting dan menjaga input, bukan sekadar membuktikan library bisa memformatnya.
- [ ] Jika supported subset tetap mengubah data, fase belum siap; catat kasus gagal. Jangan mengganti dengan regex formatter atau DOMParser→XMLSerializer pretty printer yang mengubah konten tanpa kebijakan.

## Fase C — Markdown + sanitizer

Sources: [Marked](https://marked.js.org/), [DOMPurify](https://github.com/cure53/DOMPurify). Marked memparse Markdown tetapi **tidak melakukan sanitasi**. DOMPurify membutuhkan browser DOM.

- [ ] Pin distribusi resmi `marked` siap ESM/klasik dan `dompurify` siap browser; catat API entry aktual. Worker memuat Marked, sanitizer berjalan bounded di main browser DOM.
- [ ] Pertahankan license masing-masing dan bundled dependencies bila ada. Jangan memuat runtime CDN atau menerapkan hand-written sanitizer.
- [ ] Probe heading/list/code/table/link. Raw HTML ditampilkan literal/diabaikan sesuai policy task19; jangan melewatkan raw HTML ke frame tanpa sanitizer.
- [ ] Probe DOMPurify policy hanya tag/atribut preview V1; link/image inert tanpa href/src, event handlers/scripts/forms/iframe/SVG/MathML/styles dari input dihapus. Sandbox/CSP tetap wajib sesuai EXTENSION-CONTRACT.
- [ ] Sanitizer tersedia dan bekerja pada browser target; unsupported→error fail-closed. Final preview/output bytes/nodes dibatasi oleh task19.

## Fase D — JSONPath selectors

Source: [JSONPath Plus](https://github.com/JSONPath-Plus/JSONPath). Research 12 Oktober 2026 menguji candidate published 11.2.0, browser ESM `dist/index-browser-esm.js` self-contained. Ini **candidate**, belum dipin di repo; rilis/compatibility diperiksa saat fase dieksekusi.

- [ ] Pin browser distribution resmi, license upstream dan lisensi bundled parser/dependencies yang masuk runtime (research candidate membundel jsep/plugins).
- [ ] Browser/module-worker import benar-benar berhasil. Candidate memakai regex flag modern `/v`; bila target browser tidak mendukung, tampilkan limitation atau pilih rilis aman kompatibel yang terbukti, bukan fallback eval input.
- [ ] Probe selector subset task 23 serta callback abort/match limit sebelum output penuh. Opsi `eval:false` wajib; grammar allowlist task 23 merupakan lapisan tambahan.
- [ ] Filter/script expressions ditolak; worker/output tidak menghasilkan evaluasi kode input. Bundle upstream boleh berisi jalur evaluasi yang tidak dipakai; klaim hanya konfigurasi consumer tidak mengevaluasi input.
- [ ] Probe root0/false/null dan literal keys __proto__/constructor/prototype; catat adapter root-scalar task 23 bila library mengembalikan undefined untuk falsy root. Jangan mengganti query engine.
- [ ] Catat dialect aktual sebagai JSONPath Plus selector subset, bukan full RFC9535 compatibility.

## QA/Definition of Done

- [ ] Runner fase memakai harness/noindex; mencatat loaded version/API/worker roundtrip/fixture/console/network dan capability limitations.
- [ ] Library existing tidak berubah dan suite existing tidak diulang semua tanpa alasan; satu smoke foundation setelah vendor provenance berubah boleh untuk menjaga integritas.
- [ ] `git diff --check` bersih; diff hanya files fase yang dimiliki. Update checklist fase dan row 14a README; consumer hanya jalan setelah fase yang sesuai lulus.
- [ ] Tidak ada halaman public/hub/sitemap atau fitur tool dibuat oleh task readiness ini.

## Prompt siap tempel

```text
Kerjakan hanya docs/developer-tools/14a-library-readiness.md fase <A/B/C/D>.
Baca CONTRACT.md, EXTENSION-CONTRACT.md, vendor README/provenance dan task consumer <14/18/19/23>.
Rekomendasi Luna high, satu fase per sesi. Pin distribusi resmi siap browser dengan licenses/integrity.
Jangan install npm/build/bundle, ubah vendor existing, hub/sitemap/shared atau implementasikan tool consumer.
Jalankan probes browser fase itu, catat versi/runtime/API/batas, update checklist fase dan row 14a README.
Fase lain tetap belum dikerjakan. Jangan commit/push/deploy.
```

## Hasil eksekusi per fase

A–D belum dieksekusi. Percobaan akses arsip resmi `https://registry.npmjs.org/jsdiff/-/jsdiff-7.0.0.tgz` gagal di workspace dengan `curl: (6) Could not resolve host: registry.npmjs.org`; tidak ada archive, file vendor, license, checksum, atau browser probe yang dapat diverifikasi. Karena itu task 14/18/19/23 tetap belum dibuat dan tidak ada dependency pihak ketiga yang ditambahkan.
