"use client";

import { Settings, User, Bell, Shield, Globe, Truck } from "lucide-react";

export default function AyarlarPage() {
  return (
    <div className="page-enter p-8 space-y-6 max-w-[800px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Ayarlar
        </h1>
        <p className="text-slate-500 text-sm mt-1">Hesap ve uygulama tercihleri</p>
      </div>

      {[
        {
          title: "Profil Bilgileri",
          icon: User,
          fields: [
            { label: "Ad Soyad", value: "Mehmet Ercan" },
            { label: "Telefon", value: "0532 123 4567" },
            { label: "E-posta", value: "mehmet.ercan@example.com" },
          ],
        },
        {
          title: "Araç Bilgileri",
          icon: Truck,
          fields: [
            { label: "Plaka", value: "06 ABC 123" },
            { label: "Kapasite", value: "26.000 kg" },
            { label: "Araç Tipi", value: "TIR / Tenteli" },
          ],
        },
      ].map((section) => (
        <div key={section.title} className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <section.icon className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{f.label}</span>
                <input
                  defaultValue={f.value}
                  className="input-base max-w-[260px] py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <button className="btn-primary text-sm mt-5">Kaydet</button>
        </div>
      ))}
    </div>
  );
}
