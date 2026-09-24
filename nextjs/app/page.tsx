'use client';

import { useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    kategori_karya: '',
    deskripsi: '',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      // Sesuaikan URL endpoint dengan backend Laravel Anda
      const response = await fetch('http://localhost:8000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengirim ide. Silakan periksa formulir.');
      }

      setFeedback({
        type: 'success',
        message: result.message || 'Ide Anda berhasil dikirim! Terima kasih telah berkontribusi.',
      });

      // Reset form setelah berhasil
      setFormData({
        nama: '',
        email: '',
        kategori_karya: '',
        deskripsi: '',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan pada koneksi server.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO BANNER */}
      {/* ========================================================================= */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-36 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-700 bg-slate-100 rounded-full uppercase">
            Inisiatif Pemuda Indonesia
          </span>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Berkarya Untuk Indonesia
          </h1>

          <p className="text-xl md:text-2xl font-medium text-slate-600">
            Satu Ide. Satu Karya. Satu Dampak.
          </p>

          <div className="pt-4">
            <a
              href="#kirim-ide"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all duration-200"
            >
              Kirim Ide Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: TENTANG PROGRAM (3 GRID CARD) */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tentang Program</h2>
          <p className="text-slate-600 text-sm md:text-base">
            Tiga pilar dasar gerakan dalam merangkul gagasan pemuda menuju perubahan nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-base mb-6">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Satu Ide</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Menampung ide dan perspektif segar dari generasi muda di berbagai sektor untuk menyelesaikan tantangan riil di masyarakat.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-base mb-6">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Satu Karya</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mengeksekusi gagasan terpilih menjadi karya nyata, produk terukur, atau prototipe yang siap diimplementasikan di lapangan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-base mb-6">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Satu Dampak</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Memastikan setiap karya yang dihasilkan memberikan manfaat berkelanjutan bagi kemajuan bangsa dan masyarakat luas.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FORM KIRIM IDE */}
      {/* ========================================================================= */}
      <section id="kirim-ide" className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kirim Ide</h2>
            <p className="text-sm text-slate-600">
              Sampaikan gagasan terbaik Anda untuk berkontribusi bagi Indonesia.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 mb-6 rounded-lg text-sm border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nama" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="kategori_karya" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Kategori Karya
              </label>
              <select
                id="kategori_karya"
                name="kategori_karya"
                required
                value={formData.kategori_karya}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              >
                <option value="">Pilih Kategori</option>
                <option value="Teknologi">Teknologi & Digital</option>
                <option value="Kreatif">Kreatif & Desain</option>
                <option value="Bisnis">Bisnis & Kewirausahaan</option>
                <option value="Sosial">Sosial & Pendidikan</option>
              </select>
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Deskripsi Ide
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                required
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Jelaskan ringkasan gagasan, latar belakang masalah, dan solusi yang Anda tawarkan..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg shadow-sm transition-all duration-200"
            >
              {loading ? 'Mengirim...' : 'Kirim Ide'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Sederhana */}
      <footer className="py-8 text-center text-xs text-slate-500 border-t border-slate-100">
        &copy; {new Date().getFullYear()} Berkarya Untuk Indonesia.
      </footer>
    </main>
  );
}
