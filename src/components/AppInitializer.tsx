"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AppInitializer() {
  const initialize = useAppStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);
  return null;
}
