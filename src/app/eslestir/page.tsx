"use client";

import { useState, useMemo } from "react";
import { PROVINCES, Province } from "@/data/provinces";
import { useAppStore } from "@/store/useAppStore";
import { findMatchingLoads, MatchedLoad, formatTL, formatWeight, deadlineTR } from "@/lib/algorithm";
import { haversineDistance } from "@/data/mockData";
import {
  MapPin, ArrowRight, Zap, Package, TruckIcon, CheckCircle2,
  Phone, Shield, ChevronDown, Search, SlidersHorizontal,
  Navigation, Clock, Info, Snowflake, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Province Select ──────────────────────────────────────────────────────────
function ProvinceSelect({
  value, onChange, placeholder, exclude,
}: {
  value: Province | null;
  onChange: (p: Province) => void;
  placeholder: string;
  exclude?: number;
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    PROVINCES.filter(p => p.id !== exclude && p.name.toLowerCase().includes(search.toLowerCase())),
    [search, exclude]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all",
          open ? "border-blue-400 ring-2 ring-blue-500/20 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
        )}
      >
        <MapPin className={cn("w-4 h-4 shrink-0", value ? "text-blue-500" : "text-slate-300")} />
        <span className={cn("flex-1 text-sm font-medium truncate", value ? "text-slate-900" : "text-slate-400")}>
          {value?.name ?? placeholder}
        </span>
        {value && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md hidden sm:inline">{value.region}</span>}
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Şehir ara..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">Şehir bulunamadı</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{p.region}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Route Visualization ───────────────────────────────────────────────────────
function RouteVisualization({ start, end, waypoints }: {
  start: Province; end: Province; waypoints: Province[];
}) {
  const directKm = haversineDistance(start.lat, start.lng, end.lat, end.lng);
  const shown    = waypoints.slice(0, 3);

  return (
    <div className="card-base p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Rota Görselleştirmesi</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">~{Math.round(directKm)} km</span>
      </div>

      {/* Node row */}
      <div className="flex items-center">
        {/* Start */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-blue flex items-center justify-center shadow-md shadow-blue-200">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-800 mt-1.5 text-center max-w-[60px] truncate">{start.name}</p>
        </div>

        {/* Waypoints */}
        <div className="flex-1 flex items-center min-w-0 mx-2">
          {shown.map((wp) => (
            <div key={wp.id} className="flex items-center flex-1 min-w-0">
              <div className="flex-1 h-0.5 route-line opacity-40" />
              <div className="flex flex-col items-center mx-0.5 sm:mx-1 shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
                  <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                </div>
                <p className="text-[9px] font-semibold text-slate-600 mt-1 text-center max-w-[45px] truncate hidden sm:block">{wp.name}</p>
              </div>
            </div>
          ))}
          {shown.length === 0 && <div className="flex-1 h-0.5 route-line opacity-40" />}
        </div>

        {/* End */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-emerald flex items-center justify-center shadow-md shadow-emerald-200">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-800 mt-1.5 text-center max-w-[60px] truncate">{end.name}</p>
        </div>
      </div>

      {/* Label row */}
      <div className="flex justify-center mt-2 flex-wrap gap-1">
        <span className="text-[10px] text-slate-400">{start.name}</span>
        {shown.map((wp) => (
          <span key={wp.id} className="text-[10px] flex items-center gap-0.5 text-amber-600 font-medium">
            <ArrowRight className="w-2.5 h-2.5 text-slate-300" />{wp.name}
          </span>
        ))}
        <span className="text-[10px] flex items-center gap-0.5 text-slate-400">
          <ArrowRight className="w-2.5 h-2.5 text-slate-300" />{end.name}
        </span>
      </div>
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, onAccept, accepted }: {
  match: MatchedLoad; onAccept: () => void; accepted: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { load, perpendicularKm, extraKm, earningsTL, tlPerExtraKm, isSurge, surgePercent } = match;

  return (
    <div className={cn("card-base overflow-hidden transition-all duration-200",
      accepted && "ring-2 ring-emerald-400 shadow-emerald-100")}>

      {isSurge && (
        <div className="px-4 py-1.5 gradient-amber flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="text-xs font-bold text-white">Talep Yüksek — %{surgePercent} Ekstra Kazanç</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="text-[10px] font-mono text-slate-400">{load.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">{load.cargoType}</span>
              {load.requiresCooling  && <span className="badge-blue  text-[10px] py-0.5"><Snowflake className="w-2.5 h-2.5" />Soğuk</span>}
              {load.requiresInsurance && <span className="badge-slate text-[10px] py-0.5"><Shield    className="w-2.5 h-2.5" /></span>}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 flex-wrap">
              <span className="text-blue-600">{load.from.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>{load.to.name}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{load.shipperName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{formatTL(earningsTL)}</p>
            {isSurge && (
              <p className="text-[10px] text-amber-600 font-medium">
                +{formatTL(earningsTL - load.recommendedPriceTL)}
              </p>
            )}
            <p className="text-xs text-slate-400">{formatTL(tlPerExtraKm)}/km</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-base sm:text-lg font-bold text-blue-700">{perpendicularKm}</p>
            <p className="text-[10px] text-blue-500 font-medium leading-tight">km rota sapması</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-base sm:text-lg font-bold text-slate-700">{extraKm}</p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">km ekstra yol</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-base sm:text-lg font-bold text-emerald-700">{formatWeight(load.weightKg)}</p>
            <p className="text-[10px] text-emerald-500 font-medium leading-tight">yük ağırlığı</p>
          </div>
        </div>

        {/* Trust + Deadline */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className={cn("w-3.5 h-3.5", i <= Math.floor(load.trustScore) ? "text-amber-400" : "text-slate-200")}
                  fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">{load.trustScore.toFixed(1)}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Güven Skoru</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{deadlineTR(load.pickupDeadline)}</span>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-100">
            <p className="font-medium text-slate-700">{load.description}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <Phone className="w-3 h-3 shrink-0" />{load.contactPhone}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Package className="w-3 h-3 shrink-0" />{load.volumeM3} m³ · {load.pricePerKm} TL/km
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {accepted ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />Yük Kabul Edildi
            </div>
          ) : (
            <button onClick={onAccept} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 py-2.5">
              <CheckCircle2 className="w-4 h-4" />Yükü Kabul Et
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="btn-secondary text-sm px-3 sm:px-4 py-2.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{expanded ? "Kapat" : "Detay"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EslestirPage() {
  const loads          = useAppStore((s) => s.loads);
  const myMatchedLoads = useAppStore((s) => s.myMatchedLoads);
  const acceptLoad     = useAppStore((s) => s.acceptLoad);

  const [startCity, setStartCity]   = useState<Province | null>(null);
  const [endCity,   setEndCity]     = useState<Province | null>(null);
  const [maxDeviation, setMaxDeviation] = useState(100);
  const [searched, setSearched]     = useState(false);
  const [sortBy, setSortBy]         = useState<"score" | "price" | "deviation">("score");

  const matches = useMemo(() => {
    if (!startCity || !endCity) return [];
    return findMatchingLoads(startCity, endCity, loads, maxDeviation);
  }, [startCity, endCity, loads, maxDeviation, searched]); // eslint-disable-line

  const sortedMatches = useMemo(() => {
    const copy = [...matches];
    if (sortBy === "price")     copy.sort((a, b) => b.earningsTL - a.earningsTL);
    else if (sortBy === "deviation") copy.sort((a, b) => a.extraKm - b.extraKm);
    else copy.sort((a, b) => b.score - a.score);
    return copy;
  }, [matches, sortBy]);

  const waypoints     = useMemo(() => sortedMatches.slice(0, 3).map(m => m.load.from), [sortedMatches]);
  const totalEarnings = useMemo(() => sortedMatches.reduce((s, m) => s + m.earningsTL, 0), [sortedMatches]);
  const directKm      = useMemo(() => {
    if (!startCity || !endCity) return 0;
    return Math.round(haversineDistance(startCity.lat, startCity.lng, endCity.lat, endCity.lng));
  }, [startCity, endCity]);

  const handleSwap = () => { const t = startCity; setStartCity(endCity); setEndCity(t); };

  return (
    <div className="page-enter p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px]">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 gradient-blue rounded-xl flex items-center justify-center shrink-0">
            <TruckIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Boş Kapasite Eşleştir</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10">Rotanız üzerindeki yükleri bulun, boş dönüş yerine kazanç elde edin.</p>
      </div>

      {/* Search Panel */}
      <div className="card-base p-4 sm:p-6">
        {/* City selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-1 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Kalkış</label>
            <ProvinceSelect value={startCity} onChange={setStartCity} placeholder="Başlangıç şehri" exclude={endCity?.id} />
          </div>

          {/* Swap — row on mobile, centered col on desktop */}
          <div className="flex sm:hidden justify-center">
            <button onClick={handleSwap}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors rotate-90">
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="hidden sm:flex lg:col-span-1 justify-center items-end pb-0.5">
            <button onClick={handleSwap}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="sm:col-span-1 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Varış</label>
            <ProvinceSelect value={endCity} onChange={setEndCity} placeholder="Hedef şehri" exclude={startCity?.id} />
          </div>

          <div className="lg:col-span-3">
            <button
              onClick={() => { if (startCity && endCity) setSearched(true); }}
              disabled={!startCity || !endCity}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                startCity && endCity ? "btn-primary" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <Search className="w-4 h-4" />Yük Ara
            </button>
          </div>
        </div>

        {/* Deviation Slider */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-sm font-semibold text-slate-700">Maksimum Sapma Toleransı</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-blue-600">{maxDeviation}</span>
              <span className="text-sm font-medium text-slate-500">km</span>
            </div>
          </div>

          <div className="relative h-6 flex items-center">
            <div className="w-full h-2 bg-slate-100 rounded-full relative">
              <div className="absolute left-0 top-0 h-full gradient-blue rounded-full transition-all"
                style={{ width: `${(maxDeviation / 300) * 100}%` }} />
            </div>
            <input type="range" min={20} max={300} step={10} value={maxDeviation}
              onChange={(e) => { setMaxDeviation(Number(e.target.value)); setSearched(false); }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-6" />
            <div className="absolute w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md shadow-blue-300 transition-all pointer-events-none"
              style={{ left: `calc(${(maxDeviation / 300) * 100}% - 10px)` }} />
          </div>

          <div className="flex justify-between mt-1">
            {[20, 50, 100, 150, 200, 300].map((v) => (
              <button key={v} onClick={() => { setMaxDeviation(v); setSearched(false); }}
                className={cn("text-[10px] font-medium transition-colors",
                  maxDeviation === v ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600")}>
                {v}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route Visualization */}
      {startCity && endCity && (
        <RouteVisualization start={startCity} end={endCity} waypoints={waypoints} />
      )}

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {sortedMatches.length > 0
                  ? `${sortedMatches.length} Eşleşen Yük Bulundu`
                  : "Eşleşen Yük Bulunamadı"}
              </h2>
              {sortedMatches.length > 0 && (
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-blue-600">{startCity?.name}</span>
                  {" → "}
                  <span className="font-semibold text-emerald-600">{endCity?.name}</span>
                  {" · "}~{directKm} km · maks {maxDeviation} km sapma
                </p>
              )}
            </div>

            {sortedMatches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[10px] text-emerald-600 font-medium">Toplam Kazanç</p>
                  <p className="text-base font-bold text-emerald-700">{formatTL(totalEarnings)}</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {([["score","En İyi"],["price","Ücret"],["deviation","Sapma"]] as const).map(([k, lbl]) => (
                    <button key={k} onClick={() => setSortBy(k)}
                      className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        sortBy === k ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {sortedMatches.length === 0 ? (
            <div className="card-base p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Bu rotada yük bulunamadı</h3>
              <p className="text-sm text-slate-500">Sapma toleransını artırmayı deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
              {sortedMatches.map((match) => (
                <MatchCard key={match.load.id} match={match}
                  accepted={myMatchedLoads.includes(match.load.id)}
                  onAccept={() => acceptLoad(match.load.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div className="card-base p-8 sm:p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 gradient-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Navigation className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-2">Rotanızı Girin</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Kalkış ve varış noktanızı seçin. Algoritmamız sapma toleransı dahilinde en verimli yükleri hesaplayacak.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[["Ankara","Erzurum"],["İstanbul","Konya"],["İzmir","Sivas"],["Bursa","Trabzon"]].map(([from, to]) => (
              <button key={`${from}-${to}`}
                onClick={() => {
                  const f = PROVINCES.find(p => p.name === from);
                  const t = PROVINCES.find(p => p.name === to);
                  if (f) setStartCity(f);
                  if (t) setEndCity(t);
                }}
                className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                {from} → {to}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
