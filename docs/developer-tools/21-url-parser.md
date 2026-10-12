# 21 — URL Parser & Query Editor (D08)

Status: **Implementasi dan fixture browser selesai lokal pada 12 Oktober 2026. Sebagian edge fixtures/QA UI manual dan deployment live belum diverifikasi.** Model: **GPT-6 Luna · medium**. Path `/url-parser/`; canonical `https://edwinlab.dev/url-parser/`.

## Tujuan/scope/ownership

Inspeksi bagian URL dan **edit pasangan query yang berurutan**; melengkapi URL Encoder/Decoder existing yang berfokus transformasi encoding. V1 hanya URL absolut HTTP/HTTPS tanpa username/password. Query builder mempertahankan duplicate keys dan fragment. Tidak mengunjungi/fetch URL, memeriksa keamanan/reputasi link, resolve DNS, membersihkan tracking otomatis, atau mengedit struktur path/hostname lewat form.

Miliki `url-parser/{index.html,logic.js,tool.js}`, CSS khusus bila diperlukan, runner `tests/tools/url-parser.{test.js,html}`, task dan row 21 README. Baca CONTRACT/EXTENSION-CONTRACT/helper aktual. Vendor tidak dibutuhkan; integrasi task 24.

## TODO implementasi

- [x] Label URL input; Parse URL/Example/Clear; tampilkan protocol, hostname, port, origin, encoded pathname, fragment, normalized URL readonly.
- [x] Pure `parseURL` memakai native URL constructor, lalu allowlist protocol. Relative URL/unsupported scheme/userinfo ditolak dengan alasan scope. Nilai output textContent/value; jangan membuat link clickable/href/img/src dari input.
- [x] Tampilkan editor query rows name/value/add/remove/reorder; baris adalah ordered array, bukan object map. Empty key/value dan duplicate key diperbolehkan. Row id internal tidak diambil dari key user.
- [x] URLSearchParams untuk decode/rebuild. Karena decoding query dapat lossy, cek dahulu percent triplets dan UTF-8 valid pada komponen raw query (ubah+menjadi space untuk pemeriksaan decodeURIComponent); malformed `%`/invalid UTF-8 query ditolak terkontrol. Path tetap encoded dan tidak di-decode UI.
- [x] Build URL memakai array rows dengan append, bukan set yang meruntuhkan duplicates. Pertahankan pathname/fragment dari URL parsed; tombol Build URL menghasilkan hasil baru.
- [x] Jelaskan normalisasi browser: lowercase host, default port bisa dihapus; serialisasi query memakai+untuk spasi, `%2B` untuk plus literal, parameter bareflag menjadi `flag=`. Tidak menjanjikan byte-identical URL.
- [x] Batas URL input 16 KiB UTF-8, 256 query rows, name 512 dan value 4096 code points per row, total output 64 KiB. Periksa cumulative size sebelum membuat DOM/serialisasi; edits yang melebihi batas tidak menghasilkan output parsial.
- [x] Input URL berubah invalidate parsed state/rows/output; edits rows invalidate hasil Build/copy/download lama tetapi mempertahankan draft baris. Hindari data race tidak ada async parser.
- [x] Copy hasil dan Download text report memakai helper; report menggunakan filename konstan, tidak hostname/input. Contoh URL sintetis example.com.
- [x] Tidak ada query/hash/storage/telemetry input atau navigasi hasil otomatis.

## SEO/copy

- [x] Title `URL Parser & Query Parameter Editor | Edwin Lab`; H1 `URL Parser & Query Editor`.
- [x] Description `Inspect URL components and edit ordered query parameters, including duplicate keys and encoded characters. Parse and rebuild links locally in your browser.`
- [x] Guide contoh parameter duplicates, space versus plus, encoded path, fragment, normalisasi/batas. FAQ berbeda dari encoder existing: repeated key, default port, parameter flag, apakah URL dibuka.
- [x] Static HTML/canonical/OG/BreadcrumbList/lang=en; related `/url-encoder-decoder/`, `/base64/`, hub. Tidak menautkan backlog.

## Fixture/QA

- [x] `https://EXAMPLE.com:443/a?name=A%20B&name=C#top`→hostname `example.com`, port kosong, path `/a`; rows `[("name", "A B"), ("name", "C")]`; rebuild `https://example.com/a?name=A+B&name=C#top`.
- [ ] `https://example.com/?q=a+b&literal=a%2Bb`→q `a b`, literal `a+b`; rebuild preserves values/row order; removing only first duplicate tidak menghapus sibling.
- [x] `https://example.com/?flag&=empty&a=` → rows `[("flag", ""), ("", "empty"), ("a", "")]`; rebuild `https://example.com/?flag=&=empty&a=`. Empty key dan value dipertahankan.
- [ ] Query emoji/Unicode roundtrip; `a.b`, `__proto__`, `constructor` sebagai key literal tidak memodifikasi prototype.
- [ ] No query/no hash/IPv6/encoded path hasil sesuai native URL; invalid URL/relative/mailto/javascript/userinfo/%ZZ query/%FF query/batas lebih→error dan hasil lama disabled.
- [ ] Batas rows 256/257, raw byte limit, key/value limit dan output guard diuji tanpa request ke URL user.
- [ ] UI parse/edit/add/remove/build/clear/example/copy denied/direct refresh, keyboard, empat viewport, no-JS content, console/network.
- [x] Browser runner noindex/harness lulus; `git diff --check` bersih. Update task/row 21 README dengan bukti; partial jika QA belum tersedia.

## Prompt siap tempel

```text
Kerjakan hanya docs/developer-tools/21-url-parser.md.
Baca CONTRACT.md, EXTENSION-CONTRACT.md dan shared API/harness aktual. Rekomendasi Luna medium, dipilih manual.
Tahap 1 pure native URL/query logic dan fixture. Tahap 2 ordered row editor, static SEO dan QA browser.
Pertahankan duplicates/fragment dan jelaskan normalisasi. Jangan fetch/navigate URL input atau meruntuhkan rows ke object.
Hanya HTML CSS JS tanpa build; jangan edit hub/sitemap/shared/tool lain.
Update checklist task 21 dan row 21 README sesuai bukti. Jangan commit/push/deploy.
```

Sumber: [MDN URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), [WHATWG URL Standard](https://url.spec.whatwg.org/).

## Hasil eksekusi

Tool `url-parser/` memakai URL/URLSearchParams, menolak protocol non-HTTP(S)/userinfo, memvalidasi percent-encoding UTF-8, menjaga query duplicate/order, menyediakan add/remove/move/rebuild/copy/download. Browser runner: **6/6 passed**. Integration: **10/10 passed**, termasuk rebuild, report Blob, tanpa request, no-script, dan empat viewport. Edge fixtures sisanya dan keyboard/focus manual serta live deployment belum diverifikasi.
