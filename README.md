<div align="center">

<img src="assets/banner.png" alt="mp43-Downloader Banner" width="100%">

<br>

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/downloads/)
[![yt-dlp](https://img.shields.io/badge/yt--dlp-Powered-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/yt-dlp/yt-dlp)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Auto--Bundled-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-8A2BE2?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)

[![Stars](https://img.shields.io/github/stars/Firzyafriyan/mp43-Downloader?style=social)](https://github.com/Firzyafriyan/mp43-Downloader/stargazers)
[![Forks](https://img.shields.io/github/forks/Firzyafriyan/mp43-Downloader?style=social)](https://github.com/Firzyafriyan/mp43-Downloader/network/members)

**Aplikasi web lokal untuk mengunduh video & audio YouTube ke format MP4 dan MP3 — 100% valid, siap putar di mana saja.**

[🚀 Mulai Cepat](#-cara-pakai) • [📖 Panduan Lengkap](docs/CARA_RUN.md) • [🐛 Laporkan Bug](https://github.com/Firzyafriyan/mp43-Downloader/issues) • [💡 Request Fitur](https://github.com/Firzyafriyan/mp43-Downloader/issues)

</div>

---

## ✨ Kenapa Pakai Ini?

<div align="center">

| 🚫 **Downloader Online** | ✅ **mp43-Downloader** |
|:---:|:---:|
| Penuh iklan & pop-up | Tanpa iklan, tanpa drama |
| Watermark di file | File bersih & valid 100% |
| Dibatasi kualitas | Bebas pilih kualitas penuh |
| File lewat server orang lain | 100% jalan di komputermu sendiri |

</div>

Kebanyakan "YouTube downloader" online bikin pusing — iklan berlapis, kualitas dipangkas, dan link video kamu lewat server pihak ketiga. **mp43-Downloader** berjalan *lokal* di `localhost` dengan progres unduhan **real-time** yang bisa dipantau langsung dari browser. Tempel link → pilih format → file masuk folder Downloads. Selesai. 🎯

---

## 🚀 Fitur

🎥 **MP4 Video + Audio** — kualitas `1080p` • `720p` • `480p` • `360p`
🎵 **MP3 Audio Saja** — bitrate `320` • `256` • `192` • `128 kbps`
⚡ **Live Progress Real-Time** — ukuran file, kecepatan MB/s, dan estimasi waktu sisa
📋 **Tempel Link Pintar** — judul video & thumbnail muncul otomatis
🔗 **Auto-Merge FFmpeg** — trek audio & video digabung otomatis, binary FFmpeg di-fetch sendiri oleh `static-ffmpeg`
🧵 **Multi-Threading** — server tetap responsif saat download berjalan
👆 **Mode Sekali Klik** — double-click `run.bat`, browser langsung terbuka
✅ **File 100% Valid** — langsung tersimpan ke folder *Downloads*, siap diputar di WMP, VLC, atau smartphone

---

## 📋 Persyaratan

- 🐍 **Python 3.10 atau lebih baru** — [download di sini](https://www.python.org/downloads/) kalau belum punya
- 📦 Dua library Python, cukup jalankan **sekali** di terminal:

```bash
pip install yt-dlp static-ffmpeg
```

> 💡 `yt-dlp` mengambil media dari YouTube, `static-ffmpeg` menyediakan binary FFmpeg untuk konversi & penggabungan — **tidak perlu install FFmpeg manual**.

---

## 🎮 Cara Pakai

### 1️⃣ Jalankan Server

**Cara paling praktis (Windows):** double-click file [`run.bat`](run.bat) 🖱️ — terminal terbuka & browser otomatis mengarah ke `http://localhost:5000`.

**Atau lewat terminal:**

```bash
python server.py
```

Output sukses terlihat seperti ini:

```text
==================================================
  MP43 Downloader - Real-Time Server Aktif
  Alamat Web:  http://localhost:5000
  Live API:    http://localhost:5000/api/start-download
==================================================
```

### 2️⃣ Tempel Link & Pilih Format

1. 📎 Buka YouTube, salin link video (video biasa maupun Shorts)
2. 🖱️ Klik **"Tempel Link"** di aplikasi (atau `Ctrl + V`) — judul & thumbnail muncul otomatis
3. 🎬 Pilih format: **MP4** (`1080p`–`360p`) atau **MP3** (`320`–`128 kbps`)
4. ▶️ Klik **"Mulai Download"**

### 3️⃣ Tunggu & Selesai 🎉

Progress bar real-time sampai 100% — file otomatis tersimpan di folder *Downloads* dan langsung bisa diputar.

> 📖 Panduan lengkap ada di 👉 [`docs/CARA_RUN.md`](docs/CARA_RUN.md)

### 4️⃣ Matikan Server

Tekan **`Ctrl + C`** di jendela terminal. 👋

---

## 🗂️ Struktur Proyek

```text
mp43-Downloader/
├── 🌐 index.html      # Tampilan antarmuka web
├── 🎨 style.css       # Styling modern & responsif
├── ⚙️ app.js          # Logika frontend (progress polling, tempel link)
├── 🐍 server.py       # Server Python (yt-dlp + FFmpeg + threading)
├── 🖱️ run.bat         # Sekali klik untuk menjalankan (Windows)
├── 🖼️ assets/         # Banner & aset statis
└── 📚 docs/
    └── CARA_RUN.md    # Panduan menjalankan lengkap
```

---

## ⚠️ Catatan Keamanan & Legal

- 🔒 Aplikasi berjalan **100% lokal** — link video yang kamu unduh tidak pernah dikirim ke server pihak ketiga
- 🧹 File hasil unduhan diproses di folder *temp* dan langsung dikirim ke browser kamu
- ⚖️ Unduh hanya konten milikmu atau konten berlisensi untuk diunduh. Hormati hak cipta kreator dan [Ketentuan Layanan YouTube](https://www.youtube.com/t/terms)

---

## 🛠️ Kustomisasi Lanjutan

Ingin ganti port server? Ubah satu baris di bagian atas `server.py`:

```python
PORT = 5000  # ganti sesuai kebutuhan, misalnya 8080
```

Tidak perlu mengubah logika inti — konfigurasi utama sudah terpusat di bagian atas file. 🎯

---

## 🗺️ Pengembangan Selanjutnya

- [ ] 📼 Dukungan unduh playlist sekaligus
- [ ] 🎞️ Format tambahan: WEBM, M4A, WAV
- [ ] 🌙 Dark mode / light mode toggle
- [ ] 🕘 Riwayat unduhan (download history)
- [ ] 🌐 Deploy versi publik dengan antrian multi-user

---

<div align="center">

### 🌈 💜 Dibuat dengan ❤️ dan 🐍 untuk download tanpa ribet 💜 🌈

⭐ **Star repo ini kalau bermanfaat!** ⭐

</div>
