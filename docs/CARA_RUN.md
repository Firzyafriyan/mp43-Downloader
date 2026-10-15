# 🚀 Panduan Menjalankan MP43 Downloader

Panduan langkah-demi-langkah untuk menjalankan aplikasi MP43 Downloader di komputer Anda (Windows).

---

## 📋 1. Kebutuhan Sistem (Prasyarat)

Pastikan di komputer Anda sudah terpasang:
- **Python 3.10+**
- Pustaka pendukung (`yt-dlp` dan `static-ffmpeg`)

Jika belum terpasang, cukup buka terminal (PowerShell atau Command Prompt) dan jalankan:
```bash
pip install yt-dlp static-ffmpeg
```

---

## ⚡ 2. Cara Menjalankan Aplikasi

### Cara A: Melalui Terminal (Rekomendasi)

1. Buka folder proyek di terminal (PowerShell / Command Prompt):
   ```bash
   cd c:\Dev\Projects\mp43-Downloader
   ```

2. Jalankan perintah server:
   ```bash
   python server.py
   ```

3. Jika berhasil, Anda akan melihat output di terminal seperti ini:
   ```text
   ==================================================
     MP43 Downloader - Real-Time Server Aktif
     Alamat Web:  http://localhost:5000
     Live API:    http://localhost:5000/api/start-download
   ==================================================
   ```

4. Buka peramban (Chrome, Edge, Firefox, Brave) dan akses:
   👉 **`http://localhost:5000`**

---

### Cara B: Sekali Klik (Double-Click File `run.bat`)

Untuk kemudahan Anda tanpa perlu membuka terminal secara manual:
1. Buka File Explorer ke folder `c:\Dev\Projects\mp43-Downloader`.
2. Klik dua kali (*double click*) pada berkas **`run.bat`**.
3. Terminal akan terbuka secara otomatis dan peramban akan langsung mengarahkan Anda ke `http://localhost:5000`.

---

## 🎬 3. Cara Mengunduh Video / Audio

1. Buka YouTube dan salin tautan video yang Anda inginkan (misal: `https://www.youtube.com/watch?v=...` atau link Shorts).
2. Di website MP43 Downloader (`http://localhost:5000`):
   - Klik tombol **"Tempel Link"** (atau tekan `Ctrl + V`).
   - Judul video dan thumbnail akan otomatis muncul.
3. Pilih format output:
   - **MP4 (Video + Audio)**: Pilih kualitas `1080p`, `720p`, `480p`, atau `360p`.
   - **MP3 (Hanya Audio)**: Pilih bitrate `320 kbps`, `256 kbps`, `192 kbps`, atau `128 kbps`.
4. Klik tombol **"Mulai Download"**.
5. Tunggu bilah progres *real-time* mencapai 100%. File asli langsung otomatis tersimpan ke folder *Downloads* Anda dan siap diputar di Windows Media Player / pemutar media lainnya!

---

## 🛑 4. Cara Menghentikan Server

Jika Anda sudah selesai menggunakan aplikasi dan ingin mematikan server:
- Kembali ke jendela terminal tempat `server.py` berjalan.
- Tekan **`Ctrl + C`** pada keyboard.
