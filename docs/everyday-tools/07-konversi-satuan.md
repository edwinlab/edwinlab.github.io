# 07 — Konversi Satuan

Status: **implementasi selesai; QA sebagian**. Runner browser lulus 26/26 dan route/contoh diperiksa; console, refresh, keyboard manual, serta no-JS belum diverifikasi.
Model awal: **GPT-6 Luna · high**. Prasyarat [00-foundation.md](00-foundation.md). Jika fixture penting masih gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan menandai selesai sebelum terbukti.
Route: `/konversi-satuan/`; canonical: `https://edwinlab.dev/konversi-satuan/`. Bahasa Indonesia, `lang="id"`.

## Scope V1 dan kepemilikan

Konversi satu nilai antarunit dalam lima kategori tetap: panjang, massa, suhu, luas, dan volume. Tidak ada kurs mata uang, satuan pengguna, kecepatan, energi, konversi gram ke liter, bahan masakan/cup/sendok, imperial gallon, survey foot, atau troy ounce. Kategori diberi label `Massa (berat)` agar istilah umum tetap dapat ditemukan, tetapi tidak menyamakan massa dengan gaya.

- [x] Baca instruksi repository, [README.md](README.md), [CONTRACT.md](CONTRACT.md), [00-foundation.md](00-foundation.md), dan ekspor helper aktual.
- [x] Miliki hanya `konversi-satuan/index.html`, `konversi-satuan/tool.js`, `konversi-satuan/logic.js`, opsional `konversi-satuan/tool.css`, `tests/everyday/konversi-satuan.html`, `tests/everyday/konversi-satuan.test.js`, catatan/checklist dokumen ini, serta baris tracker 07 di README sesuai kontrak.
- [x] Gunakan `/tests/tools/harness.js` untuk runner browser-native `noindex,nofollow`. Existing `/tools/shared/tools.css`, `ui.js`, `limits.js` read-only; helper baru dari `/everyday/shared/` hanya dipakai sesuai CONTRACT.
- [x] Hanya HTML/CSS/JavaScript vanilla ES modules, file langsung GitHub Pages; tanpa npm, compiler, build, backend, library konversi, CDN, atau unduhan runtime. Tidak mengubah hub, homepage, sitemap, shared files, CNAME, atau developer tools.

## Tabel unit dan sumber primer

ID di tabel adalah enum tetap dalam logic. Faktor adalah pengali menuju unit dasar kategori; simpan literal penuh, jangan menyalin faktor tabel sumber yang telah dibulatkan. Definisi faktor tepat tidak menjadikan semua operasi floating-point tepat.

| Kategori / dasar | ID dan label → faktor |
|---|---|
| Panjang / m | `mm` Milimeter → `0.001`; `cm` Sentimeter → `0.01`; `m` Meter → `1`; `km` Kilometer → `1000`; `in` Inci → `0.0254`; `ft` Kaki internasional → `0.3048`; `yd` Yard → `0.9144`; `mi` Mil internasional → `1609.344` |
| Massa / kg | `mg` Miligram → `0.000001`; `g` Gram → `0.001`; `kg` Kilogram → `1`; `t` Ton metrik → `1000`; `lb` Pound avoirdupois → `0.45359237`; `oz` Ounce avoirdupois → `0.028349523125` |
| Luas / m² | `cm2` Sentimeter persegi → `0.0001`; `m2` Meter persegi → `1`; `km2` Kilometer persegi → `1000000`; `ha` Hektare → `10000` |
| Volume / m³ | `mL` Mililiter → `0.000001`; `L` Liter → `0.001`; `cm3` Sentimeter kubik → `0.000001`; `m3` Meter kubik → `1` |
| Suhu / aturan tersendiri | `C` Celsius (°C), `F` Fahrenheit (°F), `K` Kelvin (K) |

- [x] Gunakan definisi panjang internasional: 1 kaki = 0,3048 m; 1 yard = 0,9144 m; 1 inci = 1/12 kaki; 1 mil = 5280 kaki. Rujukan primer diperiksa saat perencanaan: [NIST Appendix B, khususnya B.6](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors).
- [x] Pound tepat 0,45359237 kg berasal dari [NIST Footnotes, catatan 22](https://www.nist.gov/pml/special-publication-811/nist-guide-si-footnotes); ounce = pound/16, juga tercantum penuh pada [NIST FiPy unit reference](https://pages.nist.gov/fipy/en/fix_amgx/generated/fipy.tools.dimensions.physicalField.html). Ini ounce massa avoirdupois, bukan ons Indonesia 100 gram, troy ounce, atau fluid ounce; sebutkan perbedaannya dalam bantuan unit.
- [x] Hektare, liter dan ton metrik mengikuti [NIST Chapter 5, Table 6](https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si). Satuan kuadrat/kubik memakai faktor yang dipangkatkan sesuai dimensi, bukan faktor panjang biasa.
- [x] Rumus suhu memakai [NIST Appendix B.8, degree Celsius/Fahrenheit](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8). Tampilkan ringkasan rumus dan link primer yang relevan di bawah form; tidak memuat situs sumber saat pengguna menghitung.

## Parsing, aritmetika, dan limit

- [x] Import `parseDecimal` dari `/everyday/shared/number.js` dengan `maxIntegerDigits:9`, `maxFractionDigits:6`, `allowNegative:true`. Trim whitespace ASCII di tepi pada UI. Terima titik **atau** koma sebagai pemisah desimal tunggal; tidak ada pemisah ribuan, tanda plus, exponent, `.5`, `1.`, NaN, atau Infinity. Tampilkan contoh `1,5` atau `1.5`, dan tulis `1000` tanpa pemisah ribuan.
- [x] Panjang raw scalar maksimum 24 karakter sebelum parse, enum hanya ID dari tabel. Wrap kegagalan parser menjadi `INVALID_NUMBER` dan panjang menjadi `INPUT_TOO_LONG`; jangan fallback `parseFloat` parsial. Batas digit parser tetap berlaku sebelum konversi Number.
- [x] Export `convertUnit(raw,category,from,to) -> {value:number,formatted:string}` dan `formatResult(value) -> string`. `category` enum `length|mass|temperature|area|volume`; unknown atau unit di kategori berbeda → `INVALID_UNIT` sebelum menghitung.
- [x] Ubah `{coefficient,scale}` menjadi `Number(coefficient) / (10 ** scale)`. Non-suhu wajib `value >= 0` (`NEGATIVE_VALUE` bila kurang); nol diterima. Suhu negatif diterima selama C ≥ -273.15, F ≥ -459.67, K ≥ 0; bandingkan input terhadap batas pada skala asal, pelanggaran → `BELOW_ABSOLUTE_ZERO`.
- [x] Non-suhu: `result = value * sourceFactor / targetFactor`. Suhu: konversi asal ke C (`C=v`, `F=(v-32)*5/9`, `K=v-273.15`), lalu C ke target (`C=c`, `F=c*9/5+32`, `K=c+273.15`). Untuk unit asal=tujuan kembalikan input setelah validasi, tanpa roundtrip.
- [x] Khusus input tepat batas bawah suhu (`-273.15 C`, `-459.67 F`, `0 K`), hasil target gunakan konstanta batas target langsung. Ini mencegah hasil `-0,0000000000000568 K` akibat floating-point; jangan memakai clamp generik yang menerima input di bawah nol mutlak.
- [x] Cek hasil finite, jika tidak `RESULT_RANGE`; normalisasi hasil `-0` menjadi positif `0` juga pada properti `value`. Jangan membulatkan hasil di tengah formula. Perhitungan memakai presisi JavaScript Number; tidak untuk metrologi presisi tinggi. Tidak mengklaim akurasi lebih dari representasi hasil.
- [x] Formatting deterministik: normalisasi `-0` menjadi `0`; ambil `Number(value.toPrecision(12)).toString()`, ganti satu titik desimal menjadi koma. Maksimal 12 digit signifikan, nol pecahan akhir hilang, tanpa pengelompokan ribuan. Notasi `e` dapat muncul untuk angka sangat kecil/besar dan harus dijelaskan; angka nonzero kecil tidak boleh dipaksa menjadi 0 lewat `toFixed`.
- [x] Raw output per konversi di bawah 2 KiB UTF-8; tidak ada batch/upload. Copy teks hasil menyertakan nilai input, kedua label/simbol unit, kategori dan hasil yang sama persis dengan tampilan. Tombol terpisah menyalin angka saja boleh ditunda, jangan menambah scope.

## UX dan state

- [x] Form berlabel `Kategori`, `Nilai`, `Dari satuan`, `Ke satuan`. Default panjang, cm → m, nilai kosong. Pergantian kategori mengganti unit ke pasangan default: panjang cm/m, massa g/kg, suhu C/F, luas m2/ha, volume mL/L; nilai dipertahankan dan hasil dibersihkan.
- [x] `Konversi` memproses eksplisit. `Tukar satuan` menukar enum asal/tujuan, mempertahankan raw input, membersihkan hasil; jelaskan ia tidak memindahkan hasil ke input. `Isi contoh` memakai `2,5` km → m. `Bersihkan` mengembalikan default dan mengosongkan input/hasil.
- [x] Setiap perubahan raw/kategori/unit/contoh/swap segera mengosongkan hasil dan disable `Salin hasil`. Error tidak menghapus input, fokus field terkait, pesan Indonesia spesifik, status `aria-live="polite"`. Copy gagal menawarkan seleksi manual lewat helper Indonesia.
- [x] Satuan yang tidak satu dimensi tidak pernah muncul dalam dropdown target. Jangan menampilkan kolom seluruh unit sekaligus; satu hasil dan rumus/pengali relevan cukup.
- [x] Semua perhitungan lokal tanpa mengirim nilai, query/hash input, analytics input, storage browser atau request perhitungan. Render dengan textContent, hasil readonly dapat diseleksi, keyboard dan focus terlihat.

## HTML, intent, dan SEO

- [x] Title: `Konversi Satuan Panjang, Berat, Suhu, Luas & Volume | Edwin Lab`.
- [x] Meta description: `Ubah cm ke meter, gram ke kilogram, Celsius ke Fahrenheit, hektare ke m², dan liter ke m³. Pilih satuan dan lihat hasil beserta aturan konversinya.`
- [x] H1: `Konversi Satuan`.
- [x] Intro: `Pilih kategori dan dua satuan untuk mengubah nilai panjang, massa, suhu, luas, atau volume. Masukkan desimal dengan koma atau titik tanpa pemisah ribuan.`
- [x] HTML statis mencakup cara pakai, batas presisi, daftar unit, dan contoh `2,5 km = 2500 m`, `1 ha = 10000 m²`, `0 °C = 32 °F`. Jangan membuat halaman terpisah untuk setiap pasangan unit.
- [x] FAQ terlihat: `Apakah 1 ounce sama dengan 1 ons Indonesia?` → tidak, ounce massa sekitar 28,35 g sedangkan ons Indonesia 100 g; `Mengapa gram tidak dapat langsung diubah menjadi liter?` → membutuhkan massa jenis bahan; `Apakah titik boleh dipakai sebagai pemisah ribuan?` → tidak, titik/koma hanya desimal; `Mengapa hasil dapat memakai huruf e?` → notasi ilmiah untuk nilai kecil/besar; `Apa beda konversi suhu dan selisih suhu?` → V1 mengonversi nilai suhu, termasuk offset 32/273,15, bukan delta suhu.
- [x] Hipotesis intent, bukan data volume: `konversi satuan`, `cm ke meter`, `gram ke kg`, `celsius ke fahrenheit`, `hektar ke meter persegi`, `liter ke meter kubik`. Jangan menjanjikan traffic atau ranking.
- [x] Canonical/OG unik, viewport, favicon/logo lokal, satu H1, breadcrumb dan `<noscript>`. Related candidates `/kalkulator-persen/` dan `/kalkulator-tanggal/` hanya jika route tersebut benar-benar tersedia dan QA lulus; konfirmasi slug integrasi dari README, jangan mengarang link atau membuat route baru dari daftar kandidat.

## Fixture wajib saat eksekusi

Bandingkan nilai numerik dengan `abs(actual-expected) <= 1e-12 * max(1,abs(expected))`; hasil nol wajib tepat `0`. Bandingkan `formatted` string tepat sesuai aturan 12 digit signifikan.

- [x] `"100"`, length, cm→m → value `1`, formatted `"1"`.
- [x] `"2,5"`, length, km→m → `2500`, `"2500"`; `"2.5"` memberi sama.
- [x] `"1"`, length, in→cm → `2.54`, `"2,54"`.
- [x] `"1"`, length, mi→m → `1609.344`, `"1609,344"`.
- [x] `"1"`, mass, lb→kg → `0.45359237`, `"0,45359237"`.
- [x] `"16"`, mass, oz→lb → `1`, `"1"`; `"1"`, mass, t→kg → `1000`, `"1000"`.
- [x] `"0"`, temperature, C→F → `32`, `"32"`; `"32"`, temperature, F→C → tepat `0`, `"0"`.
- [x] `"-40"`, temperature, C→F → `-40`, `"-40"`.
- [x] `"0"`, temperature, K→C → `-273.15`, `"-273,15"`; `"-459,67"`, temperature, F→K → tepat `0`, `"0"`.
- [x] `"-273,150001"` C→K dan `"-0,000001"` K→C → `BELOW_ABSOLUTE_ZERO`.
- [x] `"1"`, area, ha→m2 → `10000`, `"10000"`; `"1"`, area, m2→cm2 → `10000`, `"10000"`.
- [x] `"1000"`, volume, mL→L → `1`, `"1"`; `"1"`, volume, L→m3 → `0.001`, `"0,001"`; `"1"`, volume, cm3→mL → `1`, `"1"`.
- [x] `"0,000001"`, area, cm2→km2 → `1e-16`, `"1e-16"`; small-value fixture juga wajib assert hasil nonzero.
- [x] `"1"`, length, m→ft → `3.280839895013123`, formatted `"3,28083989501"`.
- [x] `"-0"`, length, m→m → tepat `0`, `"0"`; `"-1"`, mass, kg→g → `NEGATIVE_VALUE`.
- [x] `"1"`, length, m→kg; kategori tidak dikenal; unit `__proto__` → `INVALID_UNIT`. Gunakan allowlist/own-property check, bukan lookup prototype yang tidak aman.
- [x] `"1,000.5"`, `"1e3"`, `"+1"`, `".5"`, `"1."`, kosong, `"NaN"`, 10 digit integer, 7 digit fraksi → `INVALID_NUMBER`; raw 25 karakter → `INPUT_TOO_LONG`.

## Acceptance dan bukti

- [ ] Semua fixture lulus `/tests/everyday/konversi-satuan.html` via HTTP (26/26); console bersih, refresh belum diverifikasi. Direct route `/konversi-satuan/` dan contoh 2,5 km → 2500 m berhasil.
- [ ] QA browser lengkap: runner memeriksa empat lebar dan interaksi utama; keyboard manual, refresh, no-JS, console, serta pemeriksaan request jaringan belum diverifikasi.
- [x] HTML awal berisi konten bantuan, metadata, contoh dan FAQ; link sumber relevan dan related links yang benar-benar siap. Dokumentasikan pembulatan 12 digit signifikan pada UI.
- [x] `git diff --check` lulus; catat file, fixture lulus/gagal, QA aktual, limit/presisi, dan kebutuhan integrasi. Tidak commit, push, atau deploy.

## Bukti eksekusi

Runner browser via HTTP: **26/26 lulus**. Root memverifikasi direct route dan contoh `2,5 km → 2500 m`. `node --check` lulus untuk logic, UI, dan test; `git diff --check` lulus. Pemeriksaan console, no-JS, refresh, keyboard manual, serta network panel tidak tersedia dalam sesi QA ini. Perhitungan menggunakan `Number` JavaScript dan menampilkan paling banyak 12 digit signifikan; hasil bukan untuk metrologi presisi tinggi. Tidak diperlukan integrasi shared/homepage/sitemap dalam scope TODO 07.

## Prompt eksekusi mandiri

```text
Implementasikan hanya docs/everyday-tools/07-konversi-satuan.md.
Baca instruksi repository, docs/everyday-tools/README.md, CONTRACT.md, dan 00-foundation.md. Verifikasi helper foundation telah selesai.
Gunakan GPT-6 Luna reasoning high yang dipilih di pengaturan chat; UI Indonesia lang=id. Hanya HTML CSS JavaScript vanilla statis GitHub Pages, tanpa npm/compiler/build/CDN/backend.
Ikuti tabel unit terbatas, konstanta penuh, parsing desimal bersama, aturan suhu, pembulatan 12 digit signifikan, scope file, UX dan SEO dalam TODO. Jangan menambah konversi lintas dimensi atau mengubah shared files.
Jalankan runner browser-native, QA browser dan git diff --check; catat bukti aktual. Setelah satu perbaikan fixture terarah masih gagal, isolasi reproduksi minimal dan lanjutkan per langkah kecil dengan Luna yang sama, tanpa melonggarkan tes.
Jangan mengerjakan task lain, commit, push, atau deploy. Laporkan kebutuhan integrasi dan verifikasi yang belum dilakukan.
```
