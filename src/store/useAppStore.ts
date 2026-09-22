"use client";

import { create } from "zustand";
import { Load, Truck, getLoads, getTrucks, getDashboardStats } from "@/data/mockData";

interface AppStore {
  loads: Load[];
  trucks: Truck[];
  stats: ReturnType<typeof getDashboardStats>;
  myMatchedLoads: string[];
  initialized: boolean;

  initialize: () => void;
  acceptLoad: (loadId: string) => void;
  releaseLoad: (loadId: string) => void;
}

// Pre-compute data at module level so it's ready immediately on client
const _loads = getLoads();
const _trucks = getTrucks();
const _stats = getDashboardStats();

export const useAppStore = create<AppStore>((set, get) => ({
  loads: _loads,
  trucks: _trucks,
  stats: _stats,
  myMatchedLoads: [],
  initialized: true,

  initialize: () => {
    // Already initialized at module level, no-op
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
