# SEO 10 — Kinerja mobile dan regresi SEO

Status: **sebagian selesai**. Baseline PSI untuk enam target live sudah dicatat di [PERFORMANCE-CHECK.md](PERFORMANCE-CHECK.md). CrUX belum ada; pengukuran ulang setelah TODO 04–09 dipublikasikan masih pending. Temuan: [F09](AUDIT.md#f09--kinerja-mobile-belum-diukur).

## Scope

Ukur homepage, kedua hub, JSONLint, SQL formatter, dan kompres gambar dengan PageSpeed/Lighthouse atau alat yang tersedia. Pisahkan hasil lab dari CrUX/CWV field; traffic rendah mungkin membuat field data tidak tersedia. Jangan memberi nilai nol atau klaim pass jika data tidak ada.

Periksa loading awal serta interaksi tool: resource/byte weight, font/layout shift, worker startup dan input besar dalam batas existing. Optimalkan hanya masalah yang dapat direproduksi; source saat ini sudah memakai font lokal/swap, hub ringan, dan worker pada SQL/regex. Tidak perlu rewrite framework, minifikasi buta, menghilangkan label/FAQ, atau melepas guardrail input untuk mengejar skor.

Untuk perubahan batch01–09, perluas runner integrasi yang sudah ada hanya pada invariant SEO yang penting dan belum terjaga: unique metadata/canonical/hierarchy serta exclusions. Jangan menggandakan semua fixture tool. Seluruh 26 canonical tetap punya file, title/description unik, satu H1, lang tepat, link/asset valid, indexable, dan sitemap benar; runner/template/legacy sesuai kebijakan noindex.

## Checklist penerimaan

- [x] Baseline lab per URL, tanggal, device, throttling dan versi dicatat; data field dilaporkan No Data.
- [x] LCP/CLS dibandingkan dengan target panduan; TBT dipisahkan dan tidak disebut INP.
- [x] Tidak ada bottleneck pengalaman yang terbukti; tidak dilakukan optimasi kosmetik/rewrite.
- [ ] Re-run 320/390/768/1440 viewport setelah TODO 05 belum dapat dilakukan di browser lokal; source dan existing runner memiliki breakpoint/focus/no-JS checks.
- [x] Existing runner kini menjaga breadcrumb/person dan OG cards; syntax runner lolos. Source audit statis memeriksa 26 canonical route, unique title/description, lang/H1, seluruh 38 JSON-LD blocks, dan OG asset path. Browser execution menunggu local preview server.
- [x] Tidak mengulang tes tool yang tidak terdampak; task sebelumnya menjalankan checks copy, breadcrumbs, metadata dan JSON-LD terkait.
- [x] Bukti, batas dan keputusan dicatat; `git diff --check` lulus. Pengukuran ulang setelah perubahan live masih diperlukan.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/10-performance-validation.md. Ukur sebelum mengubah, bedakan lab dari CrUX/field dan jangan memberi skor jika data tidak ada. Optimalkan hanya bottleneck nyata dengan tetap HTML/CSS/vanilla JS, guardrail dan workers. Perluas runner existing seperlunya untuk regresi SEO tanpa menduplikasi fixture. Catat hasil/device/before-after dan validasi26 canonical routes. Update checklist/README; jangan commit, push atau deploy.
```
