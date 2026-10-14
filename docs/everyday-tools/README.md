# TODO — Tools non-developer Edwin Lab

Dibuat **12 Oktober 2026** sebagai roadmap tools non-developer. Fondasi shared sudah diimplementasikan; fase media Q/I serta tools 01–11 sudah dikerjakan, dan tools tersebut sudah ditautkan melalui hub. Checklist di bawah mencatat hasil yang selesai serta QA yang masih tertunda. TODO12 menunggu verifikasi visual prasyarat PDF. Stack tetap **HTML, CSS, JavaScript vanilla**, file siap GitHub Pages tanpa compiler/build/npm/backend.

Sasaran: pengunjung Indonesia dengan UI Bahasa Indonesia. Tools ditujukan untuk penulis/pelajar, kebutuhan sehari-hari, dan pemilik usaha kecil. Homepage dan developer tools tetap dipertahankan. Hub tersedia di `/alat/`; setiap tool memiliki path sendiri di root domain. CNAME adalah `edwinlab.dev`, sehingga canonical mengikuti domain tersebut.

## Tracker dan model eksekusi

**Untuk batch awal 00–13, semua tools menggunakan GPT-6 Luna (`gpt-6-luna`) dengan reasoning `high`, sesuai pilihan pengguna.** Ini adalah pilihan sesi sebelumnya, bukan klaim benchmark atau jaminan biaya. Pengaturan model dilakukan di chat; menulis nama model di prompt tidak mengganti model sesi secara otomatis. Rekomendasi mengikuti [profil resmi GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) dan prinsip [efisiensi biaya OpenAI](https://developers.openai.com/api/docs/guides/cost-optimization).

| Status | TODO / dokumen | Path publik | Model · reasoning | Prasyarat |
|---|---|---|---|---|
| Sebagian (22/22 runner + 44 cek pure; smoke developer tools/console pending) | [00 — Fondasi](00-foundation.md) | Shared saja | Luna · high | Shared developer tools tersedia |
| Sebagian (Q/I selesai; 20/20; P menunggu render visual PDF) | [00a — Fondasi media](00a-media-foundation.md) | Shared saja | Luna · high, **per fase** | Q/I tersedia; P visual pending |
| Sebagian (19/19; console/no-JS pending) | [01 — Penghitung kata & karakter](01-penghitung-kata.md) | `/penghitung-kata/` | Luna · high | 00 |
| Sebagian (21/21; no-JS/console pending) | [02 — Ubah huruf](02-ubah-huruf.md) | `/ubah-huruf/` | Luna · high | 00 |
| Sebagian (24/24; no-JS/console pending) | [03 — Kalkulator persen](03-kalkulator-persen.md) | `/kalkulator-persen/` | Luna · high | 00 |
| Sebagian (21/21; no-JS/refresh/console pending) | [04 — Kalkulator diskon](04-kalkulator-diskon.md) | `/kalkulator-diskon/` | Luna · high | 00 |
| Sebagian (25/25; refresh/keyboard/no-JS/console/zona waktu pending) | [05 — Kalkulator usia](05-kalkulator-usia.md) | `/kalkulator-usia/` | Luna · high | 00 |
| Sebagian (27/27; refresh/keyboard/no-JS/console pending) | [06 — Selisih & tambah tanggal](06-kalkulator-tanggal.md) | `/kalkulator-tanggal/` | Luna · high | 00 |
| Sebagian (26/26; direct route/contoh lulus; console/refresh/keyboard/no-JS pending) | [07 — Konversi satuan](07-konversi-satuan.md) | `/konversi-satuan/` | Luna · high | 00 |
| Sebagian (25/25; route/contoh; console/no-JS/keyboard/refresh/Network pending) | [08 — Pembuat link WhatsApp](08-link-whatsapp.md) | `/link-whatsapp/` | Luna · high | 00 |
| Sebagian (19/19; route/render; download manual/refresh/keyboard/console/Network pending) | [09 — Pembuat QR code](09-pembuat-qr-code.md) | `/pembuat-qr-code/` | Luna · high | 00 + 00a Q |
| Sebagian (26/26; route/contoh/hasil besar lulus; console/no-JS/refresh/keyboard/Network/unduhan manual pending) | [10 — Kompres gambar](10-kompres-gambar.md) | `/kompres-gambar/` | Luna · high | 00 + 00a I |
| Sebagian (28/28; route/contoh/hasil decode lulus; console/no-JS/keyboard/refresh/mobile/Network pending) | [11 — Ubah ukuran foto](11-ubah-ukuran-foto.md) | `/ubah-ukuran-foto/` | Luna · high | 00 + 00a I |
| [ ] | [12 — Gambar ke PDF](12-gambar-ke-pdf.md) | `/gambar-ke-pdf/` | Luna · high, **per tahap** | 00 + 00a I/P |
| Sebagian (01–11 terintegrasi; 11 card, 26 URL, runner 19/19; TODO12 dan QA manual tersisa) | [13 — Hub, menu & SEO](13-integration-seo.md) | `/alat/` + integrasi | Luna · high | Batch 01–11 lulus runner |

Semua kotak di atas menunjukkan **implementasi**, bukan penyelesaian penulisan rencana. Executor boleh memperbarui checklist task sendiri dan baris tracker sendiri setelah ada bukti. Untuk 00a catat fase yang lulus; untuk 13 catat batch terintegrasi. Jangan menandai keduanya selesai keseluruhan ketika baru sebagian.

## Backlog tambahan — task 14–24

**Status: rencana saja; seluruh checkbox batch ini belum dikerjakan.** Dibuat 12 Oktober 2026 untuk eksekusi satu task per chat menggunakan model hemat. Rekomendasi batch baru memakai **GPT-6 Luna (gpt-6-luna) medium/high** sesuai kompleksitas; pilihan high pada batch awal 00–13 tetap menjadi catatan sesi terdahulu. Model dipilih pengguna di UI, bukan otomatis oleh prompt.

Inventaris saat perencanaan: 11 tool ada di /alat/, task 12 Gambar ke PDF masih pending; sitemap repository memuat 35 URL publik termasuk developer tools. Batch ini menambah kebutuhan teks, hitungan, fokus, pengacakan, dan gambar tanpa mengulang tool yang sudah ada. Prioritas merupakan penilaian kegunaan/scope, **bukan hasil riset volume keyword**.

Baca [EXTENSION-CONTRACT.md](EXTENSION-CONTRACT.md) bersama kontrak existing. Setiap task menyertakan scope V1, ownership, algoritme/batas, fixture dengan expected results, copy/SEO Indonesia, QA dan prompt siap tempel.

| Selesai | TODO | Route rencana | Model · reasoning | Prasyarat relevan |
|---|---|---|---|---|
| [ ] | [14 — Terbilang angka & rupiah](14-terbilang.md) | /terbilang/ | Luna · medium | Shared UI/BigInt |
| [ ] | [15 — Split bill / bagi tagihan](15-split-bill.md) | /split-bill/ | Luna · high | Shared angka integer |
| [ ] | [16 — Kalkulator rata-rata](16-kalkulator-rata-rata.md) | /kalkulator-rata-rata/ | Luna · medium | Shared decimal/rasional |
| [ ] | [17 — Kalkulator nilai akhir](17-kalkulator-nilai-akhir.md) | /kalkulator-nilai-akhir/ | Luna · high | Shared decimal/rasional |
| [ ] | [18 — Timer Pomodoro](18-pomodoro.md) | /pomodoro/ | Luna · high | Native clock/timer |
| [ ] | [19 — Stopwatch dengan lap](19-stopwatch.md) | /stopwatch/ | Luna · high | Native monotonic clock |
| [ ] | [20 — Pengacak daftar](20-pengacak-daftar.md) | /pengacak-daftar/ | Luna · high | Web Crypto |
| [ ] | [21 — Pembersih teks](21-pembersih-teks.md) | /pembersih-teks/ | Luna · medium | Shared UI/UTF-8 limits |
| [ ] | [22 — Konversi format gambar](22-konversi-format-gambar.md) | /konversi-format-gambar/ | Luna · high, per tahap | 00a fase I, API aktual |
| [ ] | [23 — Crop foto](23-crop-foto.md) | /crop-foto/ | Luna · high, per tahap | 00a fase I, API crop native |
| [ ] | [24 — Integrasi tambahan & SEO](24-extension-integration-seo.md) | Hub/sitemap/related/tests | Luna · high, per batch | Tool yang lulus |

Rekomendasi Luna didukung [OpenAI Docs](https://developers.openai.com/api/docs/models/gpt-6-luna); pilihan medium/high di atas adalah penilaian proyek. [Panduan pemilihan model](https://developers.openai.com/api/docs/guides/model-selection) menjadi dasar menjaga task terfokus. Harga API tidak dipakai sebagai estimasi penggunaan langganan Codex.

Urutan hemat: **14 → 16 → 21**, lalu task 24 untuk batch siap; **15 → 17**; **18 → 19 → 20**; terakhir **22 → 23** setelah fixture media kritis terbukti. Integrasi boleh diulang untuk batch kecil. Tidak perlu menyelesaikan PDF task 12 untuk mengerjakan tools teks/angka/timer ini.

Contoh prompt setelah memilih model:

~~~text
Kerjakan hanya docs/everyday-tools/14-terbilang.md.
Baca README.md, CONTRACT.md, EXTENSION-CONTRACT.md serta shared yang relevan.
Ikuti scope V1, ownership, fixture, SEO dan QA pada task.
Setelah bukti lulus, update checklist task dan hanya row 14 dalam README.
Catat sebagian bila ada QA/prasyarat pending. Jangan mengerjakan tool lain,
mengubah hub/sitemap/shared, atau commit/push/deploy.
~~~

Tools tambahan masih merupakan rencana: belum ada route, card, sitemap entry, atau fixture baru. Task 24 hanya menautkan implementasi yang siap. Task 12/PDF, checklist manual batch awal, dan verifikasi live tetap mempunyai status masing-masing.

## Urutan batch awal 00–13

1. **00**: kerjakan helper UI, angka, kalender, lalu template/tes sebagai tahap kecil dalam task yang sama. Selesaikan foundation sekali agar model murah tidak mengulang aturan dasar.
2. **Batch A: 01, 02, 03, 04, 08**, satu task per sesi; lanjutkan **13 untuk batch A**. Scope ringan dengan kegunaan teks, belanja, dan usaha kecil.
3. **Batch B: 05, 06, 07**, kemudian **00a fase Q → 09 → 13 untuk batch B**. Kalender/satuan butuh fixture tepat; QR perlu library browser dan decoder tes.
4. **Batch C: 00a fase I → 10 → 11 → 00a fase P → 12 → 13 untuk batch C**. Media membutuhkan pengujian orientasi/format/memori; task 12 dibagi urutan file, normalisasi, worker PDF, lalu QA.

Nomor adalah identitas task; tidak wajib menunggu semua nomor lebih kecil. Integrasi 13 boleh diulang setiap batch untuk menambahkan tools yang benar-benar selesai. Tidak perlu menunggu semua 12 tools agar batch awal bisa ditautkan saat eksekusi nanti.

## Cara menjalankan dengan model murah

- Baca [CONTRACT.md](CONTRACT.md) sebagai aturan bersama. Tiap task menyediakan file miliknya, scope V1, algoritme/batas, fixture, SEO, checklist selesai, dan **prompt siap tempel** di bagian akhir.
- Buka satu sesi dengan Luna sesuai tabel, tempel prompt satu task. Jangan meminta model mengimplementasikan seluruh folder sekaligus. Tidak perlu membaca semua dokumen tool yang tidak terkait.
- Fondasi media dan PDF dikerjakan per fase/tahap; tetap simpan hasil dalam task yang sama. Satu tahap boleh selesai dan dicatat tanpa menandai keseluruhan task selesai.
- Kalau fixture gagal: perbaiki satu penyebab dengan reproduksi kecil, ulangi tes terkait. Jika masih gagal, pecah langkah lebih kecil dengan Luna yang sama; catat yang tertunda. Tidak ada kewajiban atau perintah pindah ke model lebih mahal, menghapus tes, atau melonggarkan batas.
- Jalankan tes browser yang direncanakan **saat implementasi**, bukan pada sesi perencanaan ini. Shared/hub/sitemap hanya diubah oleh pemiliknya; jangan menjalankan dua task yang menulis file bersama bersamaan.
- Setelah selesai, executor melaporkan file berubah, fixture lulus/gagal, QA, keterbatasan dan memperbarui checklist. Tidak commit/push/deploy tanpa permintaan eksplisit sesi itu.

Contoh perintah singkat setelah memilih model:

```text
Kerjakan hanya docs/everyday-tools/01-penghitung-kata.md menggunakan kontrak dan prasyarat di folder yang sama. Jangan mengerjakan task lain. Setelah implementasi dan tes yang diwajibkan benar-benar lulus, update checklist task 01 serta baris tracker 01 di README. Bila ada prasyarat belum selesai, laporkan tanpa menandai task selesai. Jangan commit, push, atau deploy.
```

## Dasar pemilihan dan SEO

Prioritas didasarkan pada kegunaan yang berulang, scope statis, dan biaya implementasi; **bukan volume pencarian yang telah diukur**. Sampling hasil pencarian memperlihatkan kategori penghitung kata, diskon, link WA, foto, dan PDF sudah memiliki penyedia. Itu mendukung hipotesis intent sekaligus menunjukkan persaingan, bukan kepastian traffic. Detail sumber dan alasan tiap kelompok ada di [RESEARCH.md](RESEARCH.md).

Pembeda yang direncanakan: Bahasa Indonesia yang jelas, pemrosesan lokal, tanpa akun, cepat dipakai di ponsel, dan contoh perhitungan nyata. Halaman memiliki artikel unik, metadata/canonical, navigasi HTML dan related links sesuai fitur yang benar-benar ada. Evaluasi menggunakan data Search Console setelah publikasi/akses tersedia; jangan menambah halaman keyword duplikat hanya untuk jumlah URL.

Belum masuk scope: kurs real-time, pajak/peraturan, kalkulator kesehatan, AI penghapus background/OCR, editor PDF lengkap, link shortener server, atau PDF merger. Tools ini memerlukan data mutakhir, layanan tambahan, atau kompleksitas yang lebih tinggi. Pertimbangkan setelah tools awal menunjukkan penggunaan dan ada permintaan nyata.
