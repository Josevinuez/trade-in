import { z } from 'zod';

// Base schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional();
export const postalCodeSchema = z.string().regex(/^[A-Za-z]\d[A-Za-z]?\s?\d[A-Za-z]\d$/, 'Invalid postal code format').optional();

// Customer schemas
export const customerCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: z.string().max(100, 'Address too long').optional(),
  city: z.string().max(50, 'City name too long').optional(),
  province: z.string().max(50, 'Province name too long').optional(),
  postalCode: postalCodeSchema,
});

export const customerUpdateSchema = customerCreateSchema.partial().extend({
  id: z.number().positive('Invalid customer ID'),
});

// Device schemas
export const deviceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  icon: z.string().max(100, 'Icon name too long').optional(),
  isActive: z.boolean().optional(),
});

export const deviceBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(50, 'Brand name too long'),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  isActive: z.boolean().optional(),
});

export const deviceConditionSchema = z.object({
  name: z.string().min(1, 'Condition name is required').max(50, 'Condition name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  isActive: z.boolean().optional(),
});

export const deviceStorageOptionSchema = z.object({
  storage: z.string().min(1, 'Storage size is required').max(20, 'Storage size too long'),
  excellentPrice: z.number().min(0, 'Price must be non-negative').max(10000, 'Price too high'),
  goodPrice: z.number().min(0, 'Price must be non-negative').max(10000, 'Price too high'),
  fairPrice: z.number().min(0, 'Price must be non-negative').max(10000, 'Price too high'),
  poorPrice: z.number().min(0, 'Price must be non-negative').max(10000, 'Price too high'),
  isActive: z.boolean().optional(),
});

export const deviceModelSchema = z.object({
  name: z.string().min(1, 'Model name is required').max(100, 'Model name too long'),
  modelNumber: z.string().max(50, 'Model number too long').optional(),
  releaseYear: z.number().int().min(1990, 'Invalid release year').max(new Date().getFullYear() + 1, 'Invalid release year').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  categoryId: z.number().int().positive('Invalid category ID'),
  brandId: z.number().int().positive('Invalid brand ID'),
  displayOrder: z.number().int().min(0, 'Display order must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

// Order schemas
export const orderCreateSchema = z.object({
  customerEmail: emailSchema,
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
  customerPhone: phoneSchema,
  customerAddress: z.string().max(100, 'Address too long').optional(),
  customerCity: z.string().max(50, 'City name too long').optional(),
  customerProvince: z.string().max(50, 'Province name too long').optional(),
  customerPostalCode: postalCodeSchema,
  deviceModelId: z.number().int().positive('Invalid device model ID'),
  deviceConditionId: z.number().int().positive('Invalid device condition ID'),
  storageOptionId: z.number().int().positive('Invalid storage option ID'),
  quotedAmount: z.number().positive('Quoted amount must be positive').max(10000, 'Amount too high'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'E_TRANSFER', 'PAYPAL', 'OTHER']).optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const orderUpdateSchema = z.object({
  orderId: z.number().int().positive('Invalid order ID'),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REJECTED']),
  finalAmount: z.number().positive('Final amount must be positive').max(10000, 'Amount too high').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const orderDeleteSchema = z.object({
  orderId: z.number().int().positive('Invalid order ID'),
});

export const orderTrackSchema = z.object({
  email: z.string().email('Invalid email format'),
  orderNumber: z.string().min(3, 'Order number must be at least 3 characters'),
});

export const orderRespondSchema = z.object({
  email: z.string().email('Invalid email format'),
  orderNumber: z.string().min(3, 'Order number must be at least 3 characters'),
  decision: z.enum(['approve', 'decline']),
});

export const imageUploadSchema = z.object({
  imageData: z.string().startsWith('data:image/', 'Invalid image format'),
  fileName: z.string().min(1, 'Filename is required'),
});

export const staffLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// API request schemas
export const apiRequestSchema = z.object({
  type: z.string().min(1, 'Request type is required'),
  data: z.any().optional(),
  id: z.number().int().positive('Invalid ID').optional(),
});

// Device creation/update schemas
export const deviceCreateRequestSchema = z.object({
  type: z.enum(['category', 'brand', 'condition', 'model']),
  data: z.union([
    deviceCategorySchema,
    deviceBrandSchema,
    deviceConditionSchema,
    deviceModelSchema,
  ]),
  storageOptions: z.array(deviceStorageOptionSchema).optional(),
});

export const deviceUpdateRequestSchema = z.object({
  type: z.enum(['category', 'brand', 'condition', 'model']),
  id: z.number().int().positive('Invalid device ID'),
  data: z.union([
    deviceCategorySchema,
    deviceBrandSchema,
    deviceConditionSchema,
    deviceModelSchema,
  ]),
  storageOptions: z.array(deviceStorageOptionSchema).optional(),
});

// Brand creation schema
export const brandCreateRequestSchema = z.object({
  type: z.literal('brand'),
  data: deviceBrandSchema,
});

// Query parameter schemas
export const deviceQuerySchema = z.object({
  type: z.enum(['categories', 'brands', 'conditions', 'models']).optional(),
  id: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
});

export const brandQuerySchema = z.object({
  type: z.literal('brands'),
});

// Response schemas for validation
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

// Rate limiting response schema
export const rateLimitResponseSchema = z.object({
  error: z.literal('Too many requests'),
  retryAfter: z.number().int().positive(),
});

// Export all schemas
export const schemas = {
  customer: {
    create: customerCreateSchema,
    update: customerUpdateSchema,
  },
  device: {
    category: deviceCategorySchema,
    brand: deviceBrandSchema,
    condition: deviceConditionSchema,
    storageOption: deviceStorageOptionSchema,
    model: deviceModelSchema,
    create: deviceCreateRequestSchema,
    update: deviceUpdateRequestSchema,
  },
  order: {
    create: orderCreateSchema,
    update: orderUpdateSchema,
    delete: orderDeleteSchema,
    track: orderTrackSchema,
    respond: orderRespondSchema,
  },
  upload: {
    image: imageUploadSchema,
  },
  auth: {
    staffLogin: staffLoginSchema,
  },
  brand: {
    create: brandCreateRequestSchema,
  },
  query: {
    device: deviceQuerySchema,
    brand: brandQuerySchema,
  },
  response: {
    success: successResponseSchema,
    error: errorResponseSchema,
    rateLimit: rateLimitResponseSchema,
  },
};
