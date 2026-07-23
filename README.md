# WA Bot Toko — AI, Sticker, Downloader, Anti-Call

Bot WhatsApp lengkap: chat AI, pembuat stiker, downloader TikTok/Instagram,
anti panggilan telepon, dan toko online dengan menu produk bergambar.
Dibuat pakai **Baileys** (ringan, tanpa Chromium) supaya bisa jalan cuma dari HP.

## Struktur Folder
```
wa-bot-toko/
├── index.js                  # File utama bot
├── config.js                 # Pengaturan bot + daftar produk toko
├── .env.example               # Contoh isi API key (salin jadi .env)
├── handlers/
│   ├── aiHandler.js          # Fitur chat AI
│   ├── stickerHandler.js     # Fitur pembuat stiker
│   ├── downloaderHandler.js  # Fitur download TikTok/Instagram
│   ├── storeHandler.js       # Fitur toko
│   └── callHandler.js        # Fitur anti-call
└── products/images/          # Taruh foto produk toko di sini
```

## Cara Menjalankan di HP (Termux) — Tanpa Laptop/PC

### 1. Install Termux
Download **Termux** dari F-Droid (bukan Play Store, versi Play Store sudah tidak update):
https://f-droid.org/en/packages/com.termux/

### 2. Setup Termux
Buka Termux, jalankan satu-satu:
```bash
pkg update -y && pkg upgrade -y
pkg install nodejs-lts git -y
```

### 3. Pindahkan file bot ke HP
- Download semua file bot ini (tombol download di chat).
- Ekstrak/pindahkan ke folder Termux, misal:
```bash
cd ~
# pindahkan folder wa-bot-toko ke sini via file manager, atau
termux-setup-storage   # kasih izin akses storage HP dulu
cp -r /sdcard/Download/wa-bot-toko ~/wa-bot-toko
cd ~/wa-bot-toko
```

### 4. Install dependency
```bash
npm install
```

### 5. Siapkan API Key AI (opsional tapi disarankan)
```bash
cp .env.example .env
nano .env
```
Isi `AI_API_KEY` kamu. Rekomendasi mudah & gratis: **Groq** (https://console.groq.com) —
daftar gratis, ambil API key, model cepat. Simpan file dengan `CTRL+O`, `Enter`, `CTRL+X`.

### 6. Tambahkan Foto Produk
Taruh foto produk (misal `ml_diamond.jpg`, `ff_diamond.jpg`, dst — nama harus
sama persis dengan yang ditulis di `config.js`) ke folder `products/images/`.
Kamu bisa edit daftar produk (nama, harga, deskripsi) langsung di `config.js`.

### 7. Jalankan Bot
```bash
npm start
```
Bot akan menampilkan **kode pairing** di layar (bukan QR). Buka WhatsApp di HP kamu:
**Setelan → Perangkat Tertaut → Tautkan Perangkat → Tautkan dengan nomor telepon**,
lalu masukkan kode tersebut. Setelah itu bot langsung aktif.

### 8. Supaya Bot Tetap Nyala (Fast Response 24 Jam)
HP biasa akan mematikan proses saat layar mati atau baterai hemat aktif. Supaya bot
tetap jalan terus:
```bash
termux-wake-lock
```
Lalu di setelan baterai HP, cari Termux → set "Tidak dibatasi / Unrestricted".
Install juga **Termux:Boot** dari F-Droid supaya bot otomatis nyala lagi kalau HP restart.

**Catatan penting:** kalau HP kamu sering dipakai, restart, atau internetnya putus,
bot ikut mati/lag. Untuk performa "fast response" yang stabil 24 jam nonstop tanpa
gangguan, cara paling profesional adalah pindahkan bot ini ke **VPS murah**
(mulai ~Rp15-30rb/bulan, contoh Contabo/Biznet Gio/Alibaba Cloud). Kodenya sama
persis, cukup upload dan jalankan `npm install && npm start` di VPS. HP kamu jadi
tidak perlu nyala terus.

## Daftar Perintah Bot
| Command | Fungsi |
|---|---|
| `.menu` | Tampilkan menu bantuan |
| `.ai <pertanyaan>` | Chat dengan AI |
| `.sticker` (reply/kirim foto atau video pendek) | Buat stiker |
| `.tiktok <link>` | Download video TikTok tanpa watermark |
| `.ig <link>` | Download foto/video dari Instagram |
| `.toko` | Buka menu toko |
| `.beli <id produk>` | Pesan produk, contoh `.beli ml1` |

## Catatan Fitur Downloader
API downloader Instagram gratis di internet sering berubah/tidak stabil (bukan
resmi dari Meta). Kalau fitur `.ig` error, buka `handlers/downloaderHandler.js`
dan ganti URL endpoint dengan API downloader IG lain yang masih aktif — banyak
tersedia gratis, tinggal cari di internet "api downloader instagram gratis".
Fitur `.tiktok` pakai tikwm.com yang umumnya lebih stabil.

## Keamanan
- Jangan bagikan folder `session/` ke siapapun — isinya kredensial login WA kamu.
- Jangan upload `.env` (berisi API key) ke tempat publik/GitHub publik.
