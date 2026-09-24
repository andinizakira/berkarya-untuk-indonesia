'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useInView,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type FeedbackState = { type: 'success' | 'error'; message: string } | null;
type FormErrors = Partial<Record<'nama' | 'email' | 'kategori_karya' | 'deskripsi', string>>;

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// ─── Counter Hook (requestAnimationFrame) ─────────────────────────────────────
function useCounter(target: number, duration: number = 1500, shouldStart: boolean = false) {
  const shouldReduce = useReducedMotion();
  const [count, setCount] = useState(() => (shouldReduce ? target : 0));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!shouldStart) return;
    if (shouldReduce) {
      const id = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out: decelerate near end
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldStart, target, duration, shouldReduce]);

  return count;
}

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReduce ? false : 'hidden'}
      animate={inView || shouldReduce ? 'visible' : 'hidden'}
      custom={delay}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Program', href: '#program' },
  { label: 'Karya', href: '#karya' },
  { label: 'Kirim Ide', href: '#kirim-ide' },
];

const STATS = [
  { value: 120, suffix: '+', label: 'Ide Terkumpul' },
  { value: 35,  suffix: '',  label: 'Karya Dieksekusi' },
  { value: 18,  suffix: '',  label: 'Provinsi Terlibat' },
];

const PILLARS = [
  {
    number: '01',
    title: 'Satu Ide',
    description: 'Setiap perubahan besar dimulai dari satu gagasan. Kami menampung ide-ide terbaik generasi muda untuk diseleksi dan dikembangkan bersama.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Satu Karya',
    description: 'Ide terpilih dieksekusi menjadi karya nyata—produk, prototipe, atau inisiatif sosial yang siap memberikan nilai guna langsung kepada masyarakat.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Satu Dampak',
    description: 'Setiap karya yang lahir harus berdampak nyata. Kami memastikan hasil kerja menyentuh kehidupan nyata dan mendorong kemajuan bangsa.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
      </svg>
    ),
  },
];

const SHOWCASE = [
  { title: 'PintarDesa',       category: 'Teknologi & Sosial',  description: 'Platform edukasi digital berbasis lokal untuk mempercepat literasi digital masyarakat desa di Jawa Tengah.', tag: 'Diluncurkan 2025', image: '/showcase_pintardesa.jpg' },
  { title: 'Wastra Nusantara', category: 'Kreatif & Budaya',    description: 'Katalog digital interaktif motif batik dan tenun lokal yang menghubungkan pengrajin dengan pasar global.',    tag: 'Diluncurkan 2025', image: '/showcase_wastranusantara.jpg' },
  { title: 'GeraiUMKM',        category: 'Bisnis & Ekonomi',    description: 'Marketplace khusus UMKM lokal dengan fitur manajemen stok dan laporan keuangan sederhana berbasis web.',      tag: 'Beta — 2025',     image: '/showcase_geraiUMKM.jpg' },
  { title: 'PanenAir',         category: 'Lingkungan',          description: 'Sistem panduan pemanenan air hujan berbasis IoT sederhana untuk wilayah rawan kekeringan di NTT.',            tag: 'Pilot Project',   image: '/showcase_paneair.jpg' },
  { title: 'RuangLapang',      category: 'Sosial & Komunitas',  description: 'Aplikasi pemetaan ruang publik terbuka untuk aksi sosial, belajar bersama, dan kegiatan komunitas kota.',      tag: 'Diluncurkan 2024', image: '/showcase_ruanglapang.jpg' },
  { title: 'BeasiswaKita',     category: 'Pendidikan',          description: 'Agregator informasi beasiswa nasional dan internasional dengan fitur notifikasi deadline personal.',           tag: 'Diluncurkan 2024', image: '/showcase_beasiswakita.jpg' },
];

const CATEGORIES = [
  { value: 'teknologi', label: 'Teknologi & Digital' },
  { value: 'kreatif',   label: 'Kreatif & Desain' },
  { value: 'bisnis',    label: 'Bisnis & Kewirausahaan' },
  { value: 'sosial',    label: 'Sosial & Pendidikan' },
  { value: 'lingkungan',label: 'Lingkungan & Keberlanjutan' },
];

// ─── Stat Counter Card ────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCounter(value, 1500, inView);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      variants={fadeUp}
    >
      <p className="text-3xl md:text-4xl font-black text-[#0B1220]">
        {count}{suffix}
      </p>
      <p className="text-xs font-semibold text-[#4B5563] mt-1 tracking-wide">{label}</p>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const shouldReduce              = useReducedMotion();

  // Form state
  const [form, setForm]           = useState({ nama: '', email: '', kategori_karya: '', deskripsi: '', portofolio: '' });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [loading, setLoading]     = useState(false);
  const [feedback, setFeedback]   = useState<FeedbackState>(null);
  const [toast, setToast]         = useState(false);

  // Navbar scroll detection
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FormErrors])
      setErrors((p) => ({ ...p, [e.target.name]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.nama.trim())          next.nama = 'Nama lengkap wajib diisi.';
    if (!form.email.trim())         next.email = 'Alamat email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Format email tidak valid.';
    if (!form.kategori_karya)       next.kategori_karya = 'Pilih kategori terlebih dahulu.';
    if (!form.deskripsi.trim())     next.deskripsi = 'Deskripsi ide wajib diisi.';
    else if (form.deskripsi.trim().length < 10) next.deskripsi = 'Deskripsi minimal 10 karakter.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res  = await fetch('http://localhost:8080/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan.');
      setFeedback({ type: 'success', message: data.message });
      setForm({ nama: '', email: '', kategori_karya: '', deskripsi: '', portofolio: '' });
      setErrors({});
      setToast(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal terhubung ke server.';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-[#0B1220] font-sans antialiased overflow-x-hidden">

      {/* ── CSS for floating shapes & prefers-reduced-motion ── */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(-8px); }
          50%       { transform: translateY(8px); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(3deg); }
        }
        .float-a { animation: floatA 7s ease-in-out infinite; }
        .float-b { animation: floatB 8s ease-in-out infinite; }
        .float-dot { animation: floatDot 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .float-a, .float-b, .float-dot { animation: none; }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* ================================================================
          TOAST
      ================================================================ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-[#0B1220] text-white px-5 py-4 shadow-2xl"
          >
            <svg className="w-5 h-5 text-[#E10600] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-bold">Ide Berhasil Dikirim!</p>
              <p className="text-xs text-slate-400 mt-0.5">Terima kasih telah berkarya untuk Indonesia.</p>
            </div>
            <button onClick={() => setToast(false)} className="ml-4 text-slate-500 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          NAVBAR
      ================================================================ */}
      <motion.header
        className="sticky top-0 z-50 bg-white"
        animate={{
          boxShadow: scrolled ? '0 2px 20px 0 rgba(0,0,0,0.08)' : '0 0 0 0 transparent',
          borderBottomColor: scrolled ? 'rgba(226,232,240,1)' : 'transparent',
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="w-7 h-7 bg-[#E10600] flex items-center justify-center">
              <span className="text-white text-xs font-black">B</span>
            </span>
            <span className="text-sm font-bold tracking-widest uppercase text-[#0B1220]">
              Berkarya<span className="text-[#E10600]">.</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.slice(0, 3).map((link) => (
              <a key={link.label} href={link.href}
                className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] hover:text-[#0B1220] transition-colors">
                {link.label}
              </a>
            ))}
            <motion.a
              href="#kirim-ide"
              className="px-5 py-2.5 text-xs font-bold tracking-wider uppercase bg-[#E10600] text-white"
              whileHover={{ backgroundColor: '#c10000' }}
              transition={{ duration: 0.2 }}
            >
              Kirim Ide
            </motion.a>
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#0B1220]" aria-label="Toggle menu">
            {menuOpen
              ? <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="md:hidden bg-white border-t border-slate-100 px-6 overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm font-semibold text-[#4B5563] hover:text-[#0B1220] border-b border-slate-100 last:border-0 transition-colors">
                    {link.label}
                  </a>
                ))}
                <div className="pt-2">
                  <a href="#kirim-ide" onClick={() => setMenuOpen(false)}
                    className="block w-full text-center py-3 text-sm font-bold tracking-wider uppercase bg-[#E10600] text-white hover:bg-[#c10000] transition-colors">
                    Kirim Ide
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ================================================================
          HERO
      ================================================================ */}
      <section id="tentang" className="relative overflow-hidden border-b border-slate-200">

        {/* Animated decorative shapes — pointer-events: none */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="float-a absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-[#E10600]/10"/>
          <div className="float-b absolute -top-16 -right-16 w-[360px] h-[360px] rounded-full border border-[#E10600]/10"/>
          <div className="float-a absolute top-1/3 -right-24 w-[220px] h-[220px] rounded-full bg-[#E10600]/5"/>
          <div className="float-b absolute -bottom-32 -left-32 w-72 h-72 rounded-full border border-slate-200"/>
          <svg className="float-dot absolute right-0 top-0 h-full opacity-[0.035]" width="400" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={c * 20 + 10} cy={r * 20 + 10} r="1.5" fill="#0B1220"/>
              ))
            )}
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow — fade in first */}
            <motion.div
              className="inline-flex items-center gap-2 mb-6"
              initial={shouldReduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="w-8 h-px bg-[#E10600]"/>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E10600]">Inisiatif Pemuda Indonesia</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl md:text-7xl font-black tracking-tighter text-[#0B1220] leading-[1.05] mb-6"
              initial={shouldReduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Berkarya Untuk{' '}
              <span className="text-[#E10600]">Indonesia.</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-lg md:text-xl text-[#4B5563] font-medium mb-4"
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              Satu Ide. Satu Karya. Satu Dampak.
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-[#4B5563] leading-relaxed max-w-xl mx-auto mb-10"
              initial={shouldReduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              Platform terbuka bagi generasi muda Indonesia untuk menyumbangkan gagasan,
              berkolaborasi lintas bidang, dan mengeksekusinya menjadi karya nyata yang
              berdampak bagi masyarakat.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={shouldReduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.a
                href="#kirim-ide"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider uppercase bg-[#E10600] text-white overflow-hidden"
                whileHover={{ backgroundColor: '#c10000' }}
                transition={{ duration: 0.2 }}
              >
                Mulai Berkarya
                <motion.svg
                  className="ml-2 w-4 h-4"
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </motion.svg>
              </motion.a>
              <motion.a
                href="#karya"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider uppercase border border-[#0B1220] text-[#0B1220]"
                whileHover={{ backgroundColor: '#0B1220', color: '#ffffff' }}
                transition={{ duration: 0.25 }}
              >
                Lihat Karya
              </motion.a>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              className="mt-14 pt-10 border-t border-slate-200 grid grid-cols-3 gap-6"
              initial={shouldReduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} delay={i * 0.1}/>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TIGA PILAR
      ================================================================ */}
      <section id="program" className="py-20 md:py-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-[#E10600]"/>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E10600]">Program</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0B1220]">Tiga Pilar Gerakan.</h2>
            <p className="mt-3 text-sm text-[#4B5563] leading-relaxed">
              Seluruh inisiatif dalam ekosistem ini berpijak pada tiga prinsip utama yang saling menguatkan.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.number} delay={i * 0.1}>
                <motion.div
                  className="p-8 border border-slate-200 cursor-default h-full group"
                  whileHover={{
                    borderColor: '#E10600',
                    boxShadow: '4px 0 0 0 #E10600 inset',
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="text-[#4B5563] mb-6"
                    whileHover={{ color: '#E10600' }}
                    transition={{ duration: 0.25 }}
                  >
                    {pillar.icon}
                  </motion.div>
                  <span className="text-xs font-bold tracking-widest text-slate-300">{pillar.number}</span>
                  <h3 className="text-xl font-bold text-[#0B1220] mt-2 mb-3">{pillar.title}</h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{pillar.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SHOWCASE KARYA
      ================================================================ */}
      <section id="karya" className="py-20 md:py-28 bg-[#0B1220] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">

          <Reveal className="mb-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-8 h-px bg-[#E10600]"/>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E10600]">Showcase</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Karya yang Sudah Nyata.</h2>
                <p className="mt-3 text-sm text-slate-400 max-w-lg">Inilah wujud nyata dari setiap ide yang masuk dan dieksekusi bersama.</p>
              </div>
              <motion.a
                href="#kirim-ide"
                className="shrink-0 inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#E10600]"
                whileHover={{ color: '#ffffff' }}
                transition={{ duration: 0.2 }}
              >
                <span>Kirim Ideamu</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </motion.a>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOWCASE.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.1}>
                <motion.div
                  className="border border-white/10 bg-white/5 p-6 h-full"
                  whileHover={shouldReduce ? {} : {
                    y: -6,
                    borderColor: 'rgba(225,6,0,0.5)',
                    boxShadow: '0 20px 40px rgba(225,6,0,0.15)',
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Thumbnail with zoom on hover */}
                  <div className="h-40 overflow-hidden mb-5">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      whileHover={shouldReduce ? {} : { scale: 1.05 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E10600]">{item.category}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white/5 px-2 py-0.5">{item.tag}</span>
                  </div>

                  <motion.h3
                    className="text-base font-bold text-white mb-2"
                    whileHover={{ color: '#E10600' }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.title}
                  </motion.h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FORM KIRIM IDE
      ================================================================ */}
      <section id="kirim-ide" className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Left copy */}
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-[#E10600]"/>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E10600]">Formulir</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0B1220] mb-4">Kirim Ide.</h2>
              <p className="text-sm text-[#4B5563] leading-relaxed mb-8">
                Punya gagasan yang ingin diwujudkan? Isi formulir ini dan tim kurasi kami akan menghubungi kamu untuk langkah selanjutnya.
              </p>
              <div className="space-y-4">
                {[{ icon: '📬', label: 'Respons dalam 3–5 hari kerja' }, { icon: '🔒', label: 'Data kamu dijaga kerahasiaannya' }, { icon: '💡', label: 'Semua bidang ide diterima' }].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-[#4B5563]">
                    <span>{item.icon}</span><span>{item.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Right form */}
            <Reveal delay={0.15}>
              {feedback?.type === 'error' && (
                <div className="mb-6 p-4 border-l-4 border-[#E10600] bg-red-50 text-sm text-red-800">{feedback.message}</div>
              )}
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                    Nama Lengkap <span className="text-[#E10600]">*</span>
                  </label>
                  <input name="nama" type="text" value={form.nama} onChange={handleChange} placeholder="Nama lengkap Anda"
                    className={`w-full px-4 py-3 text-sm text-[#0B1220] bg-white border ${errors.nama ? 'border-[#E10600]' : 'border-slate-300'} focus:outline-none focus:border-[#0B1220] transition-colors placeholder:text-slate-300`}
                  />
                  {errors.nama && <p className="mt-1.5 text-xs text-[#E10600] flex items-center gap-1"><ErrIcon/>{errors.nama}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                    Alamat Email <span className="text-[#E10600]">*</span>
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="nama@email.com"
                    className={`w-full px-4 py-3 text-sm text-[#0B1220] bg-white border ${errors.email ? 'border-[#E10600]' : 'border-slate-300'} focus:outline-none focus:border-[#0B1220] transition-colors placeholder:text-slate-300`}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-[#E10600] flex items-center gap-1"><ErrIcon/>{errors.email}</p>}
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                    Kategori Karya <span className="text-[#E10600]">*</span>
                  </label>
                  <div className="relative">
                    <select name="kategori_karya" value={form.kategori_karya} onChange={handleChange}
                      className={`w-full px-4 py-3 text-sm text-[#0B1220] bg-white border ${errors.kategori_karya ? 'border-[#E10600]' : 'border-slate-300'} focus:outline-none focus:border-[#0B1220] transition-colors appearance-none cursor-pointer pr-10`}
                    >
                      <option value="">Pilih Kategori</option>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </div>
                  {errors.kategori_karya && <p className="mt-1.5 text-xs text-[#E10600] flex items-center gap-1"><ErrIcon/>{errors.kategori_karya}</p>}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                    Deskripsi Ide <span className="text-[#E10600]">*</span>
                  </label>
                  <textarea name="deskripsi" rows={4} value={form.deskripsi} onChange={handleChange}
                    placeholder="Jelaskan ide, masalah yang ingin diselesaikan, dan solusi yang Anda tawarkan..."
                    className={`w-full px-4 py-3 text-sm text-[#0B1220] bg-white border ${errors.deskripsi ? 'border-[#E10600]' : 'border-slate-300'} focus:outline-none focus:border-[#0B1220] transition-colors resize-none placeholder:text-slate-300`}
                  />
                  {errors.deskripsi && <p className="mt-1.5 text-xs text-[#E10600] flex items-center gap-1"><ErrIcon/>{errors.deskripsi}</p>}
                </div>

                {/* Portofolio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                    Link Portofolio / Referensi{' '}
                    <span className="font-normal text-slate-400 normal-case tracking-normal">(opsional)</span>
                  </label>
                  <input name="portofolio" type="url" value={form.portofolio} onChange={handleChange} placeholder="https://..."
                    className="w-full px-4 py-3 text-sm text-[#0B1220] bg-white border border-slate-300 focus:outline-none focus:border-[#0B1220] transition-colors placeholder:text-slate-300"
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-sm font-bold tracking-wider uppercase bg-[#E10600] text-white disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={loading ? {} : { backgroundColor: '#c10000' }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Mengirim...
                    </>
                  ) : 'Kirim Ide'}
                </motion.button>

                <p className="text-xs text-slate-400">
                  Kolom bertanda <span className="text-[#E10600]">*</span> wajib diisi.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="bg-[#0B1220] text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-[#E10600] flex items-center justify-center">
                <span className="text-white text-sm font-black">B</span>
              </span>
              <span className="text-sm font-bold tracking-widest uppercase text-white">
                Berkarya<span className="text-[#E10600]">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Platform terbuka untuk mewadahi, mengeksekusi, dan memublikasikan karya nyata generasi muda Indonesia.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {[
                { label: 'Instagram', d: 'M16.5 3.75H7.5A3.75 3.75 0 003.75 7.5v9a3.75 3.75 0 003.75 3.75h9a3.75 3.75 0 003.75-3.75v-9A3.75 3.75 0 0016.5 3.75zm-4.5 9a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zm3.75-6a.75.75 0 100 1.5.75.75 0 000-1.5z' },
                { label: 'Twitter', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'LinkedIn', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map((s) => (
                <motion.a key={s.label} href="#" aria-label={s.label}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-slate-400"
                  whileHover={{ borderColor: '#E10600', color: '#E10600' }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.d}/>
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-5">Navigasi</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-5">Kontak</h4>
            <a href="mailto:halo@berkaryaindonesia.id" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-[#E10600]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
              halo@berkaryaindonesia.id
            </a>
            <p className="text-xs text-slate-500 mt-2">Respons dalam 3–5 hari kerja</p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} Berkarya Untuk Indonesia. Hak Cipta Dilindungi.</p>
            <p className="text-xs text-slate-600">Dibuat dengan ❤️ oleh pemuda Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Tiny error icon ─────────────────────────────────────────────────────────
function ErrIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
  );
}
