# Frontend — Berkarya Untuk Indonesia

Aplikasi Frontend berbasis Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, dan Framer Motion.

## 🚀 Panduan Menjalankan

1. Pastikan Anda berada di direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
4. Buka di browser:
   - **Halaman Utama**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Struktur Halaman
- `app/page.tsx` — Landing page interaktif & formulir pengajuan ide
- `app/admin/page.tsx` — Dashboard moderasi & manajemen ide
- `app/layout.tsx` — Root layout & metadata
- `app/globals.css` — Konfigurasi styling & custom tokens
