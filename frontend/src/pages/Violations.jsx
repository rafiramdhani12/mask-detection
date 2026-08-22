import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";



const API_BASE = "http://localhost:5000";

// ==========================================
// ICONS (inline SVG, no external dependency)
// ==========================================
const IconAlert = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCheck = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCamera = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 8a2 2 0 0 1 2-2h2l1.5-2h5L14 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
const IconSearch = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </svg>
);
const IconRefresh = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconUser = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>
);

// Hazard stripe pattern - dipakai sebagai signature element,
// cuma muncul di baris yang statusnya "belum ditindak" (unresolved)
const hazardStripeStyle = {
  backgroundImage:
    "repeating-linear-gradient(135deg, #F5A623 0px, #F5A623 6px, #0B0F14 6px, #0B0F14 12px)",
};

function formatTimestamp(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400 tabular-nums">{pct}%</span>
    </div>
  );
}

function StatusBadge({ notified }) {
  if (notified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
        <IconCheck className="h-3 w-3" />
        Sudah Ditindak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
      <IconAlert className="h-3 w-3" />
      Belum Ditindak
    </span>
  );
}

function ViolationRow({ v }) {
  const employeeLabel = v.employee_id ? v.employee_id : "Tidak Dikenali";
  return (
    <div className="relative flex gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 pl-5 transition-colors hover:bg-slate-900/70">
      {!v.notified && (
        <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-lg" style={hazardStripeStyle} />
      )}

      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-slate-800 ring-1 ring-slate-700">
        {v.snapshot_base64 ? (
          <img
            src={
              v.snapshot_base64.startsWith("data:")
                ? v.snapshot_base64
                : `data:image/jpeg;base64,${v.snapshot_base64}`
            }
            alt="Snapshot pelanggaran"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <IconCamera className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <IconUser className="h-3.5 w-3.5 text-slate-500" />
              <span className={`truncate text-sm font-semibold ${v.employee_id ? "text-slate-100" : "text-slate-500 italic"}`}>
                {employeeLabel}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <IconCamera className="h-3 w-3" />
                {v.camera_id || "UNKNOWN_CAM"}
              </span>
              <span className="font-mono">{formatTimestamp(v.timestamp)}</span>
            </div>
          </div>
          <StatusBadge notified={v.notified} />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-24 shrink-0">Keyakinan model</span>
              <ConfidenceBar value={v.confidence} />
            </div>
            {v.match_score !== null && v.match_score !== undefined && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-24 shrink-0">Skor pencocokan</span>
                <ConfidenceBar value={v.match_score} />
              </div>
            )}
          </div>
          {v.violation_id && (
            <span className="font-mono text-[10px] text-slate-600">#{v.violation_id.slice(-8)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }) {
  const toneClasses = tone === "danger" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-slate-100";
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${toneClasses}`}>{value}</div>
    </div>
  );
}

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all | unresolved | resolved
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const demoData = [
    {
      violation_id: "demo0000001",
      employee_id: "EMP001",
      camera_id: "CAM_LOBBY_01",
      confidence: 0.94,
      match_score: 0.81,
      snapshot_base64: null,
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      notified: false,
    },
    {
      violation_id: "demo0000002",
      employee_id: null,
      camera_id: "CAM_GUDANG_02",
      confidence: 0.88,
      match_score: null,
      snapshot_base64: null,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      notified: false,
    },
    {
      violation_id: "demo0000003",
      employee_id: "EMP014",
      camera_id: "CAM_LOBBY_01",
      confidence: 0.97,
      match_score: 0.9,
      snapshot_base64: null,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      notified: true,
    },
  ];

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/violations`);
      if (!res.ok) throw new Error(`Server merespons status ${res.status}`);
      const data = await res.json();
      setViolations(Array.isArray(data) ? data : data.violations || []);
      setIsDemoData(false);
    } catch (err) {
      // Endpoint GET /violations belum ada di backend -> fallback ke data demo
      // biar tampilan tetap bisa dicek, bukan blank error.
      setViolations(demoData);
      setIsDemoData(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const filtered = useMemo(() => {
    return violations
      .filter((v) => {
        if (statusFilter === "unresolved") return !v.notified;
        if (statusFilter === "resolved") return v.notified;
        return true;
      })
      .filter((v) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (v.employee_id || "").toLowerCase().includes(q) ||
          (v.camera_id || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [violations, statusFilter, search]);

  const stats = useMemo(() => {
    const total = violations.length;
    const unresolved = violations.filter((v) => !v.notified).length;
    const uniqueCameras = new Set(violations.map((v) => v.camera_id)).size;
    return { total, unresolved, uniqueCameras };
  }, [violations]);

  return (
    <div className="min-h-screen bg-[#0B0F14] px-6 py-8 text-slate-200 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <ArrowLeft className="mb-6 h-6 w-6 cursor-pointer fill-slate-400 hover:fill-slate-300" onClick={() => navigate(-1)} />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-500">
              Sistem Monitoring K3
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-50">Log Pelanggaran Masker</h1>
            <p className="mt-1 text-sm text-slate-500">
              Riwayat deteksi pekerja tanpa masker dari seluruh kamera pengawasan.
            </p>
          </div>
          <button
            onClick={fetchViolations}
            className="flex shrink-0 items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
        </div>

        {isDemoData && (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-400">
            Menampilkan data contoh — endpoint <code className="font-mono">GET /violations</code> belum tersambung ke backend Flask.
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Total Pelanggaran" value={stats.total} />
          <StatCard label="Belum Ditindak" value={stats.unresolved} tone="danger" />
          <StatCard label="Kamera Aktif" value={stats.uniqueCameras} tone="warn" />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-1">
            {[
              { key: "all", label: "Semua" },
              { key: "unresolved", label: "Belum Ditindak" },
              { key: "resolved", label: "Sudah Ditindak" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === tab.key ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karyawan atau kamera..."
              className="w-full rounded-md border border-slate-800 bg-slate-900/40 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-slate-900/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 py-16 text-center">
            <IconCheck className="mx-auto h-8 w-8 text-slate-700" />
            <p className="mt-3 text-sm text-slate-500">Tidak ada pelanggaran yang cocok dengan filter ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((v, i) => (
              <ViolationRow key={v.violation_id || i} v={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}