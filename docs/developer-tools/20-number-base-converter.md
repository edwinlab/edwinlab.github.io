# 20 — Number Base Converter (D07)

Status: **Implementasi dan fixture browser selesai lokal pada 12 Oktober 2026. Sebagian QA UI manual dan deployment live belum diverifikasi.** Model: **GPT-6 Luna · medium**. Path `/number-base-converter/`; canonical `https://edwinlab.dev/number-base-converter/`.

## Scope dan file

Konversi integer signed antara binary, octal, decimal, hexadecimal dengan BigInt. V1 tidak mencakup pecahan, float/IEEE754, bitwise operations, Unicode/ASCII, bit width atau two's complement. Angka negatif memakai minus pada tiap basis.

Miliki `number-base-converter/{index.html,logic.js,tool.js}`, CSS khusus bila diperlukan, `tests/tools/number-base-converter.{test.js,html}`, task dan row 20 README. Baca CONTRACT/EXTENSION-CONTRACT/helper/harness aktual. Tidak ada vendor baru; task 24 mengurus integrasi.

## TODO implementasi

- [x] Label Number input dan Input base (2/8/10/16); Convert/Example/Clear; empat output readonly berlabel dengan tombol copy per basis dan Download text report.
- [x] Parse hanya string integer, trim whitespace **luar**; opsional satu tanda +/- lalu digit. Prefix0b/0o/0x boleh hanya bila cocok dengan basis pilihan. Tidak ada underscore, whitespace internal, decimal point/exponent atau prefix mismatch.
- [x] Validasi alfabet digit per basis sebelum BigInt; pisahkan tanda dari magnitude agar tidak bergantung parsing negatif-prefixed yang tidak didukung. BigInt dipakai sejak awal, tidak lewat Number/parseInt.
- [x] Output raw digit tanpa prefix, hex lowercase; leadingzero dibuang, -0 dinormalisasi0. Label basis membuat output jelas. `logic.js` pure berisi parse/convert/format report, UI tidak mengimplementasikan parser kedua.
- [x] Batas raw input 8 KiB UTF-8 dan 4096 digit magnitude; tepat batas diterima. Batas total output 64 KiB. Validasi sebelum konversi; tampilkan batas/pesan yang spesifik.
- [x] Operasi bounded main thread tanpa library/worker. Field hasil teks selectable; angka tidak dimasukkan ke URL/storage/analytics. Clipboard melalui shared helper.
- [x] Input/base berubah membatalkan semua hasil/copy/download; error menjaga input dan tidak menampilkan konversi parsial.

## SEO/konten

- [x] Title `Binary, Decimal, Octal & Hex Converter | Edwin Lab`; H1 `Number Base Converter`.
- [x] Description `Convert whole numbers between binary, octal, decimal, and hexadecimal without losing large-integer precision. Supports signed values and local processing.`
- [x] Worked example255→11111111/377/255/ff, angka besar beyond Number-safe, aturan prefix, minus biasa dan beda dari two's complement.
- [x] lang=en/canonical/OG/breadcrumb/static guide/limitations. Related existing `/base64/` menjelaskan encoding teks berbeda dari number base; link hub selalu tersedia. Tidak menambahkan planned routes.

## Fixture dan Definition of Done

- [x] Decimal255→binary11111111, octal377, decimal255, hexff; roundtrip hexFF→255.
- [x] Decimal-10→binary-1010, octal-12, decimal-10, hex-a; `+00010`→10; `-0`→0 seluruh basis.
- [x] Decimal9007199254740993→hex20000000000001; hex20000000000001→decimal9007199254740993 persis.
- [x] Binary0b1010/octal0o12/hex0xA pada basisnya→10; mismatched prefix dan binary102/octal8/hexg/decimal1e3/1.5/1_000/whitespace internal/dua tanda/empty→error.
- [x] Batas 4096 digit dan 4097 digit; tepat byte limit/lebih satu byte dicek terpisah; output size guard ada tanpa giant allocation yang tidak perlu.
- [ ] UI example/proses/error/clear/stale/copy ditolak, hasil besar tidak menyebabkan page overflow, four viewport, keyboard/no-JS/direct refresh/console/network.
- [x] Runner browser noindex/harness lulus dan `git diff --check` bersih. Tes baru hanya terkait tool ini.
- [ ] Update task ini/row 20 README dengan bukti; laporkan partial bila browser tidak diuji. Jangan commit/push/deploy.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/20-number-base-converter.md.
Baca CONTRACT.md, EXTENSION-CONTRACT.md dan shared/harness aktual. Rekomendasi Luna medium, dipilih manual di chat.
Bangun pure BigInt conversion dan fixture dahulu, lalu UI/copy/SEO dan browser QA.
Ikuti integer-only/sign/prefix/limits. Jangan lewat Number atau menambah two's complement.
Hanya HTML CSS JS siap GitHub Pages, tanpa build. Jangan ubah shared/hub/sitemap/alat lain.
Update checklist task 20 serta row 20 README dengan hasil nyata. Jangan commit/push/deploy.
```

Sumber primer: [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), [BigInt toString radix](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toString). Periksa kembali API saat eksekusi.

## Hasil eksekusi

Tool `number-base-converter/` memakai BigInt dari string, menolak prefix tak cocok, serta menyediakan hasil/copy per basis dan report download. Browser runner: **7/7 passed**, termasuk nilai 9,007,199,254,740,993 dan limit digit. Integration: **10/10 passed**, termasuk per-basis copy dispatch, report Blob, direct route, no-script, dan empat viewport. Keyboard/focus dan overflow manual serta live deployment belum diuji.
