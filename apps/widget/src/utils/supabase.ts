import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    serviceKey: !!supabaseServiceKey
  });
}

// Client for browser usage (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types for our database tables
export interface DeviceCategory {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceBrand {
  id: number;
  name: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceModel {
  id: number;
  name: string;
  modelNumber?: string;
  categoryId: number;
  brandId: number;
  releaseYear?: number;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: DeviceCategory;
  brand?: DeviceBrand;
}

export interface DeviceStorageOption {
  id: number;
  deviceModelId: number;
  storage: string;
  excellentPrice: number;
  goodPrice: number;
  fairPrice: number;
  poorPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCondition {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TradeInOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  deviceModelId: number;
  deviceConditionId: number;
  storageOptionId: number;
  quotedAmount: number;
  finalAmount?: number;
  paymentMethod?: string;
  notes?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  submittedAt: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  deviceModel?: DeviceModel;
  deviceCondition?: DeviceCondition;
  storageOption?: DeviceStorageOption;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  notes?: string;
  updatedBy?: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethodId: number;
  status: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod;
} 