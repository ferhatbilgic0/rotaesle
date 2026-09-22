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
  trustScore: number;
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
  currentLoad: number;
  from: Province;
  to: Province;
  status: "idle" | "en_route" | "loading";
  earnings: number;
  tripsCompleted: number;
}

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

// Türkiye'nin en büyük 20 ili — popüler lojistik merkezleri
const TOP_20_CITY_IDS = [
  34, // İstanbul
  6,  // Ankara
  35, // İzmir
  16, // Bursa
  1,  // Adana
  7,  // Antalya
  27, // Gaziantep
  38, // Kayseri
  41, // Kocaeli
  55, // Samsun
  42, // Konya
  25, // Erzurum
  44, // Malatya
  58, // Sivas
  21, // Diyarbakır
  61, // Trabzon
  33, // Mersin
  26, // Eskişehir
  63, // Şanlıurfa
  45, // Manisa
];

function getTop20(): Province[] {
  return TOP_20_CITY_IDS.map(id => PROVINCES.find(p => p.id === id)!).filter(Boolean);
}

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

function makeSingleLoad(
  id: string,
  from: Province,
  to: Province,
  cargo: CargoType,
  weightKg: number,
  pricePerKm: number,
  trustScore: number,
  shipperName: string,
  status: LoadStatus,
  isSurge: boolean,
  surgePercent: number,
  now: Date,
  hoursAgo: number,
  deadlineHours: number,
  phone: string
): Load {
  const distanceKm = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  const basePrice = Math.round(distanceKm * pricePerKm);
  const finalPrice = Math.round(basePrice * (1 + surgePercent / 100));
  return {
    id,
    from,
    to,
    weightKg,
    volumeM3: Math.round(weightKg / 300),
    pricePerKm,
    recommendedPriceTL: finalPrice,
    cargoType: cargo,
    shipperName,
    trustScore,
    status,
    postedAt: new Date(now.getTime() - hoursAgo * 3600000),
    pickupDeadline: new Date(now.getTime() + deadlineHours * 3600000),
    isSurgePricing: isSurge,
    surgePercent,
    description: generateDescription(cargo, from.name, to.name),
    contactPhone: phone,
    requiresCooling: cargo === "Gıda" || cargo === "Tarım",
    requiresInsurance: cargo === "Elektronik" || cargo === "Kimyasal" || weightKg > 15000,
  };
}

export function generateLoads(): Load[] {
  const rng = seededRandom(42);
  const now = new Date("2026-09-22T10:00:00");
  const top20 = getTop20();
  const loads: Load[] = [];

  // ── BÖLÜM 1: Büyük 20 il arası GARANTİLİ yükler (hepsi "available")
  // Bu yükler tüm popüler rotaların üzerinde düğüm şehirlerde duruyor.
  const guaranteedPairs: [number, number, CargoType, number, number, boolean, number][] = [
    // [fromId, toId, cargo, weightKg, pricePerKm, isSurge, surgePercent]
    [34, 6,  "Tekstil",    18000, 5.2, true,  20], // İstanbul → Ankara
    [34, 35, "Elektronik", 12000, 6.1, false,  0], // İstanbul → İzmir
    [6,  25, "Makine",     22000, 4.8, true,  15], // Ankara → Erzurum
    [6,  58, "İnşaat",     20000, 4.5, false,  0], // Ankara → Sivas
    [6,  38, "Otomotiv",   15000, 5.0, true,  25], // Ankara → Kayseri
    [35, 7,  "Tarım",      10000, 5.5, false,  0], // İzmir → Antalya
    [35, 42, "Gıda",       14000, 4.9, true,  18], // İzmir → Konya
    [16, 55, "Mobilya",    16000, 5.3, false,  0], // Bursa → Samsun
    [16, 6,  "Tekstil",    19000, 5.1, true,  12], // Bursa → Ankara
    [1,  27, "Kimyasal",   11000, 6.0, false,  0], // Adana → Gaziantep
    [1,  33, "Gıda",       13000, 5.4, true,  22], // Adana → Mersin
    [27, 21, "Tarım",       9000, 4.7, false,  0], // Gaziantep → Diyarbakır
    [27, 44, "İnşaat",     18000, 4.6, true,  15], // Gaziantep → Malatya
    [38, 58, "Makine",     17000, 5.0, false,  0], // Kayseri → Sivas
    [38, 25, "Otomotiv",   14000, 5.2, true,  20], // Kayseri → Erzurum
    [55, 61, "Gıda",       12000, 5.8, false,  0], // Samsun → Trabzon
    [55, 6,  "Tarım",      16000, 4.9, true,  10], // Samsun → Ankara
    [42, 7,  "Mobilya",    13000, 5.3, false,  0], // Konya → Antalya
    [42, 1,  "İnşaat",     20000, 4.4, true,  18], // Konya → Adana
    [44, 25, "Makine",     15000, 4.8, false,  0], // Malatya → Erzurum
    [44, 21, "Tekstil",    11000, 5.1, true,  15], // Malatya → Diyarbakır
    [58, 25, "İnşaat",     19000, 4.6, true,  20], // Sivas → Erzurum
    [58, 44, "Gıda",       10000, 5.0, false,  0], // Sivas → Malatya
    [21, 63, "Tarım",      12000, 5.2, false,  0], // Diyarbakır → Şanlıurfa
    [63, 27, "Kimyasal",   14000, 5.5, true,  25], // Şanlıurfa → Gaziantep
    [61, 25, "Gıda",        8000, 5.7, false,  0], // Trabzon → Erzurum
    [26, 34, "Elektronik", 13000, 5.9, true,  15], // Eskişehir → İstanbul
    [26, 16, "Otomotiv",   16000, 5.1, false,  0], // Eskişehir → Bursa
    [33, 7,  "Tarım",      11000, 5.3, true,  20], // Mersin → Antalya
    [45, 35, "Tekstil",    18000, 5.0, false,  0], // Manisa → İzmir
  ];

  const phones = [
    "0532 111 2233", "0533 222 3344", "0544 333 4455", "0505 444 5566",
    "0551 555 6677", "0542 666 7788", "0531 777 8899", "0553 888 9900",
    "0536 999 0011", "0545 100 2020", "0532 200 3030", "0543 300 4040",
    "0554 400 5050", "0506 500 6060", "0552 600 7070", "0541 700 8080",
    "0534 800 9090", "0555 900 1010", "0537 010 1122", "0546 020 2233",
    "0533 030 3344", "0544 040 4455", "0505 050 5566", "0551 060 6677",
    "0542 070 7788", "0531 080 8899", "0553 090 9900", "0536 100 0011",
    "0545 200 1020", "0532 300 2030",
  ];

  guaranteedPairs.forEach(([fromId, toId, cargo, weightKg, ppm, isSurge, surge], idx) => {
    const from = PROVINCES.find(p => p.id === fromId)!;
    const to   = PROVINCES.find(p => p.id === toId)!;
    const trust = parseFloat((3.5 + (idx % 5) * 0.3).toFixed(1));
    const shipper = SHIPPER_NAMES[idx % SHIPPER_NAMES.length];
    loads.push(makeSingleLoad(
      `YUK-${String(idx + 1).padStart(4, "0")}`,
      from, to, cargo, weightKg, ppm,
      trust, shipper, "available",
      isSurge, surge, now,
      idx % 12,        // hoursAgo
      48 + idx % 48,   // deadlineHours
      phones[idx % phones.length]
    ));
  });

  // ── BÖLÜM 2: Rastgele 20 ek yük — büyük illerden (çoğu available)
  const startIdx = guaranteedPairs.length;
  for (let i = 0; i < 20; i++) {
    const fromIdx = Math.floor(rng() * top20.length);
    let toIdx = Math.floor(rng() * top20.length);
    while (toIdx === fromIdx) toIdx = Math.floor(rng() * top20.length);

    const from = top20[fromIdx];
    const to   = top20[toIdx];
    const cargo = CARGO_TYPES[Math.floor(rng() * CARGO_TYPES.length)];
    const weightKg = Math.floor(rng() * 18000) + 2000;
    const pricePerKm = parseFloat((4.0 + rng() * 3.0).toFixed(2));
    const isSurge = rng() > 0.6;
    const surgePercent = isSurge ? Math.floor(rng() * 25) + 10 : 0;
    const trustScore = parseFloat((3.0 + rng() * 2.0).toFixed(1));
    const shipperIdx = Math.floor(rng() * SHIPPER_NAMES.length);
    // %70 available, %30 diğer
    const statusRoll = rng();
    const status: LoadStatus = statusRoll > 0.30
      ? "available"
      : statusRoll > 0.15 ? "matched" : "in_transit";

    loads.push(makeSingleLoad(
      `YUK-${String(startIdx + i + 1).padStart(4, "0")}`,
      from, to, cargo, weightKg, pricePerKm,
      trustScore, SHIPPER_NAMES[shipperIdx], status,
      isSurge, surgePercent, now,
      Math.floor(rng() * 36),
      Math.floor(rng() * 72) + 24,
      phones[Math.floor(rng() * phones.length)]
    ));
  }

  return loads;
}

export function generateTrucks(): Truck[] {
  const rng = seededRandom(99);
  const top20 = getTop20();
  return DRIVER_NAMES.map((name, i) => {
    const fromIdx = Math.floor(rng() * top20.length);
    let toIdx = Math.floor(rng() * top20.length);
    while (toIdx === fromIdx) toIdx = Math.floor(rng() * top20.length);
    const capacityKg = [15000, 18000, 20000, 24000, 26000][Math.floor(rng() * 5)];
    return {
      id: `TRK-${String(i + 1).padStart(3, "0")}`,
      plate: TRUCK_PLATES[i],
      driverName: name,
      capacityKg,
      currentLoad: Math.floor(rng() * capacityKg * 0.3),
      from: top20[fromIdx],
      to: top20[toIdx],
      status: ["idle", "en_route", "loading"][Math.floor(rng() * 3)] as Truck["status"],
      earnings: Math.floor(rng() * 80000) + 20000,
      tripsCompleted: Math.floor(rng() * 120) + 5,
    };
  });
}

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
