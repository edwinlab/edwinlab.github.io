# 17 — Color Converter & Contrast Checker (D04)

Status: **Implementasi dan fixture browser selesai lokal pada 12 Oktober 2026. Checklist QA keyboard manual dan deployment live belum diverifikasi.** Model rekomendasi: **GPT-6 Luna · high**. Path `/color-converter/`; canonical `https://edwinlab.dev/color-converter/`.

## Scope V1 dan ownership

Konversi warna opaque sRGB antara HEX, RGB, dan HSL; pemeriksaan kontras teks/latarnya menurut WCAG 2.x. Tanpa alpha/transparansi, nama warna CSS, CSS variables, gradient, Lab/OKLCH/P3, eyedropper, atau janji seluruh halaman accessible. Tidak membutuhkan library baru.

Miliki `color-converter/index.html`, `logic.js`, `tool.js`, `tool.css` bila perlu, `tests/tools/color-converter.test.js`, `tests/tools/color-converter.html`, task ini, dan baris 17 README. Baca CONTRACT/EXTENSION-CONTRACT dan helper aktual. Hub/sitemap/shared/tool lain dikerjakan task 24.

## TODO implementasi

- [ ] Bangun dua area: Color conversion dan Text contrast. Label/input format jelas; pilih HEX/RGB/HSL dengan kontrol sesuai format, Convert/Check contrast, Example/Clear/Copy.
- [ ] HEX hanya `#RGB`/`#RRGGBB` (case-insensitive), output lowercase enam digit; RGB integer 0–255; HSL hue 0–360, saturation/lightness 0–100%, desimal finite diterima tanpa exponent/Infinity/NaN. Field kosong/error ditolak, bukan otomatis nol/clamp.
- [ ] Native color picker boleh membantu memilih HEX, tetapi pure logic melakukan validasi dan konversi. Gunakan angka tervalidasi, bukan arbitrary CSS user string pada style.
- [ ] `logic.js` memisahkan parse/normalisasi RGB, RGB↔HSL, relative luminance, ratio, dan threshold flags. Perhitungan memakai presisi internal; pembulatan hanya untuk display. HSL display maksimal dua desimal, hue360 dinormalisasi0, gray hue0.
- [ ] HSL→RGB memakai pembulatan channel ke integer terdekat; panduan menjelaskan konversi ulang dari display yang sudah dibulatkan dapat berbeda sedikit. Simpan sumber kanonik RGB untuk output dan contrast, jangan loop hasil rounded bolak-balik.
- [x] Kontras memakai linearized sRGB: c=channel/255; c≤0.04045 → c/12.92, selain itu ((c+0.055)/1.055)^2.4; L=0.2126R+0.7152G+0.0722B; ratio=(Lterang+0.05)/(Lgelap+0.05).
- [x] Flag memakai ratio **belum dibulatkan**: AA normal≥4.5, AA large≥3, AAA normal≥7, AAA large≥4.5. Label large text menjelaskan definisi 18pt biasa/14pt bold dari WCAG; jangan menganggap preview native font otomatis large.
- [x] Swatch dan contoh teks menampilkan warna/ratio serta status tertulis; jangan mengandalkan warna status. Copy satu hasil dengan label, misalnya HEX/RGB/HSL atau ringkasan ratio.
- [x] Batas tiap field 64 karakter, total input2 KiB dan output 4 KiB; proses ringan main thread. Edit input/format invalidate hasil dan copy. Status via shared helper, hasil via textContent/value.
- [x] Artikel dan form tidak menyimpan input/network; penggunaan CSS style hanya dari nilai yang sudah dinormalisasi.

## SEO dan konten statis

- [x] Title `Color Converter & WCAG Contrast Checker | Edwin Lab`; H1 `Color Converter & Contrast Checker`.
- [x] Description `Convert HEX, RGB, and HSL colors and check text contrast against WCAG AA and AAA thresholds. Your colors stay in your browser.`
- [x] Guide memberi contoh #ff0000↔rgb(255,0,0)↔hsl(0,100%,50%), batas warna opaque sRGB, makna AA/AAA, dan alasan angka display tidak menentukan pass.
- [x] Canonical/OG/BreadcrumbList cocok dengan halaman. Hub selalu tersedia; `/css-gradient-generator/` menjadi related link setelah task 24 mengonfirmasi target siap. Tidak perlu tautan ke tool encoding yang tidak relevan.
- [ ] Tautkan sumber primer, bukan janji aksesibilitas/ranking.

## Fixture dan QA

- [ ] #fff/#000 →21 dan semua threshold true; pasangan warna sama→1 dan seluruh threshold false.
- [ ] #777777/#ffffff →ratio≈4.478089453577214 (toleransi1e-9), AA normal **false**; display4.48 tetap false. Tes helper threshold dengan4.499999 dan4.5.
- [ ] #abc→#aabbcc→RGB170/187/204; `#ff0000` → HSL 0/100/50; `#00ff00` → 120/100/50; `#0000ff` → 240/100/50; RGB 128/128/128 → hue 0, saturation 0, lightness ≈50.196078.
- [ ] HSL360/100/50→RGB255/0/0; 0/0/100→white; 0/0/0→black. Test rounding channel hasil HSL tanpa menyimpulkan semua roundtrip persis.
- [ ] HEX invalid, RGB256/negatif/desimal, HSL101%/hue361, field kosong, CSS injection, NaN/Infinity/exponent →pesan terkontrol dan output lama invalid.
- [ ] Native picker/input/format switch selaras; copy sukses/ditolak; keyboard/status/swatches, no-JS HTML, network lokal, empat viewport dan direct refresh.
- [x] Runner browser noindex memakai harness; `git diff --check` lulus. Catat pass/fail dan API/browser yang digunakan.
- [ ] Setelah fixture/QA lulus, update checklist task ini dan row 17 README; beri status sebagian jika QA belum tersedia, jangan centang hanya karena file ada.

## Prompt siap tempel

```text
Kerjakan hanya docs/developer-tools/17-color-converter.md.
Baca CONTRACT.md, EXTENSION-CONTRACT.md dan shared API aktual. Model dipilih di chat; rekomendasi Luna high.
Tahap 1: pure conversions/luminance/threshold dan fixture. Tahap 2: UI/SEO/QA browser.
Hanya HTML CSS vanilla JS, file siap GitHub Pages tanpa build. Pertahankan threshold unrounded dan subset opaque sRGB.
Jangan mengedit hub/sitemap/shared/alat lain atau mengimplementasikan TODO lain.
Update checklist task 17 dan row 17 README berdasarkan bukti. Jangan commit/push/deploy.
```

Sumber: [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [W3C Relative Luminance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum#dfn-relative-luminance).

## Hasil eksekusi

Tool `color-converter/` mencakup HEX/RGB/HSL opaque sRGB, contrast WCAG dengan rasio internal tanpa pembulatan, swatch dan copy berlabel. Browser runner: **8/8 passed**, termasuk nilai #777/#fff 4.478089… dan batas field. Integration: **10/10 passed**, termasuk copy dispatch, responsivitas, no-script, dan local-only smoke. Clipboard sistem, keyboard/focus manual, console audit terpisah, dan live deployment belum diuji.
