import { useState, useEffect } from 'react';
import { SucursalConfig } from '../types';

const STORAGE_KEY = 'sucursales_config';

export function useSucursalConfig() {
  const [sucursales, setSucursales] = useState<SucursalConfig[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<SucursalConfig | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setSucursales(parsed);
      if (parsed.length > 0) {
        setSelectedSucursal(parsed[0]);
      }
    }
  }, []);

  const addSucursal = (sucursal: SucursalConfig) => {
    const updated = [...sucursales, sucursal];
    setSucursales(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (!selectedSucursal) {
      setSelectedSucursal(sucursal);
    }
  };

  const removeSucursal = (id: string) => {
    const updated = sucursales.filter(s => s.id !== id);
    setSucursales(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selectedSucursal?.id === id) {
      setSelectedSucursal(updated[0] || null);
    }
  };

  const updateSucursal = (id: string, updates: Partial<SucursalConfig>) => {
    const updated = sucursales.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setSucursales(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selectedSucursal?.id === id) {
      setSelectedSucursal({ ...selectedSucursal, ...updates });
    }
  };

  return {
    sucursales,
    selectedSucursal,
    setSelectedSucursal,
    addSucursal,
    removeSucursal,
    updateSucursal
  };
}