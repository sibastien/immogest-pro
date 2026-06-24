import { create } from 'zustand';
import type { Property, PropertyType, PropertyStatus } from '../types';
import { mockProperties } from '../data/mockProperties';

interface PropertyFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  search?: string;
}

interface PropertiesState {
  properties: Property[];
  filters: PropertyFilters;
  selectedProperty: Property | null;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  selectProperty: (id: string | null) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getFilteredProperties: () => Property[];
}

export const usePropertiesStore = create<PropertiesState>((set, get) => ({
  properties: mockProperties,
  filters: {},
  selectedProperty: null,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: {} }),

  selectProperty: (id) => {
    const property = id ? get().properties.find((p) => p.id === id) ?? null : null;
    set({ selectedProperty: property });
  },

  addProperty: (property) =>
    set((state) => ({ properties: [property, ...state.properties] })),

  updateProperty: (id, updates) =>
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deleteProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),

  getFilteredProperties: () => {
    const { properties, filters } = get();
    return properties.filter((p) => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.minSurface && p.surface < filters.minSurface) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.ref.toLowerCase().includes(q)
        );
      }
      return true;
    });
  },
}));
