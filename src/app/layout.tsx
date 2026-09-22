import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AppInitializer } from "@/components/AppInitializer";

export const metadata: Metadata = {
  title: "RotaEşle — Lojistik Rota Optimizasyon Platformu",
  description: "Boş dönüş problemini çözen akıllı yük eşleştirme platformu.",
  keywords: "lojistik, taşımacılık, boş dönüş, rota optimizasyonu",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen">
        <AppInitializer />
        <div className="flex min-h-screen">
          <Sidebar />
          {/* pt-14 on mobile to clear the fixed top bar */}
          <main className="flex-1 min-w-0 overflow-auto pt-14 lg:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
