"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatTL } from "@/lib/algorithm";
import { BarChart3, TrendingUp, Package, Leaf, TruckIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
const LOAD_DATA = [18, 24, 31, 27, 38, 45];
const REV_DATA = [42000, 61000, 78000, 69000, 95000, 118000];
const MATCH_DATA = [65, 70, 74, 68, 80, 87];

export default function AnalitikPage() {
  const stats = useAppStore((s) => s.stats);
  const maxLoads = Math.max(...LOAD_DATA);
  const maxRev = Math.max(...REV_DATA);

  return (
    <div className="page-enter p-8 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Analitik
        </h1>
        <p className="text-slate-500 text-sm mt-1">Platform performans göstergeleri</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: "Aylık Gelir", value: formatTL(118000), trend: "+24%", icon: TrendingUp, color: "blue" },
          { label: "Eşleşme Oranı", value: "%87", trend: "+7%", icon: Package, color: "emerald" },
          { label: "Aktif Araç", value: String(stats.activeTrucks), trend: "+3", icon: TruckIcon, color: "amber" },
          { label: "CO₂ Tasarrufu", value: `${(stats.preventedEmissionsKg / 1000).toFixed(1)}t`, trend: "+22%", icon: Leaf, color: "purple" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-4",
              s.color === "blue" ? "bg-blue-100" : s.color === "emerald" ? "bg-emerald-100" : s.color === "amber" ? "bg-amber-100" : "bg-purple-100"
            )}>
              <s.icon className={cn(
                "w-5 h-5",
                s.color === "blue" ? "text-blue-600" : s.color === "emerald" ? "text-emerald-600" : s.color === "amber" ? "text-amber-600" : "text-purple-600"
              )} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />{s.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loads Bar Chart */}
        <div className="card-base p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Aylık Yük Hacmi</h3>
          <div className="flex items-end gap-3 h-40">
            {LOAD_DATA.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-700">{v}</span>
                <div className="w-full gradient-blue rounded-t-lg" style={{ height: `${(v / maxLoads) * 100}%` }} />
                <span className="text-[10px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="card-base p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Aylık Platform Geliri (TL)</h3>
          <div className="flex items-end gap-3 h-40">
            {REV_DATA.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-600">{(v/1000).toFixed(0)}K</span>
                <div className="w-full gradient-emerald rounded-t-lg" style={{ height: `${(v / maxRev) * 100}%` }} />
                <span className="text-[10px] text-slate-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Match rate */}
        <div className="card-base p-6 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-5">Aylık Eşleşme Oranı (%)</h3>
          <div className="space-y-3">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-8">{m}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-blue rounded-full transition-all"
                    style={{ width: `${MATCH_DATA[i]}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">%{MATCH_DATA[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
