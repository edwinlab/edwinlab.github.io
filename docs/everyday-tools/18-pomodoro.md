# 18 — Timer Pomodoro

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**.
Route /pomodoro/; canonical https://edwinlab.dev/pomodoro/.

## Scope V1 dan ownership

Timer fokus dan istirahat yang dimulai pengguna, dengan jeda/lanjut/reset dan hitungan sesi fokus selesai. Default 25 menit fokus dan 5 menit istirahat. Tidak ada auto-cycle, long break, akun, penyimpanan sesi, suara, notifikasi, izin browser, atau klaim manfaat kesehatan/produktivitas yang terukur.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT dan API UI aktual.
- [ ] Miliki pomodoro/index.html, logic.js, tool.js, CSS opsional; tests/everyday/pomodoro.html dan pomodoro.test.js; task/row 18.
- [ ] Logic berupa state machine/pure transition dengan nowMs eksplisit; DOM memakai Date.now sebagai clock wall-time. Timer interval hanya memperbarui display, bukan sumber hitungan.

## Clock, fase, dan kontrol

- [ ] Durasi fokus integer1–180 menit, istirahat1–60; format ASCII integer, tidak desimal/eksponen/plus. Opsi hanya bisa diedit saat idle; mengubahnya reset state ke fokus idle dan count0.
- [ ] State phase=focus|break; status=idle|running|paused|completed; simpan runBaseRemaining dan deadline. Start/resume: deadline=now+remaining. Running: remaining=min(runBaseRemaining,max(0,deadline-now)); display detik=ceil(remaining/1000).
- [ ] Pause mengambil snapshot remaining pada clock klik; resume tidak memulai durasi penuh. Reset membersihkan interval dan count, kembali fokus idle dengan durasi current.
- [ ] Completion stop pada0, increment count hanya bila focus selesai dan hanya sekali. Fokus selesai menawarkan Mulai istirahat; istirahat selesai menawarkan Mulai fokus berikutnya. **Fase berikutnya tidak berjalan sebelum klik**. Jangan mengejar beberapa siklus ketika tab kembali.
- [ ] Tampilkan MM:SS, label fase, count fokus selesai. Mulai/Jeda/Lanjutkan/Reset sesuai state, aksi next-phase hanya setelah completion. Tidak ada dua interval akibat double click.
- [ ] Rekonsiliasi state pada visibilitychange/pageshow; tab hidden boleh tidak merender setiap tick, tetapi remaining dihitung ulang dari deadline saat kembali. pagehide membersihkan interval; bfcache pageshow membuat paling banyak satu interval.
- [ ] Jam sistem yang berubah dapat mengubah countdown; nilai tetap clamped. Jelaskan reload/closed-tab reset sesi dan alarm tidak dijamin ketika browser/perangkat tidur. Tidak meminta agar browser terus berjalan di background.
- [ ] Clock display bukan aria-live per detik. Status accessible diumumkan hanya saat start/pause/resume/completion/error. Reset dan focus controls keyboard bekerja.

## Fixture wajib

- [ ] Clock injeksi: fokus25 menit mulai t=0; t=1499000 →display00:01, t=1500000→completed00:00/count1; update ulang tidak increment lagi.
- [ ] Fokus1 menit start1000, pause11000→remaining50000; advance clock1000000 saat paused tetap50000; resume2000000→deadline2050000; completion tepat.
- [ ] Next-phase tidak otomatis start. Break selesai tidak increment focus count. Reset running/paused/completed tidak membiarkan tick lama mengubah state.
- [ ] Callback telat/visibility return melewati deadline menyelesaikan current phase sekali. Clock mundur tidak memberi remaining melebihi runBaseRemaining; maju jauh clamped0.
- [ ] Duration cap/cap+1/0/desimal/empty/eksponen; double-start/double-pause/completion/reset transitions; tidak interval leak setelah pagehide/pageshow.
- [ ] Browser memakai clock nyata untuk start/pause/resume singkat; gunakan clock injection untuk durasi panjang, tidak menunggu25 menit atau background sleep sebagai satu-satunya tes.

## Konten, SEO, dan selesai

- [ ] Title "Timer Pomodoro Online — Fokus dan Istirahat | Edwin Lab"; H1 "Timer Pomodoro".
- [ ] Description "Atur waktu fokus dan istirahat dengan timer Pomodoro. Mulai, jeda, lanjutkan, dan hitung sesi fokus tanpa akun atau penyimpanan data."
- [ ] Artikel statis: langkah fokus25/istirahat5, durasi custom, start next-phase manual, batas tab/sleep/reload. FAQ "Apakah istirahat mulai otomatis?", "Apa yang terjadi setelah refresh?", "Apakah ada suara atau notifikasi?".
- [ ] Metadata/breadcrumb/noscript kontrak; related hub saja sampai stopwatch siap oleh task24. Tidak menambah schema live countdown atau timer ke URL.
- [ ] Fixture dan QA kontrak lulus; test no ticking aria-live, keyboard, empat viewport, lifecycle, direct+refresh/no-JS.
- [ ] Catat files/clock recipe/evidence/limitations dan update task/row18 sendiri.

Sumber: [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) menjelaskan throttling background; deadline dihitung ulang ketika view kembali. Pemilihan wall clock adalah keputusan produk untuk durasi panjang dengan batas perubahan jam yang dijelaskan.

~~~text
Kerjakan hanya docs/everyday-tools/18-pomodoro.md dengan rekomendasi Luna high.
Baca kontrak/UI actual. Buat timer deadline wall-clock dengan state pure+clock injection,
manual next-phase, pause/resume/reset dan completion once. Tidak tick decrement,
auto-cycle, storage, suara atau notifications. UI/SEO Indonesia, HTML/CSS/JS statis.
Jalankan fixture clock/lifecycle/batas dan QA browser singkat; update task dan row18.
Jangan ubah shared/tool lain/hub/sitemap atau commit/push/deploy.
~~~
