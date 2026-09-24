# 🇮🇩 Berkarya Untuk Indonesia — Web Development Platform

**Satu Ide. Satu Karya. Satu Dampak.**

*Karya ini dikembangkan sebagai bagian dari **Creative Challenge — Mahreen Indonesia Internship Batch 2***  
**Posisi:** Web Development Frontend & Backend  
**Kandidat:** Andini Zakira

</div>

---

## 📌 Tentang Proyek

**Berkarya Untuk Indonesia** adalah platform web fullstack interaktif yang didedikasikan untuk mewadahi aspirasi, memfasilitasi kurasi gagasan kreatif, dan mendorong kolaborasi generasi muda Indonesia. Melalui platform ini, ide-ide inovatif dari berbagai bidang (teknologi, sosial, pendidikan, lingkungan, hingga bisnis) dapat disalurkan secara terstruktur untuk kemudian dieksekusi menjadi karya nyata yang berdaya guna bagi masyarakat.

Platform ini mengintegrasikan **Public Landing Page** modern yang sarat micro-animation dengan **Admin Dashboard ("Dashboard Ide Masuk")** yang aman dan responsif untuk keperluan manajemen dan moderasi data ide secara real-time.

---

## ✨ Fitur Utama

### 🎨 1. Frontend (Landing Page Publik)
- **Hero Section Dinamis & Interaktif:** Animasi visual bertema kebangsaan dan micro-interactions menggunakan Framer Motion.
- **Showcase Karya Nyata:** Galeri inisiatif pemuda dengan tag status, visualisasi kartu, dan deskripsi dampak.
- **Live Counter & Statistik Dampak:** Animasi penghitung interaktif berbasis `requestAnimationFrame` untuk metrik komunitas.
- **Formulir Pengajuan Ide:** Validasi data input di sisi client secara real-time, loading spinner, serta toast feedback otomatis.
- **Desain Responsif & Ramah Aksesibilitas:** Mendukung tampilan mobile/tablet/desktop serta mode *prefers-reduced-motion*.

### ⚙️ 2. Backend & Admin Dashboard
- **Autentikasi Akses Admin:** Halaman login dengan proteksi kredensial password untuk mengamankan data kurasi.
- **KPI Metrics Card:** Ringkasan statistik cepat (Total Ide, Menunggu Kurasi, Diterima, Ditolak).
- **Manajemen & Moderasi Ide:** Fitur filter kategori, pencarian data, pengubahan status ide (*Approved*, *Rejected*, *Pending*), dan penghapusan ide.
- **RESTful API Service:** Backend PHP ringan berkemampuan CORS dengan penyimpanan data terstruktur (*persistent JSON store*).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Custom Animations |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Backend & API** | PHP Native REST API Service |
| **Data Storage** | JSON Flat-File Storage (`ideas_store.json`) |
| **Automation** | Windows Batch Script (`start.bat`) |

---

## 🚀 Panduan Menjalankan Proyek

### Opsi 1: Cara Cepat (1-Klik via Windows)
Cukup jalankan file shortcut otomatisasi di root folder:
1. Klik dua kali file **`start.bat`**.
2. Skrip akan secara otomatis menyalakan Backend PHP (port `8080`), Frontend Next.js (port `3000`), dan membuka browser ke halaman admin.

---

### Opsi 2: Cara Manual (Terminal)

Buka **2 terminal terpisah**:

#### Terminal 1 — Backend API (PHP Server)
```bash
cd symfony
php -S 127.0.0.1:8080 server.php
```
> API aktif di: `http://localhost:8080`

#### Terminal 2 — Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
> Web aplikasi aktif di: `http://localhost:3000`

---

## 🔐 Kredensial & URL Akses

| Halaman / Layanan | URL | Akses / Keterangan |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:3000](http://localhost:3000) | Publik |
| **Form Kirim Ide** | [http://localhost:3000/#kirim-ide](http://localhost:3000/#kirim-ide) | Publik |
| **Admin Dashboard** | [http://localhost:3000/admin](http://localhost:3000/admin) | Password: `admin123` |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | REST API Endpoint |

---

## 📡 Dokumentasi Endpoint API

| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ideas` | Publik | Mengirim gagasan/ide baru dari formulir publik |
| `POST` | `/api/admin/login` | Publik | Verifikasi kredensial login admin |
| `GET` | `/api/admin/ideas` | Bearer Token | Mengambil daftar seluruh ide masuk (opsional query `?status=...`) |
| `PATCH` | `/api/admin/ideas/{id}` | Bearer Token | Memperbarui status ide (`menunggu` / `diproses` / `diterima` / `ditolak`) & catatan |
| `DELETE` | `/api/admin/ideas/{id}` | Bearer Token | Menghapus ide dari daftar penyimpanan |

---

## 📂 Struktur Direktori Proyek

```text
take-home-1x24jam/
├── frontend/                     # Frontend Next.js App
│   ├── app/
│   │   ├── admin/page.tsx        # Halaman Admin Dashboard
│   │   ├── globals.css           # Styling global & token warna
│   │   ├── layout.tsx            # Root layout aplikasi
│   │   └── page.tsx              # Landing page interaktif & form ide
│   ├── public/                   # Asset gambar showcase & ikon
│   ├── package.json              # Dependencies frontend
│   └── tsconfig.json             # Konfigurasi TypeScript
├── symfony/                      # Backend Service (PHP)
│   ├── ideas_store.json          # File database penyimpanan ide
│   └── server.php                # Router & controller API
├── .gitignore                    # Pengabaian file build & dependency
├── README.md                     # Dokumentasi resmi proyek
└── start.bat                     # Skrip peluncur otomatis 1-klik
```

---

## 👩‍💻 Profil Pengembang

- **Nama:** Andini Zakira
- **Program:** Mahreen Indonesia Internship Batch 2
- **Posisi:** Web Development Frontend & Backend
- **Tahun:** 2024 / 2025

---
<div align="center">
  <b>Berkarya Untuk Indonesia © 2024 — Mengubah Ide Jadi Dampak Nyata</b>
</div>
