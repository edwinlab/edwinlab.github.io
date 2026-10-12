# PageSpeed Insights — baseline

Tanggal pengukuran: **12 Oktober 2026, 11:30–11:33 WIB**. Sumber: Google PageSpeed Insights, Lighthouse 13.5.0, Chrome 153.0.8010.36. Pengujian mobile memakai Moto G Power emulated, initial page load, throttling Slow 4G. Ini hasil lab satu kali per route, bukan distribusi field/CrUX dan bukan sertifikasi Core Web Vitals.

Semua enam halaman menampilkan **No Data** untuk pengalaman pengguna nyata (CrUX). Hub dan tool harian/dev masing-masing meraih skor Performance 100. Homepage mobile meraih 98; desktop meraih 100. LCP lab seluruh halaman 1,1 detik atau di bawahnya; CLS 0–0,002; TBT 0 ms. Speed Index tercatat terpisah di tabel. Variasi satu kali uji dapat terjadi.

| Halaman | Performance mobile | FCP | LCP | TBT | CLS | Speed Index | Laporan |
|---|---:|---:|---:|---:|---:|---:|---|
| Homepage | 98 | 0,9 dtk | 1,1 dtk | 0 ms | 0 | 3,9 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev/je32uuxm3p?form_factor=mobile) · [Desktop](https://pagespeed.web.dev/analysis/https-edwinlab-dev/je32uuxm3p?form_factor=desktop) |
| Developer Tools | 100 | 1,1 dtk | 1,1 dtk | 0 ms | 0 | 2,4 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev-tools/tfn6cibagf?form_factor=mobile) |
| Alat Online | 100 | 1,1 dtk | 1,1 dtk | 0 ms | 0 | 2,4 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev-alat/ghff9tmjwv?form_factor=mobile) |
| JSONLint | 100 | 1,1 dtk | 1,1 dtk | 0 ms | 0,002 | 1,1 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev-jsonlint/vmfv4zyeai?form_factor=mobile) |
| SQL Formatter | 100 | 1,1 dtk | 1,1 dtk | 0 ms | 0,002 | 1,1 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev-sql-formatter/0vhb9vlwtf?form_factor=mobile) |
| Kompres Gambar | 100 | 1,1 dtk | 1,1 dtk | 0 ms | 0 | 2,4 dtk | [Mobile](https://pagespeed.web.dev/analysis/https-edwinlab-dev-kompres-gambar/0eekwykec2?form_factor=mobile) |

Homepage desktop: Performance 100, FCP 0,3 dtk, LCP 0,3 dtk, TBT 0 ms, CLS 0,002, Speed Index 0,6 dtk. Captured 11:30 WIB.

## Temuan dan keputusan

- PSI mengidentifikasi render-blocking requests dengan estimasi penghematan 270 ms pada homepage dan 410–600 ms pada lima halaman lain. Homepage mobile tetap memiliki LCP 1,1 dtk dan score 98; tool pages 100. Tidak ada bukti masalah pengalaman yang membenarkan rewrite CSS/JavaScript.
- PSI memperkirakan cache-lifetime savings 37–62 KiB pada tool pages dan 55 KiB pada homepage. Header cache berada di kontrol hosting; nilai itu bukan bukti pengguna mengalami lambat. Jangan mengubah hosting atau menambahkan service worker untuk satu audit lab.
- Homepage juga menunjukkan satu long task; Performance category tetap baik. Diagnosis interaction lebih jauh perlu rekaman dan kondisi penggunaan nyata.
- Tidak ada perubahan produk berbasis skor. Baseline menguji versi live sebelum source TODO 04–09 lokal ini diterbitkan; ukur ulang setelah publikasi.
- Runner yang ada sudah memeriksa seluruh sitemap/canonical, exclusions test, dan layout 320/390/768/1440 px untuk hub. Respons HTTP/header serta direct refresh publik tetap tugas 03; local browser runner belum dapat dibuka karena server localhost tidak tersedia.
