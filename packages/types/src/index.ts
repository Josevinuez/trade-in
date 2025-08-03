export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'smartwatch';

export type DeviceBrand = 'apple' | 'samsung' | 'google' | 'microsoft' | 'other';

export type StorageOption = '64GB' | '128GB' | '256GB' | '512GB' | '1TB';

export type DeviceCondition = 'like-new' | 'good' | 'fair';

export interface Device {
  id?: string;
  type: DeviceType;
  brand: DeviceBrand;
  model: string;
  storage: StorageOption;
  condition: DeviceCondition;
  basePrice: number;
  conditionMultipliers: Record<DeviceCondition, number>;
  storageMultipliers: Record<StorageOption, number>;
  imageUrl?: string;
  releaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quote {
  id?: string;
  deviceId: string;
  condition: DeviceCondition;
  storage: StorageOption;
  estimatedPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
}

export interface Transaction {
  id?: string;
  quoteId: string;
  status: 'pending' | 'completed' | 'cancelled';
  finalPrice: number;
  customerInfo: {
    name: string;
    email: string;
    address: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingRule {
  id: string;
  deviceId: string;
  conditionMultiplier: number;
  storageMultiplier: number;
  effectiveDate: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
} 