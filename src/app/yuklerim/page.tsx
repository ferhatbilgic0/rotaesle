"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { formatTL, formatWeight, timeAgoTR, deadlineTR } from "@/lib/algorithm";
import { Load } from "@/data/mockData";
import {
  Package, MapPin, ArrowRight, Clock, Search, Zap, Phone,
  Snowflake, Shield, TruckIcon, CheckCircle2, XCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey     = "newest" | "price_high" | "price_low" | "weight" | "trust";
type FilterStatus = "all" | "available" | "matched" | "in_transit" | "delivered";

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  available:  { label: "Müsait",        cls: "badge-green",  dot: "bg-emerald-500" },
  matched:    { label: "Eşleşti",       cls: "badge-blue",   dot: "bg-blue-500"    },
  in_transit: { label: "Yolda",         cls: "badge-amber",  dot: "bg-amber-500"   },
  delivered:  { label: "Teslim Edildi", cls: "badge-slate",  dot: "bg-slate-400"   },
};

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={cn("w-3 h-3", i <= Math.round(score) ? "text-amber-400" : "text-slate-200")}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-0.5">{score.toFixed(1)}</span>
    </div>
  );
}

// ── Mobile Load Card ──────────────────────────────────────────────────────────
function LoadCard({ load, isMyLoad, onAccept, onRelease }: {
  load: Load; isMyLoad: boolean; onAccept: () => void; onRelease: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_MAP[load.status];

  return (
    <div className={cn("card-base overflow-hidden", isMyLoad && "ring-2 ring-blue-200")}>
      {/* Surge banner */}
      {load.isSurgePricing && (
        <div className="px-3 py-1 gradient-amber flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white">Talep Yüksek +{load.surgePercent}%</span>
        </div>
      )}

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[10px] font-mono text-slate-400">{load.id}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">{load.cargoType}</span>
              <span className={s.cls}>{s.label}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="truncate">{load.from.name}</span>
              <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">{load.to.name}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{load.shipperName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold text-slate-900">{formatTL(load.recommendedPriceTL)}</p>
            <p className="text-xs text-slate-400">{formatWeight(load.weightKg)}</p>
          </div>
        </div>

        {/* Middle row */}
        <div className="flex items-center justify-between mb-3">
          <StarRating score={load.trustScore} />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[120px]">{deadlineTR(load.pickupDeadline)}</span>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mb-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-100">
            <p>{load.description}</p>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3 h-3 shrink-0" />{load.contactPhone}
            </div>
            <div className="flex items-center gap-3 text-slate-500 flex-wrap">
              {load.requiresCooling   && <span className="flex items-center gap-1"><Snowflake className="w-3 h-3 text-blue-500" />Soğuk Zincir</span>}
              {load.requiresInsurance && <span className="flex items-center gap-1"><Shield    className="w-3 h-3 text-slate-400" />Sigorta Önerilir</span>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {load.status === "available" && (
            isMyLoad ? (
              <button onClick={onRelease}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
                <XCircle className="w-3.5 h-3.5" />Bırak
              </button>
            ) : (
              <button onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />Kabul Et
              </button>
            )
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Table Row ─────────────────────────────────────────────────────────
function LoadRow({ load, isMyLoad, onAccept, onRelease }: {
  load: Load; isMyLoad: boolean; onAccept: () => void; onRelease: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_MAP[load.status];

  return (
    <div className={cn("border-b border-slate-50 hover:bg-slate-50/50 transition-colors", isMyLoad && "bg-blue-50/30")}>
      <div className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
          <div className="w-28 shrink-0">
            <p className="text-xs font-mono text-slate-500">{load.id}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium mt-0.5 inline-block">{load.cargoType}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{load.from.name}</span>
              <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{load.to.name}</span>
            </div>
            <p className="text-xs text-slate-400 truncate">{load.shipperName}</p>
          </div>
          <div className="w-24 shrink-0">
            <p className="text-sm font-semibold text-slate-700">{formatWeight(load.weightKg)}</p>
            <p className="text-[10px] text-slate-400">{load.volumeM3} m³</p>
          </div>
          <div className="w-32 shrink-0 text-right">
            <div className="flex items-center justify-end gap-1">
              <p className="text-sm font-bold text-slate-900">{formatTL(load.recommendedPriceTL)}</p>
              {load.isSurgePricing && <span className="badge-amber text-[9px] py-0.5 px-1.5"><Zap className="w-2.5 h-2.5" /></span>}
            </div>
            <p className="text-[10px] text-slate-400">{load.pricePerKm} TL/km</p>
          </div>
          <div className="w-28 shrink-0"><StarRating score={load.trustScore} /></div>
          <div className="w-24 shrink-0"><span className={s.cls}>{s.label}</span></div>
          <div className="flex items-center gap-1.5 shrink-0">
            {load.status === "available" && (
              isMyLoad ? (
                <button onClick={onRelease}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />Bırak
                </button>
              ) : (
                <button onClick={onAccept}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />Al
                </button>
              )
            )}
            <button onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 ml-6 pl-4 border-l-2 border-blue-100 space-y-1">
            <p className="text-xs text-slate-600">{load.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{load.contactPhone}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgoTR(load.postedAt)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-red-400" />{deadlineTR(load.pickupDeadline)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function YuklerimPage() {
  const loads          = useAppStore((s) => s.loads);
  const myMatchedLoads = useAppStore((s) => s.myMatchedLoads);
  const acceptLoad     = useAppStore((s) => s.acceptLoad);
  const releaseLoad    = useAppStore((s) => s.releaseLoad);

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortKey, setSortKey]         = useState<SortKey>("newest");
  const [showMyOnly, setShowMyOnly]   = useState(false);

  const cargoTypes = useMemo(() => {
    const types = [...new Set(loads.map((l) => l.cargoType))].sort();
    return ["all", ...types];
  }, [loads]);

  const [cargoFilter, setCargoFilter] = useState("all");

  const filtered = useMemo(() => {
    let r = loads;
    if (showMyOnly)        r = r.filter(l => myMatchedLoads.includes(l.id));
    if (statusFilter !== "all") r = r.filter(l => l.status === statusFilter);
    if (cargoFilter  !== "all") r = r.filter(l => l.cargoType === cargoFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(l =>
        l.id.toLowerCase().includes(q)          ||
        l.from.name.toLowerCase().includes(q)   ||
        l.to.name.toLowerCase().includes(q)     ||
        l.shipperName.toLowerCase().includes(q) ||
        l.cargoType.toLowerCase().includes(q)
      );
    }
    const copy = [...r];
    switch (sortKey) {
      case "price_high": copy.sort((a,b) => b.recommendedPriceTL - a.recommendedPriceTL); break;
      case "price_low":  copy.sort((a,b) => a.recommendedPriceTL - b.recommendedPriceTL); break;
      case "weight":     copy.sort((a,b) => b.weightKg - a.weightKg); break;
      case "trust":      copy.sort((a,b) => b.trustScore - a.trustScore); break;
      default:           copy.sort((a,b) => b.postedAt.getTime() - a.postedAt.getTime());
    }
    return copy;
  }, [loads, search, statusFilter, cargoFilter, sortKey, showMyOnly, myMatchedLoads]);

  const totalValue = useMemo(() => filtered.reduce((s,l) => s + l.recommendedPriceTL, 0), [filtered]);

  return (
    <div className="page-enter p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600 shrink-0" />Yük Listesi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Platformdaki tüm aktif ve geçmiş yük ilanları</p>
        </div>
        {myMatchedLoads.length > 0 && (
          <button
            onClick={() => setShowMyOnly(!showMyOnly)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all shrink-0",
              showMyOnly ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
            )}>
            <TruckIcon className="w-4 h-4" />Kabul Ettiklerim ({myMatchedLoads.length})
          </button>
        )}
      </div>

      {/* Stats — 2×2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Toplam Yük",    value: filtered.length,                                       sub: `${loads.length} içinden`,  color: "text-blue-600"    },
          { label: "Toplam Değer",  value: formatTL(totalValue),                                  sub: "filtrelenmiş",             color: "text-emerald-600" },
          { label: "Müsait",        value: filtered.filter(l => l.status === "available").length, sub: "hemen alınabilir",         color: "text-emerald-600" },
          { label: "Kabul Ettim",   value: myMatchedLoads.length,                                 sub: "aktif yüküm",              color: "text-purple-600"  },
        ].map((s) => (
          <div key={s.label} className="card-base p-3 sm:p-4">
            <p className={cn("text-xl sm:text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-base p-3 sm:p-4 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Şehir, firma, yük tipi..."
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none flex-1" />
        </div>

        {/* Status pills — scrollable row on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1">
          {(["all","available","matched","in_transit","delivered"] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0",
                statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-700"
              )}>
              {s === "all" ? "Tümü" : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>

        {/* Cargo + Sort — side by side */}
        <div className="flex gap-2">
          <select value={cargoFilter} onChange={(e) => setCargoFilter(e.target.value)}
            className="flex-1 text-xs font-medium px-3 py-2 bg-slate-100 border-0 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            {cargoTypes.map(t => <option key={t} value={t}>{t === "all" ? "Tüm Yük Tipleri" : t}</option>)}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="flex-1 text-xs font-medium px-3 py-2 bg-slate-100 border-0 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            <option value="newest">En Yeni</option>
            <option value="price_high">En Yüksek Fiyat</option>
            <option value="price_low">En Düşük Fiyat</option>
            <option value="weight">En Ağır</option>
            <option value="trust">En Güvenilir</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 text-right">{filtered.length} sonuç</p>
      </div>

      {/* ── MOBILE: Card Grid ── */}
      <div className="lg:hidden">
        {filtered.length === 0 ? (
          <div className="card-base py-14 text-center">
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Yük bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(load => (
              <LoadCard key={load.id} load={load}
                isMyLoad={myMatchedLoads.includes(load.id)}
                onAccept={() => acceptLoad(load.id)}
                onRelease={() => releaseLoad(load.id)} />
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden lg:block card-base overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 shrink-0" />
            <div className="w-28 shrink-0">ID / Tip</div>
            <div className="flex-1">Rota / Firma</div>
            <div className="w-24 shrink-0">Ağırlık</div>
            <div className="w-32 shrink-0 text-right">Ücret</div>
            <div className="w-28 shrink-0">Güven</div>
            <div className="w-24 shrink-0">Durum</div>
            <div className="w-24 shrink-0 text-right">İşlem</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Yük bulunamadı</p>
          </div>
        ) : (
          filtered.map(load => (
            <LoadRow key={load.id} load={load}
              isMyLoad={myMatchedLoads.includes(load.id)}
              onAccept={() => acceptLoad(load.id)}
              onRelease={() => releaseLoad(load.id)} />
          ))
        )}

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {filtered.length} yük · Toplam: <span className="font-semibold text-slate-700">{formatTL(totalValue)}</span>
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Canlı veri
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
