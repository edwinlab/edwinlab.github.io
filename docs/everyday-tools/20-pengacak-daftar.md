# 20 — Pengacak Daftar / Pilih Nama Acak

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**.
Route /pengacak-daftar/; canonical https://edwinlab.dev/pengacak-daftar/.

## Scope V1 dan ownership

Pilih 1–100 entri dari daftar satu per baris tanpa replacement, memakai Web Crypto. Cocok untuk urutan aktivitas atau pilihan kecil. Tidak wheel animation, giveaway platform, verifikasi peserta, pembagian kelompok, sertifikat undian atau hasil yang bisa diaudit publik.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT, shared UI/limits serta sumber random native.
- [ ] Miliki pengacak-daftar/index.html, logic.js, tool.js, CSS opsional; tests/everyday/pengacak-daftar.html dan .test.js; task/row20.
- [ ] Tidak ada library/dependency baru. Pure sampling menerima nextUint32 injection untuk fixture; production mengambil Uint32Array lewat crypto.getRandomValues.

## Daftar dan random

- [ ] Input≤256KiB UTF-8, maksimal1000 entri nonblank, setiap label≤200 Unicode code points setelah trim ASCII tepi. Normalisasi line endings; abaikan blank rows. Entri duplicate dipertahankan sebagai tiket/baris terpisah, dijelaskan dekat input.
- [ ] Jumlah dipilih integer1–min(100,n), ASCII saja. Tidak ada hasil jika tidak ada entri atau k di atas n.
- [ ] randomInt(bound), 1≤bound≤1000: range=2^32; cutoff=floor(range/bound)×bound; ambil uint32 sampai value<cutoff; return value%bound. Tidak modulo langsung untuk seluruh ruang atau Math.random fallback.
- [ ] Maksimal64 percobaan reject per draw; source invalid/unavailable/exhausted menghasilkan RANDOM_UNAVAILABLE atau RANDOM_FAILURE, tanpa partial result. Injection diuji bertipe integer uint32.
- [ ] Partial Fisher–Yates pada copy entri; untuk i=0…k-1 pilih j=i+randomInt(n-i), swap lalu ambil i. Source tidak dimutasi; hasil urutan adalah urutan pemilihan.
- [ ] Output label dan nomor entri 1-based dalam daftar yang telah membuang blanks. Dua label identik dapat muncul bila berasal dari entri berbeda; tidak ada index yang dipilih dua kali.
- [ ] UI Pilih acak, Contoh, Bersihkan, Salin hasil, jumlah dipilih. Edit input/k menghapus hasil/copy; klik ulang memilih ulang tanpa histori. Dynamic labels textContent; contoh10 nama sintetis.
- [ ] Web Crypto unavailable memberi error dan input tetap. Jangan mengklaim tidak bisa dimanipulasi/cocok undian resmi hanya karena memakai API crypto.

## Fixture wajib

- [ ] Bound1 selalu0; bound3 menolak0xffffffff lalu menerima value4→index1; stub64 rejected draws→controlled error. Invalid/infinite/negative/out-of-range source ditolak.
- [ ] Sampling A/B/C/D k3 dengan nextUint32 berurutan [1,2,0] → B(index2), D(index4), C(index3) pada algoritme partial Fisher–Yates di atas. Uji n/k boundary, source unchanged dan no repeated indexes.
- [ ] ["A","A","B"] diperlakukan sebagai3 entri; memilih semua bisa menghasilkan dua A dengan index berbeda. Blank/trailing newline tidak menjadi peserta.
- [ ] cap1000 entries/100selected/200codepoints/256KiB tepat dan cap+1. Emoji count sebagai code point, label HTML-looking tetap literal. Parser tidak deduplicate diam-diam.
- [ ] Native Web Crypto flow di browser, random API failure injected, no partial output, copy success+denied/stale/clear. Tidak memakai tes distribusi random yang flaky sebagai acceptance.

## Konten, SEO, dan selesai

- [ ] Title "Pengacak Daftar dan Nama Online | Edwin Lab"; H1 "Pengacak Daftar".
- [ ] Description "Pilih nama atau entri secara acak dari daftar, satu per baris. Atur jumlah pilihan tanpa memilih baris yang sama dua kali."
- [ ] Cara pakai, duplicate policy dan index, batas, contoh daftar sederhana. FAQ "Bisa nama yang sama muncul?", "Apakah daftar disimpan?", "Apakah ini undian yang tersertifikasi?".
- [ ] Metadata/noscript/breadcrumb mengikuti kontrak; related penghitung-kata/hub. Pembersih-teks ditambahkan task24 bila siap, dengan warning dedup mengubah peluang.
- [ ] Fixture/QA kontrak lulus; safe rendering, no network/storage, viewport/keyboard/direct refresh; update task/row20 berdasarkan bukti.

Sumber: [Crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues). Rejection sampling dan batas di atas adalah kebijakan adapter tool.

~~~text
Kerjakan hanya docs/everyday-tools/20-pengacak-daftar.md dengan Luna high.
Baca kontrak/shared aktual. Implementasi crypto rejection sampling+partial Fisher–Yates,
1–100 hasil dari <=1000 baris, duplicate sebagai entri terpisah, source unchanged.
Tanpa Math.random fallback, wheel, giveaway API atau storage. UI/SEO Indonesia,
HTML/CSS/JS statis; fixture deterministic dan native browser flow wajib.
Update task/row20 berdasarkan bukti; jangan ubah shared/hub/sitemap/tool lain atau deploy.
~~~
