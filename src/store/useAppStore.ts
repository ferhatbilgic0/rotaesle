"use client";

import { create } from "zustand";
import { Load, Truck, getLoads, getTrucks, getDashboardStats } from "@/data/mockData";

interface AppStore {
  loads: Load[];
  trucks: Truck[];
  stats: ReturnType<typeof getDashboardStats>;
  myMatchedLoads: string[]; // IDs of loads the user has "accepted"
  initialized: boolean;

  initialize: () => void;
  acceptLoad: (loadId: string) => void;
  releaseLoad: (loadId: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  loads: [],
  trucks: [],
  stats: {
    totalActiveLoads: 0,
    matchedLoads: 0,
    inTransitLoads: 0,
    activeTrucks: 0,
    totalRevenueTL: 0,
    preventedEmissionsKg: 0,
    totalLoads: 0,
  },
  myMatchedLoads: [],
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    const loads = getLoads();
    const trucks = getTrucks();
    const stats = getDashboardStats();
    set({ loads, trucks, stats, initialized: true });
  },

  acceptLoad: (loadId: string) => {
    const current = get().myMatchedLoads;
    if (!current.includes(loadId)) {
      set({ myMatchedLoads: [...current, loadId] });
    }
  },

  releaseLoad: (loadId: string) => {
    set({ myMatchedLoads: get().myMatchedLoads.filter((id) => id !== loadId) });
  },
}));
