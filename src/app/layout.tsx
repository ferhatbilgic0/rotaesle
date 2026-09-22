import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AppInitializer } from "@/components/AppInitializer";

export const metadata: Metadata = {
  title: "RotaEşle — Lojistik Rota Optimizasyon Platformu",
  description:
    "Boş dönüş problemini çözen akıllı yük eşleştirme platformu. Türkiye'nin lojistik verimliliğini artır.",
  keywords: "lojistik, taşımacılık, boş dönüş, rota optimizasyonu, yük eşleştirme",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen">
        <AppInitializer />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
