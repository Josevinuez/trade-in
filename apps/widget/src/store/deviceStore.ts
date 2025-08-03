import { Device, DeviceType, DeviceBrand, StorageOption, DeviceCondition, Quote } from '@device-buyback/types';
import { StateCreator } from 'zustand';
import { create } from 'zustand';

interface DeviceStore {
  device: Partial<Device> | null;
  quote: number | null;
  setDevice: (device: Partial<Device>) => void;
  calculateQuote: () => void;
  resetDevice: () => void;
}

type DeviceModel = keyof typeof basePrices;

const basePrices = {
  'iPhone 15 Pro Max': 1200,
  'iPhone 15 Pro': 1000,
  'iPhone 15': 800,
  'iPhone 14 Pro Max': 900,
  'iPhone 14 Pro': 700,
  'iPhone 14': 600,
  'Galaxy S24 Ultra': 1100,
  'Galaxy S24+': 900,
  'Galaxy S24': 700,
  'Galaxy S23 Ultra': 800,
  'Galaxy S23+': 600,
  'Galaxy S23': 500,
  'Pixel 8 Pro': 900,
  'Pixel 8': 700,
  'Pixel 7 Pro': 600,
  'Pixel 7': 500,
  'iPad Pro 12.9"': 1000,
  'iPad Pro 11"': 800,
  'iPad Air': 600,
  'iPad Mini': 500,
  'Galaxy Tab S9 Ultra': 900,
  'Galaxy Tab S9+': 700,
  'Galaxy Tab S9': 500,
  'Galaxy Tab A': 300,
  'Surface Pro 9': 1000,
  'Surface Pro 8': 800,
  'Surface Go 4': 500,
  'MacBook Pro 16"': 2000,
  'MacBook Pro 14"': 1800,
  'MacBook Pro 13"': 1300,
  'MacBook Air 15"': 1200,
  'MacBook Air 13"': 1000,
  'Surface Laptop 5': 1000,
  'Surface Laptop Studio': 1500,
  'Surface Laptop Go': 600,
  'Apple Watch Ultra 2': 800,
  'Apple Watch Series 9': 400,
  'Apple Watch SE': 250,
  'Galaxy Watch 6 Pro': 450,
  'Galaxy Watch 6': 300,
  'Galaxy Watch 5 Pro': 350,
  'Galaxy Watch 5': 250,
  'Other Smartphone': 500,
  'Other Tablet': 400,
  'Other Laptop': 800,
  'Other Smartwatch': 200,
} as const;

const conditionMultipliers: Record<DeviceCondition, number> = {
  'like-new': 1.0,
  'good': 0.8,
  'fair': 0.6,
};

const storageMultipliers: Record<StorageOption, number> = {
  '64GB': 1.0,
  '128GB': 1.2,
  '256GB': 1.4,
  '512GB': 1.6,
  '1TB': 1.8,
};

export const useDeviceStore = create<DeviceStore>((set) => ({
  device: null,
  quote: null,
  setDevice: (newDevice) =>
    set((state) => ({
      device: { ...state.device, ...newDevice },
    })),
  calculateQuote: () =>
    set((state) => {
      if (!state.device?.model || !state.device?.condition || !state.device?.storage) {
        return { quote: null };
      }

      const basePrice = basePrices[state.device.model as DeviceModel] || 500;
      const conditionMultiplier = conditionMultipliers[state.device.condition];
      const storageMultiplier = storageMultipliers[state.device.storage];

      const quote = basePrice * conditionMultiplier * storageMultiplier;
      return { quote };
    }),
  resetDevice: () => set({ device: null, quote: null }),
})); 