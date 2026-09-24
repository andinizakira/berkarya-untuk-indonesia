'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'menunggu' | 'diproses' | 'diterima' | 'ditolak';
type SortDir = 'desc' | 'asc';
type ToastMsg = { id: number; text: string; type: 'success' | 'error' };

type Idea = {
  id: string;
  nama: string;
  email: string;
  kategori_karya: string;
  deskripsi: string;
  portofolio?: string;
  status: Status;
  catatan?: string;
  submitted_at: string;
  updated_at?: string | null;
};

// ─── Status Config (Sesuai Ketentuan Palet Warna & Pill) ──────────────────────
const STATUS_CFG: Record<Status, {
  label: string;
  dot: string;
  bg: string;
  text: string;
  borderL: string;
  iconBg: string;
  iconColor: string;
}> = {
  menunggu: {
    label:     'Menunggu',
    dot:       '#D97706',
    bg:        '#FEF3C7',
    text:      '#92400E',
    borderL:   'border-l-amber-400',
    iconBg:    'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  diproses: {
    label:     'Diproses',
    dot:       '#2563EB',
    bg:        '#DBEAFE',
    text:      '#1E40AF',
    borderL:   'border-l-blue-500',
    iconBg:    'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  diterima: {
    label:     'Diterima',
    dot:       '#059669',
    bg:        '#D1FAE5',
    text:      '#065F46',
    borderL:   'border-l-emerald-500',
    iconBg:    'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  ditolak: {
    label:     'Ditolak',
    dot:       '#DC2626',
    bg:        '#FEE2E2',
    text:      '#991B1B',
    borderL:   'border-l-red-500',
    iconBg:    'bg-red-50',
    iconColor: 'text-red-600',
  },
};

const STAT_CARDS: { key: Status | ''; label: string }[] = [
  { key: '',         label: 'Total Ide' },
  { key: 'menunggu', label: 'Menunggu' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'diterima', label: 'Diterima' },
  { key: 'ditolak',  label: 'Ditolak' },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: HomeIcon },
  { id: 'ideas',     label: 'Kelola Ide',   icon: IdeaIcon },
  { id: 'showcase',  label: 'Kelola Karya', icon: GalleryIcon },
  { id: 'settings',  label: 'Pengaturan',   icon: SettingsIcon },
];

const PAGE_SIZE = 10;
const API       = 'http://localhost:8080';
let   toastId   = 0;

// ─── Counter Hook (requestAnimationFrame 0.8s) ───────────────────────────────
function useCounter(target: number, duration = 800, go = false) {
  const [val, setVal]   = useState(0);
  const prevVal         = useRef(0);
  const raf             = useRef<number>(0);
  const reduced         = useReducedMotion();

  useEffect(() => {
    if (!go) return;
    if (reduced) {
      setVal(target);
      prevVal.current = target;
      return;
    }

    const startVal = prevVal.current;
    const diff = target - startVal;
    if (diff === 0) {
      setVal(target);
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * eased);
      setVal(current);

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setVal(target);
        prevVal.current = target;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [go, target, duration, reduced]);

  return val;
}

// ─── Status Badge Pill Component ─────────────────────────────────────────────
// - Pill border-radius: 9999px, padding: 4px 12px, font-size: 12px, font-semibold
// - Dot ● solid sesuai status di kiri teks
// - Smooth crossfade color 0.3s
// - Pulse effect 0.4s (scale up-down sekali) saat status baru saja diubah
function StatusBadge({ status, pulse }: { status: Status; pulse?: boolean }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.menunggu;
  const reduced = useReducedMotion();

  return (
    <motion.span
      className="inline-flex items-center gap-1.5 font-semibold shrink-0 select-none"
      style={{
        borderRadius: '9999px',
        padding: '4px 12px',
        fontSize: '12px',
      }}
      animate={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        scale: pulse && !reduced ? [1, 1.18, 0.95, 1] : 1,
      }}
      transition={{
        backgroundColor: { duration: 0.3, ease: 'easeInOut' },
        color: { duration: 0.3, ease: 'easeInOut' },
        scale: { duration: 0.4, ease: 'easeInOut' },
      }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        animate={{ backgroundColor: cfg.dot }}
        transition={{ backgroundColor: { duration: 0.3, ease: 'easeInOut' } }}
      />
      {cfg.label}
    </motion.span>
  );
}

// ─── Toast Container Component (Slide-in + Auto-dismiss 3s) ───────────────────
function ToastContainer({ toasts, remove }: { toasts: ToastMsg[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-3 bg-[#0B1220] text-white px-4 py-3 shadow-2xl border-l-4 border-emerald-500 min-w-[280px] max-w-md rounded-sm"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}/>
            <span className="text-xs font-medium flex-1">{t.text}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-white transition-colors ml-2 p-1"
              aria-label="Tutup notifikasi"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
export default function AdminPage() {
  const reduced = useReducedMotion();

  // Auth
  const [token, setToken]           = useState<string | null>(null);
  const [password, setPassword]     = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data
  const [ideas, setIdeas]           = useState<Idea[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loaded, setLoaded]         = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [search, setSearch]             = useState('');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);

  // Bulk
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction]     = useState<Status | 'delete' | ''>('');

  // Modal Review
  const [reviewing, setReviewing]       = useState<Idea | null>(null);
  const [updateCatatan, setUpdateCatatan] = useState('');
  const [saving, setSaving]             = useState(false);

  // Pulse tracking for modified badge
  const [pulsedIds, setPulsedIds]       = useState<Set<string>>(new Set());

  // Sidebar
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeNav, setActiveNav]       = useState('ideas');

  // Toasts
  const [toasts, setToasts]             = useState<ToastMsg[]>([]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastId;
    setToasts(p => [...p, { id, text, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };
  const removeToast = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  // ─── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
    setIdeas([]);
    setLoaded(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal.');
      sessionStorage.setItem('admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login gagal. Periksa password Anda.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Fetch Ideas ───────────────────────────────────────────────────────────
  const fetchIdeas = useCallback(async (tk: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/ideas`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setIdeas(data.data ?? []);
      setTimeout(() => setLoaded(true), 80);
    } catch (err) {
      console.error('Fetch ideas error:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchIdeas(token);
  }, [token, fetchIdeas]);

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    '':        ideas.length,
    menunggu:  ideas.filter(i => (i.status || 'menunggu') === 'menunggu').length,
    diproses:  ideas.filter(i => i.status === 'diproses').length,
    diterima:  ideas.filter(i => i.status === 'diterima').length,
    ditolak:   ideas.filter(i => i.status === 'ditolak').length,
  }), [ideas]);

  // ─── Filter & Search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...ideas];
    if (filterStatus) {
      rows = rows.filter(r => (r.status || 'menunggu') === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.nama.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.kategori_karya.toLowerCase().includes(q) ||
        r.deskripsi.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const d = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      return sortDir === 'desc' ? -d : d;
    });
    return rows;
  }, [ideas, filterStatus, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, search, sortDir]);

  // ─── Bulk Actions ──────────────────────────────────────────────────────────
  const allPageSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));

  const toggleAll = () => {
    setSelected(prev => {
      const s = new Set(prev);
      if (allPageSelected) {
        paginated.forEach(r => s.delete(r.id));
      } else {
        paginated.forEach(r => s.add(r.id));
      }
      return s;
    });
  };

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const executeBulk = async () => {
    if (!token || !bulkAction || selected.size === 0) return;
    const actionLabel = bulkAction === 'delete' ? 'Hapus' : `Ubah ke "${STATUS_CFG[bulkAction as Status]?.label}"`;
    if (!confirm(`Konfirmasi: ${actionLabel} ${selected.size} ide terpilih?`)) return;

    const ids = Array.from(selected);
    if (bulkAction === 'delete') {
      await Promise.all(ids.map(id =>
        fetch(`${API}/api/admin/ideas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      addToast(`${ids.length} ide berhasil dihapus.`);
    } else {
      await Promise.all(ids.map(id =>
        fetch(`${API}/api/admin/ideas/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: bulkAction }),
        })
      ));
      setPulsedIds(new Set(ids));
      setTimeout(() => setPulsedIds(new Set()), 800);
      addToast(`Status ${ids.length} ide berhasil diubah menjadi ${STATUS_CFG[bulkAction as Status]?.label}`);
    }
    setSelected(new Set());
    setBulkAction('');
    fetchIdeas(token);
  };

  // ─── Review Modal Controls ─────────────────────────────────────────────────
  const openReview = (idea: Idea) => {
    setReviewing(idea);
    setUpdateCatatan(idea.catatan ?? '');
  };

  const applyStatus = async (newStatus: Status) => {
    if (!reviewing || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/ideas/${reviewing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, catatan: updateCatatan }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui status');

      // Trigger pulse animation pada baris tabel yang baru diubah
      setPulsedIds(new Set([reviewing.id]));
      setTimeout(() => setPulsedIds(new Set()), 800);

      // Toast notifikasi: "Status ide berhasil diubah menjadi [Diterima/dll]"
      addToast(`Status ide berhasil diubah menjadi ${STATUS_CFG[newStatus].label}`);

      setReviewing(null);
      fetchIdeas(token);
    } catch {
      addToast('Gagal mengubah status. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!token || !confirm('Apakah Anda yakin ingin menghapus ide ini secara permanen?')) return;
    try {
      await fetch(`${API}/api/admin/ideas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      addToast('Ide berhasil dihapus.');
      setReviewing(null);
      fetchIdeas(token);
    } catch {
      addToast('Gagal menghapus ide.', 'error');
    }
  };

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // ─── LOGIN VIEW ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-9 h-9 bg-[#E10600] flex items-center justify-center font-black text-white text-sm">B</span>
              <span className="text-base font-bold tracking-widest uppercase text-white">
                Berkarya<span className="text-[#E10600]">.</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Masuk untuk mengelola Dashboard Ide Masuk</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 space-y-5">
            {loginError && (
              <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 text-xs">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Masukkan password admin"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#E10600] placeholder:text-slate-600 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 text-sm font-bold tracking-wider uppercase bg-[#E10600] text-white hover:bg-[#c10000] disabled:bg-slate-700 transition-colors"
            >
              {loginLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
            </button>
            <p className="text-center text-xs text-slate-500">
              Password default: <code className="text-slate-300 bg-white/10 px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </form>

          <p className="mt-6 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Kembali ke Halaman Utama
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── DASHBOARD VIEW ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans antialiased flex">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* ── Sidebar Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar Navigasi ── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-56 bg-[#0B1220] transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 h-14 flex items-center gap-2 border-b border-white/5 shrink-0">
          <span className="w-7 h-7 bg-[#E10600] flex items-center justify-center font-black text-xs text-white">B</span>
          <span className="text-sm font-bold tracking-widest uppercase text-white">
            Berkarya<span className="text-[#E10600]">.</span>
          </span>
        </div>

        {/* Menu Items with hover highlight & smooth active indicator */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left rounded-sm ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Indikator/border kiri merah yang bergerak smooth mengikuti menu aktif */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#E10600] rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="ml-1 shrink-0"><item.icon /></span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#E10600] transition-colors py-2"
          >
            <LogoutIcon /> Keluar
          </button>
        </div>
      </aside>

      {/* ── Main Dashboard Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-5 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-900"
            aria-label="Buka menu navigasi"
          >
            <MenuIcon />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-bold text-[#0B1220]">Dashboard Ide Masuk</h1>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#0B1220] flex items-center gap-1.5 transition-colors"
          >
            <ExternalIcon />
            <span>Lihat Website</span>
          </a>

          <button
            onClick={() => token && fetchIdeas(token)}
            className="text-xs font-semibold text-slate-600 hover:text-[#0B1220] flex items-center gap-1.5 transition-colors"
          >
            <RefreshIcon />
            <span>Refresh</span>
          </button>
        </header>

        <main className="flex-1 p-5 md:p-7 space-y-6 overflow-y-auto">
          {/* ── Kartu Statistik (Staggered fade-in + count-up requestAnimationFrame + hover lift) ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STAT_CARDS.map((card, i) => (
              <StatCard
                key={card.key}
                card={card}
                stats={stats}
                filterStatus={filterStatus}
                onFilter={k => { setFilterStatus(k); setPage(1); }}
                loaded={loaded}
                staggerIndex={i}
                reduced={!!reduced}
              />
            ))}
          </div>

          {/* ── Search Bar + Filter Tabs dengan Counter ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari pengirim, email, kategori, deskripsi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-300 bg-white focus:outline-none focus:border-[#0B1220] transition-colors rounded-sm"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 p-1"
                >
                  <XIcon />
                </button>
              )}
            </div>

            {/* Filter Tabs with Counter */}
            <div className="flex gap-1.5 flex-wrap">
              {([
                ['', 'Semua'],
                ['menunggu', 'Menunggu'],
                ['diproses', 'Diproses'],
                ['diterima', 'Diterima'],
                ['ditolak', 'Ditolak'],
              ] as [Status | '', string][]).map(([val, label]) => {
                const isActive = filterStatus === val;
                return (
                  <button
                    key={val}
                    onClick={() => { setFilterStatus(val); setPage(1); }}
                    className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap rounded-sm ${
                      isActive
                        ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-sm'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {label} <span className={`ml-1 text-[10px] ${isActive ? 'text-white/60' : 'text-slate-400'}`}>({stats[val]})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Bulk Action Bar ── */}
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0B1220] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-sm"
              >
                <span className="text-xs font-semibold">{selected.size} ide terpilih</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={bulkAction}
                    onChange={e => setBulkAction(e.target.value as any)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white focus:outline-none cursor-pointer rounded-sm"
                  >
                    <option value="" className="text-slate-800">Pilih Aksi Massal</option>
                    <option value="menunggu" className="text-slate-800">→ Set Menunggu</option>
                    <option value="diproses" className="text-slate-800">→ Set Diproses</option>
                    <option value="diterima" className="text-slate-800">→ Set Diterima</option>
                    <option value="ditolak" className="text-slate-800">→ Set Ditolak</option>
                    <option value="delete" className="text-slate-800">🗑 Hapus Terpilih</option>
                  </select>

                  <button
                    onClick={executeBulk}
                    disabled={!bulkAction}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase bg-[#E10600] text-white hover:bg-[#c10000] disabled:bg-slate-700 transition-colors rounded-sm"
                  >
                    Terapkan
                  </button>

                  <button
                    onClick={() => { setSelected(new Set()); setBulkAction(''); }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tabel Data Ide Masuk ── */}
          <div className="bg-white border border-slate-200 overflow-x-auto rounded-sm shadow-sm">
            {dataLoading ? (
              <div className="py-20 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin text-slate-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Memuat data ide...</span>
              </div>
            ) : filtered.length === 0 ? (
              /* ── 4. Empty State (Ilustrasi dokumen + Teks "Belum ada ide dengan status ini" + fade-in) ── */
              <motion.div
                className="py-20 px-4 flex flex-col items-center justify-center text-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-700">
                    {filterStatus ? `Belum ada ide dengan status "${STATUS_CFG[filterStatus]?.label}"` : 'Belum ada ide dengan status ini'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {search ? `Tidak ditemukan ide yang cocok dengan kata kunci "${search}".` : 'Belum ada data ide baru yang masuk pada kategori ini.'}
                  </p>
                </div>
                {(search || filterStatus) && (
                  <button
                    onClick={() => { setSearch(''); setFilterStatus(''); }}
                    className="mt-2 text-xs font-bold text-[#E10600] hover:underline"
                  >
                    Reset Filter & Pencarian
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <table className="w-full text-sm min-w-[760px] table-fixed">
                  <colgroup>
                    <col className="w-10" />
                    <col className="w-48" />
                    <col className="w-32" />
                    <col className="" />
                    <col className="w-36" />
                    <col className="w-32" />
                    <col className="w-24" />
                  </colgroup>
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={toggleAll}
                          className="rounded border-slate-300 cursor-pointer"
                          aria-label="Pilih semua baris"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Pengirim
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Deskripsi Singkat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        <button
                          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                        >
                          <span>Dikirim</span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${sortDir === 'asc' ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ── 3d. Animasi Tabel & Filter (Fade-in & Slide-in 0.25s, staggered) ── */}
                    <AnimatePresence>
                      {paginated.map((idea, idx) => {
                        const currentStatus = idea.status || 'menunggu';
                        const isPulsed = pulsedIds.has(idea.id);

                        return (
                          <motion.tr
                            key={idea.id}
                            initial={reduced ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? false : { opacity: 0, y: -8 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(idx * 0.03, 0.15),
                              ease: 'easeOut',
                            }}
                            className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                              selected.has(idea.id) ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selected.has(idea.id)}
                                onChange={() => toggleOne(idea.id)}
                                className="rounded border-slate-300 cursor-pointer"
                                aria-label={`Pilih ide dari ${idea.nama}`}
                              />
                            </td>

                            <td className="px-4 py-3 truncate">
                              <p className="font-semibold text-[#0B1220] truncate">{idea.nama}</p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">{idea.email}</p>
                            </td>

                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold capitalize rounded-sm">
                                {idea.kategori_karya}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                                {idea.deskripsi}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {fmt(idea.submitted_at)}
                            </td>

                            {/* ── 1. Kolom "Status" Badge Pill Berwarna + Dot ● + Pulse + Color Crossfade ── */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={currentStatus} pulse={isPulsed} />
                            </td>

                            {/* ── Tombol REVIEW membuka Modal Review ── */}
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <motion.button
                                onClick={() => openReview(idea)}
                                className="px-3 py-1.5 text-xs font-bold uppercase border border-[#0B1220] text-[#0B1220] rounded-sm"
                                whileHover={reduced ? {} : { backgroundColor: '#0B1220', color: '#ffffff' }}
                                transition={{ duration: 0.18 }}
                              >
                                REVIEW
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                    <p className="text-xs text-slate-500">
                      Halaman {page} dari {totalPages} · {filtered.length} total baris
                    </p>
                    <div className="flex items-center gap-1">
                      {[
                        { label: '«', action: () => setPage(1), disabled: page === 1 },
                        { label: '‹', action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                        { label: '›', action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                        { label: '»', action: () => setPage(totalPages), disabled: page === totalPages },
                      ].map((btn, i) => (
                        <button
                          key={btn.label + i}
                          onClick={btn.action}
                          disabled={btn.disabled}
                          className="px-2.5 py-1 text-xs border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors rounded-sm"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Menampilkan {paginated.length} dari {filtered.length} ide tersaring ({ideas.length} total seluruh ide).
          </p>
        </main>
      </div>

      {/* =========================================================================
          2. & 3a. MODAL REVIEW DENGAN ANIMASI SCALE-IN / FADE & BACKDROP 0.2s
      ========================================================================= */}
      <AnimatePresence>
        {reviewing && (
          <motion.div
            key="review-modal-backdrop"
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setReviewing(null)}
          >
            <motion.div
              key="review-modal-dialog"
              className="bg-white w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden rounded-sm"
              initial={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header: Nama pengirim + email, tombol close (×) di kanan atas */}
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 bg-[#0B1220] text-white">
                <div>
                  <h2 className="font-black text-white text-lg leading-tight">{reviewing.nama}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">{reviewing.email}</p>
                </div>
                <button
                  onClick={() => setReviewing(null)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  aria-label="Tutup modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Modal Body: Kategori badge, tanggal dikirim, deskripsi lengkap, catatan admin */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Meta info bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold capitalize rounded-sm">
                    {reviewing.kategori_karya}
                  </span>
                  <StatusBadge status={reviewing.status || 'menunggu'} />
                  <span className="text-xs text-slate-400 ml-auto">
                    Dikirim: {fmt(reviewing.submitted_at)}
                  </span>
                </div>

                {/* Deskripsi Ide Lengkap (Full text, bukan potongan) */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Deskripsi Ide Lengkap
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-sm">
                    {reviewing.deskripsi}
                  </div>
                </div>

                {/* Portofolio link jika ada */}
                {reviewing.portofolio && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tautan Portofolio / Referensi
                    </p>
                    <a
                      href={reviewing.portofolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#E10600] font-semibold hover:underline break-all"
                    >
                      {reviewing.portofolio} ↗
                    </a>
                  </div>
                )}

                {/* Field Catatan/Feedback Admin (textarea opsional) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Catatan / Feedback Admin <span className="font-normal normal-case text-slate-400">(opsional, untuk dikirim balik ke pengirim)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={updateCatatan}
                    onChange={e => setUpdateCatatan(e.target.value)}
                    placeholder="Tulis catatan peninjauan atau feedback yang akan dikirimkan kepada pengirim ide..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:outline-none focus:border-[#0B1220] resize-none transition-colors rounded-sm"
                  />
                </div>
              </div>

              {/* Modal Footer: 3 tombol aksi ("Tandai Diproses" [biru], "Terima" [hijau], "Tolak" [merah]) */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Aksi Pengubahan Status Ide
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Status saat ini: <strong className="uppercase text-slate-600">{reviewing.status || 'menunggu'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {/* Tombol 1: Tandai Diproses (biru) */}
                  <button
                    onClick={() => applyStatus('diproses')}
                    disabled={saving || reviewing.status === 'diproses'}
                    className={`py-2.5 px-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-sm ${
                      reviewing.status === 'diproses'
                        ? 'bg-blue-600 text-white opacity-40 cursor-not-allowed ring-2 ring-blue-400'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-200 shrink-0"/>
                    <span className="truncate">{reviewing.status === 'diproses' ? 'Diproses (Aktif)' : 'Tandai Diproses'}</span>
                  </button>

                  {/* Tombol 2: Terima (hijau) */}
                  <button
                    onClick={() => applyStatus('diterima')}
                    disabled={saving || reviewing.status === 'diterima'}
                    className={`py-2.5 px-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-sm ${
                      reviewing.status === 'diterima'
                        ? 'bg-emerald-600 text-white opacity-40 cursor-not-allowed ring-2 ring-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 shrink-0"/>
                    <span className="truncate">{reviewing.status === 'diterima' ? 'Diterima (Aktif)' : 'Terima'}</span>
                  </button>

                  {/* Tombol 3: Tolak (merah) */}
                  <button
                    onClick={() => applyStatus('ditolak')}
                    disabled={saving || reviewing.status === 'ditolak'}
                    className={`py-2.5 px-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 rounded-sm ${
                      reviewing.status === 'ditolak'
                        ? 'bg-red-600 text-white opacity-40 cursor-not-allowed ring-2 ring-red-400'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-200 shrink-0"/>
                    <span className="truncate">{reviewing.status === 'ditolak' ? 'Ditolak (Aktif)' : 'Tolak'}</span>
                  </button>
                </div>

                {/* Baris Bawah: Kembalikan ke status Menunggu (opsional jika bukan status menunggu), Hapus, dan Tutup */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    {reviewing.status !== 'menunggu' && (
                      <button
                        onClick={() => applyStatus('menunggu')}
                        disabled={saving}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors rounded-sm"
                      >
                        ← Kembalikan ke Menunggu
                      </button>
                    )}
                    <button
                      onClick={() => deleteIdea(reviewing.id)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 rounded-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Hapus
                    </button>
                  </div>

                  <button
                    onClick={() => setReviewing(null)}
                    className="px-4 py-1.5 text-xs font-bold uppercase border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors rounded-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 3b. Stat Card Component (Staggered Fade-in, Counter 0.8s, Hover Lift 0.2s) ───
function StatCard({
  card,
  stats,
  filterStatus,
  onFilter,
  loaded,
  staggerIndex,
  reduced,
}: {
  card: { key: Status | ''; label: string };
  stats: Record<string, number>;
  filterStatus: Status | '';
  onFilter: (k: Status | '') => void;
  loaded: boolean;
  staggerIndex: number;
  reduced: boolean;
}) {
  const count = useCounter(stats[card.key] ?? 0, 800, loaded);
  const cfg = card.key ? STATUS_CFG[card.key] : null;
  const active = filterStatus === card.key;

  const borderClass = cfg?.borderL ?? 'border-l-[#0B1220]';
  const iconBg      = cfg?.iconBg   ?? 'bg-slate-100';
  const iconColor   = cfg?.iconColor ?? 'text-[#0B1220]';

  const StatIcon = card.key === ''
    ? DocIcon
    : card.key === 'menunggu'
    ? ClockIcon
    : card.key === 'diproses'
    ? RefreshIcon2
    : card.key === 'diterima'
    ? CheckIcon
    : CrossIcon;

  return (
    <motion.button
      onClick={() => onFilter(card.key)}
      className={`bg-white text-left p-4 border border-slate-200 border-l-4 ${borderClass} transition-all duration-200 rounded-sm ${
        active ? 'ring-2 ring-[#0B1220]/20 shadow-md' : 'shadow-sm'
      }`}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: staggerIndex * 0.08, // Staggered delay 80ms antar kartu: 0ms, 80ms, 160ms...
        ease: 'easeOut',
      }}
      whileHover={
        reduced
          ? {}
          : {
              y: -4,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2, ease: 'easeOut' }, // Hover: translateY(-4px) + soft shadow, transisi 0.2s
            }
      }
    >
      <div className={`w-8 h-8 ${iconBg} ${iconColor} flex items-center justify-center mb-3 rounded-sm`}>
        <StatIcon />
      </div>
      <p className="text-2xl font-black text-[#0B1220]">{count}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</p>
    </motion.button>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  );
}

function IdeaIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

function RefreshIcon2() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}
