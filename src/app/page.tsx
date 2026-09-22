"use client";

import { useAppStore } from "@/store/useAppStore";
import {
  Package, TruckIcon, Leaf, TrendingUp, ArrowRight, Zap,
  MapPin, Clock, CheckCircle2, Activity, BarChart3, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatTL, formatWeight, timeAgoTR } from "@/lib/algorithm";

function StatCard({
  title, value, subtitle, icon: Icon, trend, color,
}: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; trend?: string;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const c = {
    blue:    { ring: "bg-blue-100",    icon: "text-blue-600",    trend: "text-blue-600"    },
    emerald: { ring: "bg-emerald-100", icon: "text-emerald-600", trend: "text-emerald-600" },
    amber:   { ring: "bg-amber-100",   icon: "text-amber-600",   trend: "text-amber-600"   },
    purple:  { ring: "bg-purple-100",  icon: "text-purple-600",  trend: "text-purple-600"  },
  }[color];

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", c.ring)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", c.trend)}>
            <ArrowUpRight className="w-3.5 h-3.5" />{trend}
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-500 mt-0.5">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

function RouteVisual({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-1 text-sm min-w-0">
      <div className="flex items-center gap-1 text-slate-700 font-medium min-w-0">
        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="truncate max-w-[70px] sm:max-w-[90px]">{from}</span>
      </div>
      <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
      <div className="flex items-center gap-1 text-slate-700 font-medium min-w-0">
        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="truncate max-w-[70px] sm:max-w-[90px]">{to}</span>
      </div>
    </div>
  );
}

function CargoTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 shrink-0">
      {type}
    </span>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className={cn("w-3 h-3", i <= Math.floor(score) ? "text-amber-400" : "text-slate-200")}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-slate-500 font-medium">{score.toFixed(1)}</span>
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  available:  { label: "Müsait", cls: "badge-green"  },
  matched:    { label: "Eşleşti", cls: "badge-blue"  },
  in_transit: { label: "Yolda",   cls: "badge-amber" },
  delivered:  { label: "Teslim",  cls: "badge-slate" },
};

export default function DashboardPage() {
  const loads  = useAppStore((s) => s.loads);
  const trucks = useAppStore((s) => s.trucks);
  const stats  = useAppStore((s) => s.stats);

  const recentLoads = loads.slice(0, 8);
  const topRoutes = [
    { from: "İstanbul", to: "Ankara",  count: 12, pct: 85 },
    { from: "İzmir",    to: "Konya",   count: 9,  pct: 68 },
    { from: "Ankara",   to: "Erzurum", count: 8,  pct: 60 },
    { from: "Bursa",    to: "Samsun",  count: 7,  pct: 52 },
    { from: "Gaziantep",to: "İstanbul",count: 6,  pct: 44 },
  ];

  return (
    <div className="page-enter p-4 sm:p-6 lg:p-8 space-y-5 lg:space-y-8 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Merhaba, Mehmet 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Bugün{" "}
            <span className="font-semibold text-blue-600">{stats.totalActiveLoads} aktif yük</span>{" "}
            rotanızı bekliyor.
          </p>
        </div>
        <Link href="/eslestir" className="shrink-0">
          <button className="btn-primary flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
            <Zap className="w-4 h-4" />
            Eşleştirmeye Başla
          </button>
        </Link>
      </div>

      {/* Stat Cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Aktif Yük"      value={String(stats.totalActiveLoads)}                      subtitle="Hemen alınabilir"      icon={Package}    trend="+8%"  color="blue"    />
        <StatCard title="Aktif Araç"     value={String(stats.activeTrucks)}                          subtitle="Yolda veya yükleniyor" icon={TruckIcon}  trend="+3%"  color="amber"   />
        <StatCard title="Önlenen CO₂"    value={`${(stats.preventedEmissionsKg / 1000).toFixed(1)}t`} subtitle="Bu ay toplam"         icon={Leaf}       trend="+22%" color="emerald" />
        <StatCard title="Platform Cirosu" value={formatTL(stats.totalRevenueTL)}                    subtitle="Tamamlanan yükler"     icon={TrendingUp} trend="+15%" color="purple"  />
      </div>

      {/* Activity Bar */}
      <div className="card-base p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base">Yük Durumu Özeti</h2>
          </div>
          <span className="text-xs text-slate-400">Toplam {stats.totalLoads} yük</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Müsait",  value: stats.totalActiveLoads, color: "bg-emerald-500", pct: (stats.totalActiveLoads / stats.totalLoads) * 100 },
            { label: "Eşleşti",value: stats.matchedLoads,      color: "bg-blue-500",    pct: (stats.matchedLoads / stats.totalLoads) * 100      },
            { label: "Yolda",  value: stats.inTransitLoads,    color: "bg-amber-500",   pct: (stats.inTransitLoads / stats.totalLoads) * 100    },
            { label: "Teslim", value: stats.totalLoads - stats.totalActiveLoads - stats.matchedLoads - stats.inTransitLoads,
              color: "bg-slate-300",
              pct: ((stats.totalLoads - stats.totalActiveLoads - stats.matchedLoads - stats.inTransitLoads) / stats.totalLoads) * 100 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <span className="text-sm font-bold text-slate-800">{item.value}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", item.color)}
                  style={{ width: `${item.pct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">%{item.pct.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col grid — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Loads */}
        <div className="lg:col-span-2 card-base overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Son Yükler</h2>
            </div>
            <Link href="/yuklerim" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Tümü <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentLoads.map((load) => {
              const s = STATUS_MAP[load.status] ?? { label: load.status, cls: "badge-slate" };
              return (
                <div key={load.id} className="px-4 sm:px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-mono text-slate-400">{load.id}</span>
                        <CargoTypeBadge type={load.cargoType} />
                        {load.isSurgePricing && (
                          <span className="badge-amber text-[10px]">
                            <Zap className="w-2.5 h-2.5" />+{load.surgePercent}%
                          </span>
                        )}
                      </div>
                      <RouteVisual from={load.from.name} to={load.to.name} />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{formatTL(load.recommendedPriceTL)}</p>
                      <p className="text-xs text-slate-400">{formatWeight(load.weightKg)}</p>
                    </div>
                    <div className="shrink-0 hidden sm:flex flex-col items-end gap-1">
                      <span className={s.cls}>{s.label}</span>
                      <StarRating score={load.trustScore} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Top Routes */}
          <div className="card-base p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">En Yoğun Rotalar</h2>
            </div>
            <div className="space-y-3">
              {topRoutes.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-medium">{r.from} → {r.to}</span>
                    <span className="text-xs font-bold text-slate-800">{r.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full gradient-blue rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="relative overflow-hidden rounded-2xl gradient-blue p-5 sm:p-6 text-white">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg leading-tight mb-2">Boş Dönüş?<br />Para Kaybetme.</h3>
              <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                Rota üzerindeki yükleri bul, ekstra kazanç elde et.
              </p>
              <Link href="/eslestir">
                <button className="w-full bg-white text-blue-700 text-sm font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  Şimdi Eşleştir <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -right-2 w-16 h-16 bg-white/5 rounded-full" />
          </div>

          {/* Active Trucks */}
          <div className="card-base p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <TruckIcon className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Araçlarım</h2>
            </div>
            <div className="space-y-3">
              {trucks.slice(0, 4).map((truck) => (
                <div key={truck.id} className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full shrink-0",
                    truck.status === "en_route" ? "bg-emerald-500" :
                    truck.status === "loading"  ? "bg-amber-500"   : "bg-slate-300")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{truck.plate}</p>
                    <p className="text-[10px] text-slate-400 truncate">{truck.driverName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-slate-700">
                      {truck.status === "en_route" ? "Yolda" : truck.status === "loading" ? "Yükleniyor" : "Boşta"}
                    </p>
                    <p className="text-[10px] text-slate-400">{truck.from.name} → {truck.to.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
