"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Package,
  TruckIcon,
  BarChart3,
  Settings,
  Leaf,
  Bell,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/eslestir",
    label: "Boş Kapasite Eşleştir",
    icon: ArrowLeftRight,
    badge: "YENİ",
  },
  {
    href: "/yuklerim",
    label: "Yüklerim",
    icon: Package,
    badge: null,
  },
];

const secondaryItems = [
  { href: "/analitik", label: "Analitik", icon: BarChart3 },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const stats = useAppStore((s) => s.stats);
  const myLoads = useAppStore((s) => s.myMatchedLoads);

  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-slate-100 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 gradient-blue rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg leading-none">RotaEşle</span>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Lojistik Platformu</p>
          </div>
        </Link>
      </div>

      {/* Live pulse */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-700">
          {stats.totalActiveLoads} aktif yük mevcut
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-2">
          Ana Menü
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === "Yüklerim" && myLoads.length > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                  )}>
                    {myLoads.length}
                  </span>
                )}
                {item.badge && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                )}
              </div>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-2">
            Sistem
          </p>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("sidebar-item", isActive && "sidebar-item-active")}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* CO2 Widget */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">Karbonsuz Lojistik</span>
        </div>
        <p className="text-2xl font-bold text-emerald-800">
          {(stats.preventedEmissionsKg / 1000).toFixed(1)}t
        </p>
        <p className="text-[11px] text-emerald-600 mt-0.5">
          CO₂ emisyonu önlendi
        </p>
        <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-emerald rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (stats.matchedLoads / 50) * 100)}%` }}
          />
        </div>
      </div>

      {/* User */}
      <div className="px-4 pb-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
            ME
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Mehmet Ercan</p>
            <p className="text-[11px] text-slate-400 truncate">TIR Sürücüsü</p>
          </div>
          <Bell className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}
