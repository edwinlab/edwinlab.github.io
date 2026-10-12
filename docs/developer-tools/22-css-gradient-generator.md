# 22 — CSS Gradient Generator (D09)

Status: **Implementasi dan fixture browser selesai lokal pada 12 Oktober 2026. Sebagian QA UI manual dan deployment live belum diverifikasi.** Model: **GPT-6 Luna · medium**. Path `/css-gradient-generator/`; canonical `https://edwinlab.dev/css-gradient-generator/`.

## Scope dan files

Pembuat **linear gradient** opaque sRGB dengan 2–5 stops, angle, posisi persen, preview, CSS copy/download. V1 tidak mencakup radial/conic/mesh, alpha, advanced color spaces, arbitrary CSS input, animasi, atau export bitmap.

Miliki `css-gradient-generator/{index.html,logic.js,tool.js,tool.css}`, `tests/tools/css-gradient-generator.{test.js,html}`, task dan row 22 README. Baca CONTRACT/EXTENSION-CONTRACT/shared/harness. Tanpa vendor; integrasi task 24. Jangan bergantung task 17 (HEX parser kecil spesifik boleh lokal; jangan menggandakan algoritme konversi/kontras).

## TODO implementasi

- [x] Angle numeric 0–360, default 90; 2–5 stops dengan color picker + HEX input dan posisi 0–100. Angle/posisi finite maksimal dua desimal; reject empty/out of range/Infinity/exponent, bukan clamp diam-diam.
- [x] HEX #RGB/#RRGGBB dinormalisasi lowercase 6 digit. Tidak menerima string CSS color bebas. Stop order nondecreasing; positions sama diperbolehkan untuk hard transition. Jangan autosort diam-diam atau menghapus duplicate stop.
- [x] Generate gradient/Example/Clear, Add stop/Remove stop menjaga minimal 2 maksimal 5. Positions dan color label permanen; setiap stop dapat dioperasikan keyboard.
- [x] Pure validator/serializer menerima data typed tervalidasi. Format output deterministik `linear-gradient(90deg, #ff0000 0%, #0000ff 100%)`; CSS report `.gradient {\n  background: ...;\n}\n` dengan newline sebenarnya.
- [x] Preview style.backgroundImage hanya dari serializer whitelist ini; style tidak memakai raw user string. Output lewat readonly textarea; jangan render HTML input atau membuat dataURL.
- [x] Batas tiap field 64 karakter, total 2 KiB, output 4 KiB. Kerja bounded main thread; semua editing invalidate generated CSS/copy/download lama. Example menyiapkan data, tidak memakai preset CDN.
- [x] Copy CSS declaration/full rule dengan label yang jelas; download `gradient.css` text/css menggunakan helper. Ratio/contrast bukan fitur tool ini; link ke color checker hanya bila sudah selesai/integrasi.
- [x] Preview memberi label gradient/teks bantu, status aria-live, focus/keyboard dan panel kecil tidak overflow. Tidak ada input storage/network.

## SEO/copy

- [x] Title `CSS Linear Gradient Generator | Edwin Lab`; H1 `CSS Gradient Generator`.
- [x] Description `Create a linear CSS gradient with color stops, angles, and a preview. Copy or download the generated CSS without uploading your choices.`
- [x] Preview diperbarui saat Generate; copy tidak menjanjikan perubahan live pada setiap input. Guide: 90deg dari kiri ke kanan, 0deg dari bawah ke atas; stop pada posisi sama menghasilkan hard transition.
- [x] Artikel HTML awal memberi contoh 2/3 stops, angle/stop positions dan scope opaque/linear. Canonical/OG/lang/breadcrumb; related hanya existing atau approved batch task 24, hub selalu tersedia.

## Fixture/Definition of Done

- [x] Angle 90, red 0 / blue 100→`linear-gradient(90deg, #ff0000 0%, #0000ff 100%)` persis; HEX pendek dinormalisasi; angle 360 diterima lalu dinormalisasi 0.
- [x] Three stops 0/50/100 mempertahankan urutan;0/50/50/100 valid hard transition;20/10 decreasing invalid.
- [x] Minimal 2/maksimal 5 diterima; 1/6 ditolak. Numeric 0/100 batas valid; negative/101, empty, NaN/Infinity, injection `url(...)`/CSS function pada HEX→error.
- [x] Format angka menghilangkan trailing zero:50.00 → 50,50.25 tetap; tidak menyisipkan whitespace/token dari raw input.
- [ ] Parse output tidak perlu eval; test preview backgroundImage pada browser benar-benar gradient, report MIME/text/filename/revoke sesuai helper.
- [ ] UI add/remove/generate/example/clear/stale/copy denied/download, keyboard/focus,320/390/768/1440 px/direct refresh/noJS/console/network.
- [x] Browser runner noindex/harness lulus; `git diff --check` bersih; update task 22/row 22 README dengan bukti aktual. Jangan centang QA yang belum diuji.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/22-css-gradient-generator.md.
Baca CONTRACT.md, EXTENSION-CONTRACT.md dan shared/harness aktual; rekomendasi Luna medium dipilih di chat.
Bangun bounded linear gradient validator/serializer dan fixtures, lalu form/preview/copy/download/static SEO/QA.
Semua CSS preview berasal dari normalized stop data, bukan arbitrary CSS input. Hanya HTML, CSS, JavaScript vanilla, tanpa build/vendor baru.
Jangan ubah hub/sitemap/shared/alat lain. Update task 22 dan row 22 README setelah bukti tes/QA.
Jangan commit/push/deploy.
```

Sumber primer: [MDN linear-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/gradient/linear-gradient).

## Hasil eksekusi

Tool `css-gradient-generator/` menerima 2–5 stop HEX tervalidasi, menjaga urutan, membuat preview dari serializer, serta menyediakan copy/download CSS. Browser runner: **5/5 passed**, termasuk aturan CSS tepat dan invalidasi input angka. Integration: **10/10 passed**, termasuk CSS hasil, preview workflow, download Blob, no-script, privacy dan empat viewport. QA keyboard/focus/console manual dan live deployment belum diuji.
