# 22 — CSS Gradient Generator (D09)

Status: **belum dikerjakan; rencana saja**. Model: **GPT-6 Luna · medium**. Path `/css-gradient-generator/`; canonical `https://edwinlab.dev/css-gradient-generator/`.

## Scope dan files

Pembuat **linear gradient** opaque sRGB dengan 2–5 stops, angle, posisi persen, preview, CSScopy/download. V1 tidak mencakup radial/conic/mesh, alpha, advanced color spaces, arbitrary CSS input, animasi, atau exportbitmap.

Miliki `css-gradient-generator/{index.html,logic.js,tool.js,tool.css}`, `tests/tools/css-gradient-generator.{test.js,html}`, task dan row22 README. Baca CONTRACT/EXTENSION-CONTRACT/shared/harness. Tanpa vendor; integrasi task24. Jangan bergantung task17 (HEXparser kecil spesifik boleh lokal; jangan menggandakan algoritme konversi/kontras).

## TODO implementasi

- [ ] Angle numeric0–360, default90;2–5 stops dengan colorpicker+HEXinput dan posisi0–100. Angle/posisi finite maksimal dua desimal; reject empty/out of range/Infinitey/exponent, bukan silentlyclamp.
- [ ] HEX #RGB/#RRGGBB dinormalisasi lowercase6digit. Tidak menerima string CSS color bebas. Stop order nondecreasing; positions sama diperbolehkan untuk hard transition. Jangan autosort diam-diam atau menghapus duplicate stop.
- [ ] Generate gradient/Example/Clear, Add stop/Remove stop menjaga minimal2 maksimal5. Positions dan colorlabel permanen; setiap stop dapat dioperasikan keyboard.
- [ ] Pure validator/serializer menerima data typed tervalidasi. Format output deterministik `linear-gradient(90deg, #ff0000 0%, #0000ff 100%)`; CSS report `.gradient {\n  background: ...;\n}\n` dengan newline sebenarnya.
- [ ] Preview style.backgroundImage hanya dari serializer whitelist ini; style tidak memakai raw user string. Output lewat readonly textarea; jangan render HTML input atau membuat dataURL.
- [ ] Batas tiap field 64karakter, total 2 KiB, output 4 KiB. Kerja bounded main thread; semua editing invalidate generatedCSS/copy/download lama. Example menyiapkan data, tidak memakai preset CDN.
- [ ] Copy CSS declaration/fullrule dengan label yang jelas; download `gradient.css` text/css menggunakan helper. Ratio/contrast bukan fitur tool ini; link ke colorchecker hanya bila sudah selesai/integrasi.
- [ ] Preview memberi label gradient/teks bantu, status aria-live, focus/keyboard dan panel kecil tidak overflow. Tidak ada input storage/network.

## SEO/copy

- [ ] Title `CSS Linear Gradient Generator | Edwin Lab`; H1 `CSS Gradient Generator`.
- [ ] Description `Create a linear CSS gradient with color stops, angles, and a preview. Copy or download the generated CSS without uploading your choices.`
- [ ] Preview diperbarui saat Generate; copy tidak menjanjikan perubahan live pada setiap input. Guide: 90deg dari kiri ke kanan, 0deg dari bawah ke atas; stop pada posisi sama menghasilkan hard transition.
- [ ] Artikel HTML awal memberi contoh2/3stops, angle/stop positions dan scopeopaque/linear. Canonical/OG/lang/breadcrumb; related hanya existing atau approved batchtask24, hub selalu tersedia.

## Fixture/Definiteion of Done

- [ ] Angle 90, red0/blue100→`linear-gradient(90deg, #ff0000 0%, #0000ff 100%)` persis; HEX pendek dinormalisasi; angle 360 diterima lalu dinormalisasi 0.
- [ ] Three stops 0/50/100 mempertahankan urutan;0/50/50/100 valid hard transition;20/10 decreasing invalid.
- [ ] Minimal 2/maksimal 5 diterima; 1/6 ditolak. Numeric 0/100 batas valid; negative/101, empty, NaN/Infinitey, injection `url(...)`/CSS function pada HEX→error.
- [ ] Roundingformat menghilangkan trailing zero:50.00 → 50,50.25 tetap; tidak menyisipkan whitespace/token dari raw input.
- [ ] Parse output tidak perlu eval; test preview backgroundImage pada browser benar-benar gradient, reportmime/text/filename/revoke sesuai helper.
- [ ] UI add/remove/generate/example/clear/stale/copy denied/download, keyboard/focus,320/390/768/1440 px/directrefresh/noJS/console/network.
- [ ] Browser runner noindex/harness lulus; `git diff --check` bersih; update task22/row22 README dengan bukti actual. Jangan centang QA yang belum diuji.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/22-css-gradient-generator.md.
Baca CONTRACT.md, EXTENSION-CONTRACT.md dan shared/harness aktual; rekomendasi Luna medium dipilih di chat.
Bangun bounded lineargradient validator/serializer dan fixtures, lalu form/preview/copy/download/staticSEO/QA.
Semua CSS preview berasal dari normalized stop data, bukan arbitraryCSS input. Hanya HTMLCSSvanillaJS, tanpa build/vendorbaru.
Jangan ubah hub/sitemap/shared/alat lain. Update task22 dan row22 README setelah bukti tes/QA.
Jangan commit/push/deploy.
```

Sumber primer: [MDN linear-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/gradient/linear-gradient).

## Hasil eksekusi

Belum dieksekusi.
