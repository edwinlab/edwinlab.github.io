# Draft distribusi dan evaluasi

Status: draft editorial, belum dipublikasikan. Tidak ada data Search Console atau analytics yang terverifikasi pada sesi ini. Tiga pilihan di bawah adalah **hipotesis kebutuhan**, bukan klaim volume pencarian atau ranking. Karena source blog belum ditemukan, setiap draft mengarah ke halaman tool yang sudah ada; jangan membuat blog placeholder.

## Brief halaman dan demo

### 1. JSONLint — kesalahan koma di akhir object

- Audience: developer yang menerima respons API atau mengedit konfigurasi JSON.
- Hipotesis query: “JSON trailing comma error”, “JSON single quotes invalid”.
- Intent: mengetahui penyebab parser gagal dan cara memperbaiki sintaks.
- Demo sintetis: input `{"name":"Edwin",}` gagal karena koma setelah property terakhir; hapus koma menjadi `{"name":"Edwin"}`. Input `{'name':'Edwin'}` harus memakai tanda kutip ganda.
- Output/limit: validator menunjukkan error syntax; bukan validasi schema API. Contoh tersebut sudah tersedia di halaman, jadi post pendek menautkan contoh dan tidak menyalin tutorial panjang.
- Link: `https://edwinlab.dev/jsonlint/`.

### 2. Link WhatsApp — buat link lalu jadikan QR

- Audience: usaha kecil, acara, atau individu yang ingin memberi tautan chat dan QR cetak.
- Hipotesis query: “buat link WhatsApp dengan pesan”, “buat QR link WhatsApp”.
- Intent: memahami alur WhatsApp → QR tanpa mengetik pesan otomatis.
- Demo: masukkan nomor sendiri di tool, buat link, periksa URL, lalu gunakan URL itu pada Pembuat QR Code. Jangan menaruh nomor atau pesan milik orang di posting; tidak mengklaim pesan terkirim otomatis.
- Batas: nomor/pesan masuk ke URL ketika pengguna membuka atau membagikan hasil; nomor perlu format Indonesia yang didukung. Halaman menjelaskan bahwa pesan baru terkirim setelah tombol kirim ditekan di WhatsApp.
- Link: `https://edwinlab.dev/link-whatsapp/` dan `https://edwinlab.dev/pembuat-qr-code/`.

### 3. Kalkulator Diskon — diskon bertingkat

- Audience: pembeli atau pengelola toko yang ingin membandingkan promo.
- Hipotesis query: “diskon 20 persen lalu 10 persen”, “cara menghitung diskon bertingkat”.
- Intent: memahami bahwa diskon kedua dihitung dari harga yang sudah berkurang.
- Demo sintetis terverifikasi: Rp200000 −20% = Rp160000; lalu −10% = Rp144000. Total hemat Rp56000 atau 28%, bukan 30%.
- Batas: tiap tahap membulatkan harga ke Rp0,01 terdekat; struk toko dapat memakai kebijakan lain. Tidak memasukkan pajak atau ongkir.
- Link: `https://edwinlab.dev/kalkulator-diskon/`.

Konten utama ketiga contoh tersebut sudah ada pada halaman yang sesuai; artikel terpisah belum diperlukan karena belum ada bukti bahwa intent membutuhkan tutorial berbeda.

## Draft LinkedIn

### Draft 1 — JSONLint

> JSON looks almost right, but one trailing comma can still make a payload invalid. Edwin Lab’s JSON Validator shows the syntax error and can format or minify valid JSON in the browser. It checks JSON syntax, not your API schema.
>
> Try it: https://edwinlab.dev/jsonlint/?utm_source=linkedin&utm_medium=social&utm_campaign=developer_tool_demo

Audience: software developers. Goal: useful discovery and visits to JSONLint. Keep the synthetic example in the post; do not paste a customer payload.

### Draft 2 — link WhatsApp and QR

> Ingin membagikan link WhatsApp dalam bentuk QR? Buat link dulu, periksa nomor dan pesan awalnya, lalu masukkan URL ke Pembuat QR Code. Link hanya menyiapkan chat; pesan baru terkirim setelah Anda menekan tombol kirim di WhatsApp.
>
> Pembuat link: https://edwinlab.dev/link-whatsapp/?utm_source=linkedin&utm_medium=social&utm_campaign=everyday_tool_demo
> Pembuat QR: https://edwinlab.dev/pembuat-qr-code/?utm_source=linkedin&utm_medium=social&utm_campaign=everyday_tool_demo

Audience: Indonesian small businesses, event organizers, and general users. Goal: demonstrate the two-step workflow without exposing a real number or message.

### Draft 3 — diskon bertingkat

> Diskon 20% lalu 10% bukan diskon 30%. Dari Rp200000, diskon pertama membuat harga Rp160000; diskon kedua membuatnya Rp144000. Total hemat Rp56000 atau 28%.
>
> Coba hitung: https://edwinlab.dev/kalkulator-diskon/?utm_source=linkedin&utm_medium=social&utm_campaign=everyday_tool_demo

Audience: Indonesian consumers and shop operators. Goal: explain the arithmetic and point to the calculator.

All copy is a review draft. No post, message, community submission, or repository outside this project has been sent or edited.

## Measurement plan

Save the actual publication date and final canonical URL only after a post is genuinely published. Suggested cadence: one post per week, then compare each post with its own first 28-day window. The dates are intentionally not booked. Keep UTM values fixed and non-sensitive; canonical tags stay query-free.

Record Search Console clicks, impressions, CTR, average position, query, page, country, and device for the same date range. Add tool success, copy, download, and contact events only after TODO 11 provider configuration is confirmed. Use page readiness and user utility—not a universal rank threshold—to select follow-up:

- Impressions with relatively few clicks: inspect the query and snippet, then revise title/description only if the page does not answer the intent clearly.
- Visits without successful tool use: inspect task instructions, errors and mobile interaction before expanding content.
- Repeated relevant query with successful tool use: consider an example or tutorial only if it adds a distinct answer.

No baseline is available yet, so no numerical uplift target or causal claim is assigned.
