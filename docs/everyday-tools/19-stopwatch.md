# 19 — Stopwatch dengan Lap

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**.
Route /stopwatch/; canonical https://edwinlab.dev/stopwatch/.

## Scope V1 dan ownership

Stopwatch start/pause/resume/reset dengan lap, durasi tiap lap dan durasi total. Alat pencatat waktu sederhana; tidak countdown, timer fokus, alarm, benchmark hardware, akun atau penyimpanan setelah reload.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT, shared UI dan sumber clock.
- [ ] Miliki stopwatch/index.html, logic.js, tool.js, CSS opsional; tests/everyday/stopwatch.html dan .test.js; dokumen/row19.
- [ ] Pure state/transitions memakai nowMs parameter. Runtime memakai performance.now monotonik dalam konteks halaman yang sama, bukan jumlah callback atau Date.now.

## Waktu, lap, dan UI

- [ ] State idle/running/paused/limit; elapsed=accumulated+(running?now-startedAt:0), tanpa memasukkan waktu paused. Resume meneruskan accumulated. Reset duration/laps ke0 dan membersihkan interval.
- [ ] Batas24 jam (86400000ms); clamp dan stop di batas dengan status. Display HH:MM:SS.cc menggunakan floor(milliseconds/10), dua digit centisecond; ini resolusi tampilan, bukan jaminan akurasi10ms.
- [ ] Render maksimal sekitar10 kali/detik; waktu aktual dari clock setiap render, tidak increment100ms. Visibility/pagehide/pageshow mengelola satu scheduler; tab hidden dapat melewatkan update lalu display disinkronkan saat kembali.
- [ ] Lap hanya saat running dan belum cap100. Simpan {index,cumulativeMs,lapMs}; lapMs=currentElapsed-lastLapCumulative. Tombol disabled saat paused/idle/cap; pesan cap tidak menghentikan stopwatch.
- [ ] Tabel row oldest→newest dengan nomor, durasi lap, total. Lap setelah resume tidak memasukkan durasi pause. Lap ganda pada timestamp sama menghasilkan0, bukan error/angka negatif.
- [ ] Start/Jeda/Lanjutkan/Reset/Lap, Salin ringkasan, Unduh TXT. Copy/download hanya saat paused atau limit agar hasil snapshot stabil; di-enable bila ada durasi/lap. Ekspor menyertakan total dan seluruh laps dalam urutan tampil.
- [ ] Reset menghapus ekspor lama; output tidak di-query/storage. Display clock bukan aria-live per tick; announce state/cap saja. Refresh menghapus sesi; jelaskan timing saat device sleep dapat berbeda menurut browser.

## Fixture wajib

- [ ] Start1000; now2234→1234ms→00:00:01.23. Pause2234; now9000 masih1234; resume10000 dan now10566→1800ms.
- [ ] Lap pertama pada1000ms→lap1000/total1000; kedua pada2500ms→lap1500/total2500; pause2 detik lalu resume dan tambah500ms→lap500.
- [ ] Formatting0/9/10/999/1000/60000/3600000/86400000; cap24h tepat dan callback terlambat; tidak membungkus jam ke0.
- [ ] 100lap diterima, lap101 tidak dibuat; reset setelah cap dapat mulai lagi. Double-start/resume tidak membuat dua scheduler; idle/paused Lap disabled.
- [ ] Jam sistem berubah tidak memengaruhi injected monotonic state; callback skipped/visibility/bfcache rekonsiliasi benar. Fake clock untuk batas24jam, clock nyata untuk browser start/pause/lap.
- [ ] Copy/export snapshot text/MIME/filename benar, denial fallback, reset stale, UI keyboard/no-JS/viewport.

## Konten, SEO, dan selesai

- [ ] Title "Stopwatch Online dengan Lap | Edwin Lab"; H1 "Stopwatch Online".
- [ ] Description "Catat durasi dengan stopwatch online. Jeda dan lanjutkan waktu, simpan lap selama sesi, lalu salin atau unduh ringkasannya."
- [ ] Panduan start/lap/pause/export, contoh lap1=1detik/lap2=1,5detik, batas24jam/100lap, refresh/sleep, resolusi tampilan. FAQ "Apakah waktu jeda dihitung?", "Apa bedanya lap dan total?", "Apakah sesi tersimpan?".
- [ ] Metadata statis sesuai kontrak. Related hub; Pomodoro oleh task24 setelah siap.
- [ ] Fixture+QA kontrak lulus; clock lifecycle dan keyboard diuji. Catat evidence/limitations; update row19 sendiri.

Sumber: [Performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) menggunakan clock monotonik, namun tick saat sistem sleep berbeda antar browser. Jangan mengklaim stopwatch presisi untuk pengukuran resmi.

~~~text
Kerjakan hanya docs/everyday-tools/19-stopwatch.md dengan rekomendasi Luna high.
Baca kontrak/UI actual. Stopwatch memakai monotonic elapsed+accumulated, cap24h,
100lap dengan delta/total, pause/resume/reset dan snapshot export saat paused.
Gunakan pure clock injection untuk fixture dan native clock untuk UI, tanpa storage/alarm.
HTML/CSS/JS buildless, copy/SEO Indonesia; jalankan QA dan update task/row19.
Jangan ubah shared/tool lain/hub/sitemap atau commit/push/deploy.
~~~
