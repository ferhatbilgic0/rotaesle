import { PROVINCES, Province } from "./provinces";

export type LoadStatus = "available" | "matched" | "in_transit" | "delivered";
export type CargoType =
  | "Gıda"
  | "Tekstil"
  | "İnşaat"
  | "Elektronik"
  | "Kimyasal"
  | "Tarım"
  | "Mobilya"
  | "Makine"
  | "Otomotiv"
  | "Beyaz Eşya";

export interface Load {
  id: string;
  from: Province;
  to: Province;
  weightKg: number;
  volumeM3: number;
  pricePerKm: number;
  recommendedPriceTL: number;
  cargoType: CargoType;
  shipperName: string;
  trustScore: number; // 0-5
  status: LoadStatus;
  postedAt: Date;
  pickupDeadline: Date;
  isSurgePricing: boolean;
  surgePercent: number;
  description: string;
  contactPhone: string;
  requiresCooling: boolean;
  requiresInsurance: boolean;
}

export interface Truck {
  id: string;
  plate: string;
  driverName: string;
  capacityKg: number;
  currentLoad: number; // kg currently loaded
  from: Province;
  to: Province;
  status: "idle" | "en_route" | "loading";
  earnings: number;
  tripsCompleted: number;
}

// Seeded pseudo-random for reproducible data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const CARGO_TYPES: CargoType[] = [
  "Gıda", "Tekstil", "İnşaat", "Elektronik", "Kimyasal",
  "Tarım", "Mobilya", "Makine", "Otomotiv", "Beyaz Eşya",
];

const SHIPPER_NAMES = [
  "Anadolu Lojistik A.Ş.", "Boğaziçi Taşımacılık", "Doğu Ekspres Ltd.",
  "Marmara Kargo", "Akdeniz Freight", "Ege Taşıma A.Ş.",
  "Karadeniz Lojistik", "Güney Ekspres", "İpek Yolu Taşımacılık",
  "Cumhuriyet Kargo", "Atlas Lojistik", "Çelik Taşıma Ltd.",
  "Türkiye Ekspres", "Anadolu Nakliyat", "Batur Lojistik",
  "Koç Taşımacılık", "Yıldız Kargo", "Güven Lojistik A.Ş.",
  "Sarp Nakliyat", "Merkez Freight Ltd.",
];

const DRIVER_NAMES = [
  "Mehmet Yılmaz", "Ali Kaya", "Hasan Demir", "Mustafa Çelik",
  "İbrahim Şahin", "Ahmet Arslan", "Ömer Koç", "Yusuf Aydın",
  "Murat Doğan", "Emre Güler",
];

const TRUCK_PLATES = [
  "06 ABC 123", "34 XYZ 456", "35 DEF 789", "16 GHI 012",
  "42 JKL 345", "01 MNO 678", "07 PQR 901", "55 STU 234",
  "61 VWX 567", "25 YZA 890",
];

function generateDescription(cargo: CargoType, from: string, to: string): string {
  const descriptions: Record<CargoType, string> = {
    "Gıda": `${from}'dan ${to}'ya taze gıda ürünleri. Soğuk zincir gerektirir.`,
    "Tekstil": `${from}'dan ${to}'ya tekstil ürünleri paketi. Temiz ve kuru taşıma.`,
    "İnşaat": `${from}'dan ${to}'ya inşaat malzemeleri (çelik profil, beton blok).`,
    "Elektronik": `${from}'dan ${to}'ya beyaz eşya ve elektronik ürünler. Titreşime duyarlı.`,
    "Kimyasal": `${from}'dan ${to}'ya endüstriyel kimyasal madde. ADR belgesi gerekli.`,
    "Tarım": `${from}'dan ${to}'ya tarım ürünleri (meyve/sebze). Sezonluk yük.`,
    "Mobilya": `${from}'dan ${to}'ya mobilya ve ev eşyaları. Paketli teslimat.`,
    "Makine": `${from}'dan ${to}'ya endüstriyel makine parçaları. Ağır yük.`,
    "Otomotiv": `${from}'dan ${to}'ya otomobil yedek parçaları. Hassas paketleme.`,
    "Beyaz Eşya": `${from}'dan ${to}'ya büyük beyaz eşya. Hasar güvencesi önerilir.`,
  };
  return descriptions[cargo];
}

export function generateLoads(): Load[] {
  const rng = seededRandom(42);
  const loads: Load[] = [];
  const now = new Date("2026-09-22T10:00:00");

  for (let i = 0; i < 50; i++) {
    const fromIdx = Math.floor(rng() * PROVINCES.length);
    let toIdx = Math.floor(rng() * PROVINCES.length);
    while (toIdx === fromIdx) toIdx = Math.floor(rng() * PROVINCES.length);

    const from = PROVINCES[fromIdx];
    const to = PROVINCES[toIdx];
    const cargo = CARGO_TYPES[Math.floor(rng() * CARGO_TYPES.length)];
    const weightKg = Math.floor(rng() * 20000) + 1000; // 1-21 tons
    const volumeM3 = Math.floor(rng() * 80) + 5;
    const distanceKm = haversineDistance(from.lat, from.lng, to.lat, to.lng);
    const pricePerKm = 3.5 + rng() * 3.5; // 3.5–7 TL/km
    const basePrice = Math.round(distanceKm * pricePerKm);
    const isSurge = rng() > 0.65;
    const surgePercent = isSurge ? Math.floor(rng() * 25) + 10 : 0; // 10-35%
    const finalPrice = Math.round(basePrice * (1 + surgePercent / 100));

    const trustScore = parseFloat((2.5 + rng() * 2.5).toFixed(1)); // 2.5–5.0
    const shipperIdx = Math.floor(rng() * SHIPPER_NAMES.length);

    const hoursAgo = Math.floor(rng() * 48);
    const postedAt = new Date(now.getTime() - hoursAgo * 3600000);
    const deadlineHours = Math.floor(rng() * 72) + 24;
    const pickupDeadline = new Date(now.getTime() + deadlineHours * 3600000);

    const statusRoll = rng();
    const status: LoadStatus =
      statusRoll > 0.6 ? "available" :
      statusRoll > 0.35 ? "matched" :
      statusRoll > 0.15 ? "in_transit" : "delivered";

    loads.push({
      id: `YUK-${String(i + 1).padStart(4, "0")}`,
      from,
      to,
      weightKg,
      volumeM3,
      pricePerKm: parseFloat(pricePerKm.toFixed(2)),
      recommendedPriceTL: finalPrice,
      cargoType: cargo,
      shipperName: SHIPPER_NAMES[shipperIdx],
      trustScore,
      status,
      postedAt,
      pickupDeadline,
      isSurgePricing: isSurge,
      surgePercent,
      description: generateDescription(cargo, from.name, to.name),
      contactPhone: `0${Math.floor(rng() * 200) + 500} ${Math.floor(rng() * 900) + 100} ${Math.floor(rng() * 9000) + 1000}`,
      requiresCooling: cargo === "Gıda" || cargo === "Tarım",
      requiresInsurance: cargo === "Elektronik" || cargo === "Kimyasal" || weightKg > 15000,
    });
  }

  return loads;
}

export function generateTrucks(): Truck[] {
  const rng = seededRandom(99);
  return DRIVER_NAMES.map((name, i) => {
    const fromIdx = Math.floor(rng() * PROVINCES.length);
    let toIdx = Math.floor(rng() * PROVINCES.length);
    while (toIdx === fromIdx) toIdx = Math.floor(rng() * PROVINCES.length);
    const capacityKg = [15000, 18000, 20000, 24000, 26000][Math.floor(rng() * 5)];
    return {
      id: `TRK-${String(i + 1).padStart(3, "0")}`,
      plate: TRUCK_PLATES[i],
      driverName: name,
      capacityKg,
      currentLoad: Math.floor(rng() * capacityKg * 0.3),
      from: PROVINCES[fromIdx],
      to: PROVINCES[toIdx],
      status: ["idle", "en_route", "loading"][Math.floor(rng() * 3)] as Truck["status"],
      earnings: Math.floor(rng() * 80000) + 20000,
      tripsCompleted: Math.floor(rng() * 120) + 5,
    };
  });
}

// Haversine formula — distance in km between two lat/lng points
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Singleton instances (generated once)
let _loads: Load[] | null = null;
let _trucks: Truck[] | null = null;

export function getLoads(): Load[] {
  if (!_loads) _loads = generateLoads();
  return _loads;
}

export function getTrucks(): Truck[] {
  if (!_trucks) _trucks = generateTrucks();
  return _trucks;
}

export function getDashboardStats() {
  const loads = getLoads();
  const trucks = getTrucks();
  const available = loads.filter((l) => l.status === "available").length;
  const matched = loads.filter((l) => l.status === "matched").length;
  const inTransit = loads.filter((l) => l.status === "in_transit").length;
  const totalRevenue = loads
    .filter((l) => l.status === "delivered" || l.status === "in_transit")
    .reduce((sum, l) => sum + l.recommendedPriceTL, 0);
  // Each prevented empty trip saves ~0.9 kg CO2 per km on average (estimate)
  const preventedEmissionsKg = matched * 450 + inTransit * 450;
  return {
    totalActiveLoads: available,
    matchedLoads: matched,
    inTransitLoads: inTransit,
    activeTrucks: trucks.filter((t) => t.status !== "idle").length,
    totalRevenueTL: totalRevenue,
    preventedEmissionsKg,
    totalLoads: loads.length,
  };
}
