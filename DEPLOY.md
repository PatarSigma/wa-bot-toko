# Panduan Lengkap Dari Awal — Upload ke GitHub & Deploy 24 Jam (100% dari HP)

Semua langkah di bawah bisa dikerjakan pakai browser HP kamu, tidak butuh PC/laptop.

---

## BAGIAN 1 — Buat Akun GitHub

1. Buka browser HP, kunjungi **https://github.com**
2. Tap **Sign up**, isi email, buat password, buat username.
3. Verifikasi email kamu (cek inbox, klik link konfirmasi).
4. Login ke akun GitHub kamu.

---

## BAGIAN 2 — Buat Repository Baru

1. Di halaman utama GitHub, tap ikon **+** di pojok kanan atas → **New repository**.
2. Isi:
   - **Repository name**: `wa-bot-toko`
   - **Visibility**: pilih **Private** (supaya kode & pengaturanmu tidak bisa dilihat orang lain)
3. Tap **Create repository**.

---

## BAGIAN 3 — Upload File Bot ke GitHub

1. Extract dulu file `wa-bot-toko.zip` yang sudah kamu download. Di HP Android bisa
   pakai app **Files by Google** atau file manager bawaan (biasanya ada opsi "Extract"
   kalau tap-and-hold file zip).
2. Di halaman repository GitHub yang baru dibuat, tap **uploading an existing file**
   (atau menu **Add file → Upload files**).
3. Pilih/drag semua file & folder hasil extract tadi (index.js, config.js, package.json,
   folder handlers/, folder products/, README.md, .gitignore, .env.example).
   > ⚠️ **JANGAN** upload folder `session/` dan file `.env` kalau sudah kamu isi API key —
   > itu berisi data rahasia. `.gitignore` sudah mengatur ini otomatis kalau kamu pakai
   > cara git clone/push, tapi kalau upload manual lewat web, cek dulu manual jangan
   > sampai ke-upload.
4. Scroll ke bawah, tap **Commit changes**.

Kalau upload manual lewat web terasa ribet karena banyak folder, cara alternatif lebih rapi
pakai Termux (lanjut ke Bagian 3B).

### BAGIAN 3B (Alternatif) — Upload via Termux dengan Git

Kalau kamu sudah setup Termux dari panduan sebelumnya:

```bash
cd ~/wa-bot-toko
pkg install git -y
git init
git add .
git commit -m "Bot pertama saya"
git branch -M main
git remote add origin https://github.com/USERNAME/wa-bot-toko.git
git push -u origin main
```

Saat diminta login, GitHub sekarang butuh **Personal Access Token** (bukan password biasa):
1. Buka github.com → foto profil → **Settings** → scroll ke **Developer settings**
2. **Personal access tokens** → **Tokens (classic)** → **Generate new token**
3. Centang scope **repo**, generate, **copy token itu** (cuma muncul sekali)
4. Saat `git push` minta password, paste token itu (bukan password akun GitHub biasa)

---

## BAGIAN 4 — Buat Akun Railway (Hosting Gratis/Murah)

1. Buka **https://railway.app**
2. Tap **Login**, pilih **Login with GitHub**, izinkan akses.
3. Kamu akan dapat jatah gratis (trial credit) untuk mulai, setelah itu bayar sesuai
   pemakaian (bot kecil seperti ini biasanya sangat murah, ~$1-5/bulan).

---

## BAGIAN 5 — Deploy Bot ke Railway

1. Di dashboard Railway, tap **New Project**.
2. Pilih **Deploy from GitHub repo**.
3. Pilih repo **wa-bot-toko** yang tadi kamu buat.
4. Railway otomatis mendeteksi ini project Node.js dan mulai build.
5. Tap project yang baru dibuat → tab **Settings**:
   - **Start Command**: isi `npm start` (kalau belum otomatis terisi)

---

## BAGIAN 6 — Isi Environment Variables (API Key, dll)

1. Masih di project Railway, buka tab **Variables**.
2. Tap **New Variable**, tambahkan satu-satu (isi sesuai punyamu):
   ```
   BOT_NUMBER=6281234567890
   OWNER_NUMBER=6281234567890
   AI_API_KEY=isi_api_key_kamu
   AI_API_URL=https://api.groq.com/openai/v1/chat/completions
   AI_MODEL=llama-3.1-8b-instant
   STORE_NAME=Toko Game Online Kamu
   ```
3. Tap **Deploy** lagi supaya variable ini terpakai.

---

## BAGIAN 7 — Pasang Volume Persisten (WAJIB, supaya tidak logout terus)

Folder `session/` menyimpan status login WA kamu. Kalau tidak disimpan permanen,
bot akan minta pairing code ulang setiap kali Railway restart server.

1. Di project Railway, buka tab **Settings** → cari bagian **Volumes**.
2. Tap **New Volume**.
3. **Mount path**: isi `/app/session`
4. Simpan.

---

## BAGIAN 8 — Login Bot (Ambil Kode Pairing dari Log)

1. Buka tab **Deployments** di Railway, tap deployment yang aktif (paling atas).
2. Buka **View Logs**.
3. Tunggu sampai muncul baris seperti:
   ```
   === KODE PAIRING KAMU: XXXX-XXXX ===
   ```
4. Buka WhatsApp di HP kamu → **Setelan → Perangkat Tertaut → Tautkan Perangkat →
   Tautkan dengan nomor telepon** → masukkan kode itu.
5. Setelah berhasil, di log akan muncul:
   ```
   ✅ Bot berhasil terhubung ke WhatsApp!
   ```

Bot sekarang jalan 24 jam di server Railway, tidak bergantung HP kamu nyala atau tidak.

---

## BAGIAN 9 — Update Kode di Kemudian Hari

Kalau kamu edit `config.js` (misal nambah produk baru) lewat GitHub web editor
(tap ikon pensil di file saat buka file itu di GitHub → edit → Commit changes),
Railway **otomatis re-deploy** sendiri setiap kali ada commit baru ke branch `main`.
Tidak perlu buka Termux lagi kalau cuma edit teks/produk.

---

## Ringkasan Alur
```
HP kamu (edit produk/kode)
     ↓ commit
GitHub (nyimpen kode)
     ↓ auto-deploy
Railway (server yang menjalankan bot 24 jam)
     ↓
WhatsApp Bot aktif terus, fast response, tidak perlu HP nyala
```

## Kalau Ada Error Saat Deploy
Cek tab **Deployments → View Logs** di Railway, biasanya error paling umum:
- `npm install` gagal → cek `package.json` ter-upload dengan benar
- Bot crash restart terus → cek Variables sudah lengkap semua
- WA minta pairing ulang terus → cek Volume di Bagian 7 sudah ter-mount dengan benar
