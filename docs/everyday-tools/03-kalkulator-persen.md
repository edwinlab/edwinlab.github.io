# 03 — Kalkulator Persen

Status: **SEBAGIAN — implementasi dan 24/24 tes browser lulus; pemeriksaan console dan mode tanpa JavaScript masih tertunda**.
Model rekomendasi: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`** berdasarkan cakupan, bukan benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan melonggarkan tes atau menandai selesai.

## Tujuan dan batas V1

Bantu menghitung persentase sederhana untuk angka sehari-hari dengan rumus yang terlihat. UI/SEO Indonesia, `lang="id"`; route `/kalkulator-persen/`, canonical `https://edwinlab.dev/kalkulator-persen/`.

V1 tepat tiga mode: **P persen dari N**, **A berapa persen dari B**, serta **Perubahan persen dari nilai awal ke akhir**. Tindakan: Hitung, Isi contoh, Bersihkan, Salin hasil. Tidak ada pajak, bunga, pinjaman, statistik, konversi mata uang, batch, atau mode diskon; diskon menjadi task terpisah.

## Prasyarat dan kepemilikan

- [x] Baca `docs/everyday-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan instruksi repository. Shared angka/UI/harness yang dibutuhkan tersedia dan lulus fixture; audit console/smoke TODO 00 masih tertunda.
- [x] Buat hanya `kalkulator-persen/index.html`, `kalkulator-persen/logic.js`, `kalkulator-persen/tool.js`, dan CSS lokal bila perlu.
- [x] Buat `tests/everyday/kalkulator-persen.test.js` serta `tests/everyday/kalkulator-persen.html`; impor harness `../tools/harness.js`, runner `noindex,nofollow`, browser module melalui HTTP.
- [x] Pakai `/tools/shared/tools.css`, `setStatus` dari `/tools/shared/ui.js`, `copyTextId` dari `/everyday/shared/ui.js`, serta `parseDecimal`, `formatRatio`, `roundRatio` sesuai `/everyday/shared/number.js`. Shared lama/baru read-only.
- [x] Checklist/bukti dokumen ini serta baris tracker 03 saja boleh diperbarui sesudah verifikasi. Homepage, hub, sitemap, robots, kontrak, foundation, dependency, dan tool lain di luar kepemilikan; pertahankan perubahan pengguna.
- [x] Hanya HTML/CSS/JavaScript vanilla dan ES module `.js`; tanpa npm/package.json, framework, build, backend, CDN, atau library baru. Jangan commit, push, atau deploy.

## Input, rumus, dan presisi

- [x] Input angka berupa `type="text"` dengan `inputmode="decimal"`, label permanen, dan hint `Gunakan 12,5 atau 12.5; tanpa pemisah ribuan`. Jangan pakai `type="number"` yang dapat menerima eksponen/berbeda perilaku koma antar browser.
- [x] Maksimum **64 karakter ASCII mentah per input**, cek sebelum trim/parser. Gunakan `parseDecimal(text, {maxIntegerDigits:13, maxFractionDigits:6, allowNegative:true})` → `{coefficient:bigint, scale:number}`. Sesudah parse, batasi nilai absolut **≤ 1.000.000.000.000** lewat perbandingan integer berskala, bukan Number.
- [x] Konvensi CONTRACT: trim whitespace ASCII tepi; tanda minus opsional, tidak ada plus; digit sebelum/sesudah pemisah wajib; satu titik ATAU koma sebagai desimal. `1,000` berarti **1 dengan tiga desimal**, tidak seribu. `1.234,56`, `1 000`, `1e3`, `NaN`, `Infinity`, `12%`, `.5`, `5.`, dan kosong ditolak; `-0` dinormalisasi sebagai nol.
- [x] Jangan membulatkan input untuk meloloskan batas 6 pecahan/13 digit integer. Kode helper: lebih dari 64 karakter `INPUT_TOO_LARGE`, syntax invalid `INVALID_NUMBER`, digit integer/pecahan berlebih `NUMBER_PRECISION`; range nilai task `RANGE_ERROR`. Error menyebut field yang perlu diperbaiki.
- [x] Simpan semua nilai sebagai rasional BigInt. Untuk input `{coefficient:c,scale:s}`, nilainya `c / 10^s`. Jangan mengonversi melalui Number, `parseFloat`, atau `toFixed`; hitungan pecahan berulang baru dibulatkan saat tampilan.
- [x] Mode `portion`: `p × n / 100`; kedua input boleh negatif/nol, persen boleh di atas 100 selama batas angka ditaati. Hasil berupa nilai, bukan persen. Contoh 150% dari 80 = 120.
- [x] Mode `ratio`: `a / b × 100`; `b === 0` menghasilkan `DIVISION_BY_ZERO`, termasuk `0/0`. Nilai negatif diperbolehkan dan tanda hasil mengikuti rumus aljabar; contoh 25 dari -100 = -25%. Jelaskan penyebut bertanda ini pada mode, jangan menamai hasil sebagai peluang.
- [x] Mode `change`: `(akhir - awal) / awal × 100`, hanya bila **awal > 0**. Nilai awal nol/negatif menghasilkan `BASE_NOT_POSITIVE` dengan pesan `Nilai awal harus lebih besar dari 0 untuk mode perubahan persen.` Nilai akhir boleh negatif; 100 → -50 = -150%. Ini kebijakan V1 eksplisit, tidak menggunakan `abs(awal)` atau memilih konvensi basis negatif diam-diam.
- [x] Pure API `calculatePercentage(mode, firstDecimal, secondDecimal)` menghasilkan `{numerator:bigint, denominator:bigint, unit:'number'|'percent'}` dengan denominator positif. Argumen mode mengikuti label: portion `(p,n)`, ratio `(a,b)`, change `(awal,akhir)`. GCD boleh dipakai, tetapi pengujian membandingkan nilai rasional lewat perkalian silang agar tidak bergantung bentuk reduksi.
- [x] Format hasil memakai `formatRatio(n,d,{places:6,trimZeros:true})`: koma desimal, tanpa grouping, maksimum enam digit pecahan, half-away-from-zero, tanpa `-0`. Angka bulat tidak memiliki `,000000`. Persentase menambahkan `%` hanya pada UI/copy, bukan input/parser.
- [x] Tandai `≈` bila `(n * 10^6) % d !== 0n`, dengan teks `Dibulatkan hingga 6 angka desimal`. `n` boleh negatif, uji ketidaksamaan nol tetap sah. Nilai sangat kecil yang menjadi nol tetap `≈ 0`, bukan klaim nol eksak. Nilai exact tidak diberi tanda perkiraan.
- [x] Kartu hasil memuat angka utama, input yang telah dinormalisasi, rumus substitusi, dan arti mode. Kartu perubahan menampilkan `Naik`, `Turun`, atau `Tidak berubah` menurut tanda numerator asli; jangan mengubah tanda berdasarkan hasil bulat yang dapat menjadi nol.
- [x] Batasi string hasil utama maksimum **64 karakter** dan seluruh ringkasan copy maksimum **2 KiB UTF-8**. Periksa sebelum render/copy, error `OUTPUT_TOO_LARGE` tanpa hasil parsial. Dengan batas input di atas, hasil normal harus selalu muat.

## UI dan perilaku

- [x] Gunakan select mode dan dua field berlabel dinamis; tampilkan hanya field aktif. Fieldset/legend menjelaskan rumus. Mode awal `P persen dari N`, kedua input kosong, tidak auto-run.
- [x] Hitung eksplisit; contoh mengisi `(20,150)`, `(45,180)`, atau `(80,100)` sesuai mode tanpa auto-run. Bersihkan mengosongkan input/hasil dan mempertahankan mode; fokus input pertama.
- [x] Edit input/mode menghapus hasil lama dan menonaktifkan copy. Switching mode mengosongkan input agar nilai lama tidak diam-diam berubah makna. Error mempertahankan input dan fokus field yang bermasalah.
- [x] `Salin hasil` menggunakan `copyTextId`, menyertakan label mode, nilai yang dihitung, hasil beserta `≈` bila perlu, dan rumus. Status Indonesia memakai `aria-live="polite"`.
- [x] Semua data via `.value`/`textContent`, tanpa HTML input, telemetry, network input, query/hash URL, localStorage/sessionStorage. Tidak menambahkan klaim akurasi uang/pajak.
- [x] Uji keyboard/focus, layar 320/390/768/1440 px, error panjang, dan noscript. Penjelasan/static HTML dapat dibaca tanpa JavaScript.

## Fixture deterministik dan verifikasi

Hasil berikut adalah **teks akhir yang terlihat**, termasuk koma desimal/tanda `≈` bila relevan. Kalkulasi rasional dan formatter harus dites terpisah dengan harness yang sama.

- [x] `portion('20','150')` → **`30`**, unit number dan exact; rumus `20 × 150 ÷ 100`.
- [x] `portion('12,5','80')` serta `portion('12.5','80')` → **`10`** untuk keduanya; `portion('150','80')` → **`120`**.
- [x] `portion('-10','200')` → **`-20`**; `portion('0','-200')` → **`0`**, tanpa `-0`.
- [x] `ratio('45','180')` → **`25%`**; `ratio('25','-100')` → **`-25%`**.
- [x] `ratio('1','3')` → **`≈ 33,333333%`**; `ratio('1','6')` → **`≈ 16,666667%`**. Formatter tie `formatRatio(-1n,2000000n,{places:6,trimZeros:true})` → **`-0,000001`**.
- [x] `change('80','100')` → **`25%` / Naik**; `change('100','80')` → **`-20%` / Turun**; `change('100','100')` → **`0%` / Tidak berubah**.
- [x] `change('100','-50')` → **`-150%`**; `change('0','10')` dan `change('-100','-50')` → **`BASE_NOT_POSITIVE`**; `ratio('0','0')` dan `ratio('1','0')` → **`DIVISION_BY_ZERO`**.
- [x] Format/batas: `portion('1000000000000','1000000000000')` → **`10000000000000000000000`**; `portion('0.000001','0.000001')` → **`≈ 0`**; `portion('1,000','100')` → **`1`**, menegaskan koma selalu desimal.
- [x] Tambahkan penolakan `1000000000000.000001` (range), tujuh digit pecahan (precision), input 65 karakter (length), `1.234,56`, `1e3`, `NaN`, plus, blank, `.5`, dan `5.`. Input invalid tidak meninggalkan hasil lama untuk copy; pakai kode helper sesuai CONTRACT.
- [x] Uji cap output dengan guard tepat batas dan lebih satu byte serta invalid mode; tidak perlu memperluas batas angka publik hanya untuk memicu guard.

## SEO dan konten statis

- [x] Title: `Kalkulator Persen: Hitung Persentase dan Perubahan | Edwin Lab`.
- [x] H1: `Kalkulator Persen`.
- [x] Meta description: `Hitung persen dari angka, cari A berapa persen dari B, atau ukur kenaikan dan penurunan persen. Lihat rumus dan contoh dengan input desimal koma atau titik.`
- [x] Intro: `Pilih jenis perhitungan persen, masukkan dua angka, lalu lihat hasil dan rumusnya. Gunakan koma atau titik untuk angka desimal.`
- [x] Intent/query sasaran: perhitungan praktis dan penjelasan rumus; `kalkulator persen`, `cara menghitung persen`, `berapa persen dari`, `persentase kenaikan penurunan`. Hipotesis intent ini tidak mengklaim volume/ranking.
- [x] Artikel HTML awal memuat tabel tiga rumus dan contoh `20% dari 150 = 30`, `45 dari 180 = 25%`, `80 ke 100 = naik 25%`; jelaskan arah kebalikan 100 → 80 turun 20%, bukan 25%.
- [x] FAQ/jawaban: `Mengapa persen naik dan turun tidak selalu sama?` → penyebut awal berbeda; `Bisakah menggunakan koma desimal?` → boleh tanpa ribuan; `Mengapa nilai awal nol atau negatif ditolak pada perubahan persen?` → V1 memakai basis positif yang jelas; `Apa arti simbol ≈?` → hasil dibulatkan maksimum enam pecahan.
- [x] Cantumkan batas angka/precision dan pemrosesan lokal secara mudah dibaca; metadata canonical/OG/favicon dan structured data opsional sesuai CONTRACT. Related kandidat `/kalkulator-diskon/` serta hub everyday aktif hanya setelah tersedia, tanpa link mati.

## Definition of done saat eksekusi

- [x] Jalankan `/tests/everyday/kalkulator-persen.html` melalui HTTP, catat jumlah lulus/gagal dan browser. Semua fixture kritis, parser/range, formula, rounding, dan error harus lulus.
- [ ] IAB runner 24/24 mencakup tiga mode, koma/titik, nilai bertanda, range/error, clear/contoh/copy/stale, dan empat viewport. Direct route/refresh serta Tab/Enter ke `#workspace` diverifikasi. Mode tanpa JavaScript belum dijalankan.
- [ ] Console tidak dapat ditangkap melalui CUA IAB. Network ditinjau dari source dan tidak ada pengiriman input; traffic aktual belum diperiksa. `git diff --check` lulus dan perubahan task dibatasi pada file 03 serta row tracker-nya.
- [x] Perbarui checkbox/bukti dokumen ini dan baris tracker sendiri hanya setelah verifikasi nyata, tanpa commit/push/deploy.

## Catatan eksekusi — 12 Oktober 2026

Model yang digunakan: GPT-6 Luna, reasoning high. File implementasi: `kalkulator-persen/index.html`, `logic.js`, dan `tool.js`; tes: `tests/everyday/kalkulator-persen.html` dan `kalkulator-persen.test.js`. Runner IAB lulus **24/24** setelah menambah batas raw tepat 64 karakter serta tes rasional langsung dan `roundRatio`. Pemeriksaan pure tambahan: **26 grup formula dan batas lulus**. IAB memuat route dan refresh, menghitung 20% dari 150 menjadi 30 dengan rumus terlihat, serta Tab/Enter dari tautan skip ke `#workspace`; runner memeriksa tiga mode, input invalid/range, rounding, stale/copy, dan 320/390/768/1440 px. Syntax checks dan `git diff --check` lulus. Console capture tidak tersedia melalui CUA; mode no-JavaScript belum diuji. Network hanya ditinjau dari source, sehingga task masih sebagian.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/everyday-tools/03-kalkulator-persen.md di repository ini.
Baca docs/everyday-tools/README.md, CONTRACT.md, 00-foundation.md, dan instruksi repository; foundation harus selesai dengan bukti. Model rekomendasi GPT-6 Luna high, bukan benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, isolasi reproduksi dan lanjutkan per langkah kecil dengan Luna yang sama.
Buat /kalkulator-persen/ serta tests/everyday/kalkulator-persen.html dan .test.js memakai tests/tools/harness.js. UI/SEO Indonesia lang=id, HTML/CSS/vanilla JS, tanpa npm/build/backend/CDN. Gunakan parseDecimal dan formatter rasional BigInt foundation; tiga mode, batas angka, pembagi nol, basis perubahan >0, pembulatan enam digit, dan penanda ≈ harus persis task.
Shared lama/baru, homepage, hub, sitemap, kontrak, foundation, dan tool lain read-only. Jika kontrak helper kurang, laporkan reproduksi dan kebutuhan foundation; jangan duplikasi helper. Jangan commit, push, atau deploy.
Jalankan fixture serta QA browser, responsive, keyboard, route/refresh, console/network, dan git diff --check. Laporkan jumlah lulus/gagal dan bukti aktual. Perbarui checklist/catatan dan baris tracker sendiri sesudah proof; browser belum diuji berarti belum selesai.
```

Rujukan teknis yang dibuka saat perencanaan: [spesifikasi resmi pembagian BigInt](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-bigint-divide) dan [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). BigInt mendukung integer; rasional dan kebijakan pembulatan tetap harus dibuat sesuai kontrak, bukan mengandalkan pembagian integer sebagai pembulatan desimal.
