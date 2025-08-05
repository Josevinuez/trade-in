import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.orderStatusHistory.deleteMany();
  await prisma.shippingLabel.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customerMessage.deleteMany();
  await prisma.tradeInOrder.deleteMany();
  await prisma.deviceStorageOption.deleteMany();
  await prisma.deviceModel.deleteMany();
  await prisma.deviceBrand.deleteMany();
  await prisma.deviceCategory.deleteMany();
  await prisma.deviceCondition.deleteMany();
  await prisma.customer.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create device conditions
  const excellentCondition = await prisma.deviceCondition.create({
    data: {
      name: 'Excellent',
      description: 'Like new condition with minimal wear',
      priceMultiplier: 1.0,
      isActive: true,
    },
  });

  const goodCondition = await prisma.deviceCondition.create({
    data: {
      name: 'Good',
      description: 'Minor scratches or wear, fully functional',
      priceMultiplier: 0.8,
      isActive: true,
    },
  });

  const fairCondition = await prisma.deviceCondition.create({
    data: {
      name: 'Fair',
      description: 'Visible wear but functional',
      priceMultiplier: 0.6,
      isActive: true,
    },
  });

  const poorCondition = await prisma.deviceCondition.create({
    data: {
      name: 'Poor',
      description: 'Significant wear or damage',
      priceMultiplier: 0.4,
      isActive: true,
    },
  });

  console.log('✅ Created device conditions');

  // Create device categories
  const smartphoneCategory = await prisma.deviceCategory.create({
    data: {
      name: 'Smartphones',
      description: 'Mobile phones and smartphones',
      icon: '📱',
      isActive: true,
    },
  });

  const tabletCategory = await prisma.deviceCategory.create({
    data: {
      name: 'Tablets',
      description: 'Tablets and iPads',
      icon: '📱',
      isActive: true,
    },
  });

  const laptopCategory = await prisma.deviceCategory.create({
    data: {
      name: 'Laptops',
      description: 'Laptops and notebooks',
      icon: '💻',
      isActive: true,
    },
  });

  const watchCategory = await prisma.deviceCategory.create({
    data: {
      name: 'Smartwatches',
      description: 'Smartwatches and fitness trackers',
      icon: '⌚',
      isActive: true,
    },
  });

  console.log('✅ Created device categories');

  // Create device brands
  const appleBrand = await prisma.deviceBrand.create({
    data: {
      name: 'Apple',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      isActive: true,
    },
  });

  const samsungBrand = await prisma.deviceBrand.create({
    data: {
      name: 'Samsung',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
      isActive: true,
    },
  });

  const googleBrand = await prisma.deviceBrand.create({
    data: {
      name: 'Google',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
      isActive: true,
    },
  });

  const microsoftBrand = await prisma.deviceBrand.create({
    data: {
      name: 'Microsoft',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      isActive: true,
    },
  });

  const sonyBrand = await prisma.deviceBrand.create({
    data: {
      name: 'Sony',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Sony_logo.svg',
      isActive: true,
    },
  });

  console.log('✅ Created device brands');

  // Create device models with storage options
  const iphone15Pro = await prisma.deviceModel.create({
    data: {
      name: 'iPhone 15 Pro',
      modelNumber: 'A3102',
      releaseYear: 2023,
      displayOrder: 1,
      categoryId: smartphoneCategory.id,
      brandId: appleBrand.id,
      isActive: true,
    },
  });

  const iphone15 = await prisma.deviceModel.create({
    data: {
      name: 'iPhone 15',
      modelNumber: 'A3090',
      releaseYear: 2023,
      displayOrder: 2,
      categoryId: smartphoneCategory.id,
      brandId: appleBrand.id,
      isActive: true,
    },
  });

  const samsungS24 = await prisma.deviceModel.create({
    data: {
      name: 'Samsung Galaxy S24',
      modelNumber: 'SM-S921',
      releaseYear: 2024,
      displayOrder: 3,
      categoryId: smartphoneCategory.id,
      brandId: samsungBrand.id,
      isActive: true,
    },
  });

  const ipadPro = await prisma.deviceModel.create({
    data: {
      name: 'iPad Pro',
      modelNumber: 'A3101',
      releaseYear: 2023,
      displayOrder: 4,
      categoryId: tabletCategory.id,
      brandId: appleBrand.id,
      isActive: true,
    },
  });

  const macbookAir = await prisma.deviceModel.create({
    data: {
      name: 'MacBook Air M2',
      modelNumber: 'A2681',
      releaseYear: 2022,
      displayOrder: 5,
      categoryId: laptopCategory.id,
      brandId: appleBrand.id,
      isActive: true,
    },
  });

  const appleWatch = await prisma.deviceModel.create({
    data: {
      name: 'Apple Watch Series 9',
      modelNumber: 'A2980',
      releaseYear: 2023,
      displayOrder: 6,
      categoryId: watchCategory.id,
      brandId: appleBrand.id,
      isActive: true,
    },
  });

  // Add more device models
  const googlePixel8 = await prisma.deviceModel.create({
    data: {
      name: 'Google Pixel 8',
      modelNumber: 'G8',
      releaseYear: 2023,
      displayOrder: 7,
      categoryId: smartphoneCategory.id,
      brandId: googleBrand.id,
      isActive: true,
    },
  });

  const samsungTabS9 = await prisma.deviceModel.create({
    data: {
      name: 'Samsung Galaxy Tab S9',
      modelNumber: 'SM-X710',
      releaseYear: 2023,
      displayOrder: 8,
      categoryId: tabletCategory.id,
      brandId: samsungBrand.id,
      isActive: true,
    },
  });

  const surfaceLaptop = await prisma.deviceModel.create({
    data: {
      name: 'Surface Laptop 5',
      modelNumber: 'SL5',
      releaseYear: 2022,
      displayOrder: 9,
      categoryId: laptopCategory.id,
      brandId: microsoftBrand.id,
      isActive: true,
    },
  });

  const galaxyWatch = await prisma.deviceModel.create({
    data: {
      name: 'Samsung Galaxy Watch 6',
      modelNumber: 'SM-R955',
      releaseYear: 2023,
      displayOrder: 10,
      categoryId: watchCategory.id,
      brandId: samsungBrand.id,
      isActive: true,
    },
  });

  console.log('✅ Created device models');

  // Create storage options for iPhone 15 Pro
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: iphone15Pro.id, storage: '128GB', excellentPrice: 1200.00, goodPrice: 960.00, fairPrice: 720.00, poorPrice: 480.00, isActive: true },
      { modelId: iphone15Pro.id, storage: '256GB', excellentPrice: 1350.00, goodPrice: 1080.00, fairPrice: 810.00, poorPrice: 540.00, isActive: true },
      { modelId: iphone15Pro.id, storage: '512GB', excellentPrice: 1500.00, goodPrice: 1200.00, fairPrice: 900.00, poorPrice: 600.00, isActive: true },
      { modelId: iphone15Pro.id, storage: '1TB', excellentPrice: 1650.00, goodPrice: 1320.00, fairPrice: 990.00, poorPrice: 660.00, isActive: true },
    ],
  });

  // Create storage options for iPhone 15
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: iphone15.id, storage: '128GB', excellentPrice: 1000.00, goodPrice: 800.00, fairPrice: 600.00, poorPrice: 400.00, isActive: true },
      { modelId: iphone15.id, storage: '256GB', excellentPrice: 1150.00, goodPrice: 920.00, fairPrice: 690.00, poorPrice: 460.00, isActive: true },
      { modelId: iphone15.id, storage: '512GB', excellentPrice: 1300.00, goodPrice: 1040.00, fairPrice: 780.00, poorPrice: 520.00, isActive: true },
    ],
  });

  // Create storage options for Samsung S24
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: samsungS24.id, storage: '128GB', excellentPrice: 900.00, goodPrice: 720.00, fairPrice: 540.00, poorPrice: 360.00, isActive: true },
      { modelId: samsungS24.id, storage: '256GB', excellentPrice: 1050.00, goodPrice: 840.00, fairPrice: 630.00, poorPrice: 420.00, isActive: true },
      { modelId: samsungS24.id, storage: '512GB', excellentPrice: 1200.00, goodPrice: 960.00, fairPrice: 720.00, poorPrice: 480.00, isActive: true },
    ],
  });

  // Create storage options for iPad Pro
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: ipadPro.id, storage: '128GB', excellentPrice: 800.00, goodPrice: 640.00, fairPrice: 480.00, poorPrice: 320.00, isActive: true },
      { modelId: ipadPro.id, storage: '256GB', excellentPrice: 950.00, goodPrice: 760.00, fairPrice: 570.00, poorPrice: 380.00, isActive: true },
      { modelId: ipadPro.id, storage: '512GB', excellentPrice: 1100.00, goodPrice: 880.00, fairPrice: 660.00, poorPrice: 440.00, isActive: true },
      { modelId: ipadPro.id, storage: '1TB', excellentPrice: 1250.00, goodPrice: 1000.00, fairPrice: 750.00, poorPrice: 500.00, isActive: true },
    ],
  });

  // Create storage options for MacBook Air M2
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: macbookAir.id, storage: '256GB', excellentPrice: 1200.00, goodPrice: 960.00, fairPrice: 720.00, poorPrice: 480.00, isActive: true },
      { modelId: macbookAir.id, storage: '512GB', excellentPrice: 1400.00, goodPrice: 1120.00, fairPrice: 840.00, poorPrice: 560.00, isActive: true },
      { modelId: macbookAir.id, storage: '1TB', excellentPrice: 1600.00, goodPrice: 1280.00, fairPrice: 960.00, poorPrice: 640.00, isActive: true },
    ],
  });

  // Create storage options for Apple Watch Series 9
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: appleWatch.id, storage: '41mm', excellentPrice: 350.00, goodPrice: 280.00, fairPrice: 210.00, poorPrice: 140.00, isActive: true },
      { modelId: appleWatch.id, storage: '45mm', excellentPrice: 400.00, goodPrice: 320.00, fairPrice: 240.00, poorPrice: 160.00, isActive: true },
    ],
  });

  // Create storage options for Google Pixel 8
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: googlePixel8.id, storage: '128GB', excellentPrice: 700.00, goodPrice: 560.00, fairPrice: 420.00, poorPrice: 280.00, isActive: true },
      { modelId: googlePixel8.id, storage: '256GB', excellentPrice: 850.00, goodPrice: 680.00, fairPrice: 510.00, poorPrice: 340.00, isActive: true },
    ],
  });

  // Create storage options for Samsung Galaxy Tab S9
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: samsungTabS9.id, storage: '128GB', excellentPrice: 600.00, goodPrice: 480.00, fairPrice: 360.00, poorPrice: 240.00, isActive: true },
      { modelId: samsungTabS9.id, storage: '256GB', excellentPrice: 750.00, goodPrice: 600.00, fairPrice: 450.00, poorPrice: 300.00, isActive: true },
      { modelId: samsungTabS9.id, storage: '512GB', excellentPrice: 900.00, goodPrice: 720.00, fairPrice: 540.00, poorPrice: 360.00, isActive: true },
    ],
  });

  // Create storage options for Surface Laptop 5
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: surfaceLaptop.id, storage: '256GB', excellentPrice: 800.00, goodPrice: 640.00, fairPrice: 480.00, poorPrice: 320.00, isActive: true },
      { modelId: surfaceLaptop.id, storage: '512GB', excellentPrice: 1000.00, goodPrice: 800.00, fairPrice: 600.00, poorPrice: 400.00, isActive: true },
      { modelId: surfaceLaptop.id, storage: '1TB', excellentPrice: 1200.00, goodPrice: 960.00, fairPrice: 720.00, poorPrice: 480.00, isActive: true },
    ],
  });

  // Create storage options for Samsung Galaxy Watch 6
  await prisma.deviceStorageOption.createMany({
    data: [
      { modelId: galaxyWatch.id, storage: '40mm', excellentPrice: 250.00, goodPrice: 200.00, fairPrice: 150.00, poorPrice: 100.00, isActive: true },
      { modelId: galaxyWatch.id, storage: '44mm', excellentPrice: 300.00, goodPrice: 240.00, fairPrice: 180.00, poorPrice: 120.00, isActive: true },
    ],
  });

  console.log('✅ Created storage options');

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      addressLine1: '123 Main Street',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 3A8',
      passwordHash: bcrypt.hashSync('password123', 10),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      addressLine1: '456 Oak Avenue',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6B 1A1',
      passwordHash: bcrypt.hashSync('password456', 10),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1-555-0789',
      addressLine1: '789 Pine Road',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H2Y 1C6',
      passwordHash: bcrypt.hashSync('password789', 10),
    },
  });

  console.log('✅ Created sample customers');

  // Create a staff user for order history
  const staffUser = await prisma.staff.create({
    data: {
      email: 'staff@tradeinpro.com',
      passwordHash: 'demo-hash',
      firstName: 'Demo',
      lastName: 'Staff',
      role: 'OPERATOR',
      phone: '+1-555-0000',
    },
  });

  console.log('✅ Created staff user');

  // Create sample trade-in orders
  const order1 = await prisma.tradeInOrder.create({
    data: {
      orderNumber: 'TI-2024-001',
      customerId: customer1.id,
      deviceModelId: iphone15Pro.id,
      deviceConditionId: excellentCondition.id,
      quotedAmount: 1200.00,
      finalAmount: 1200.00,
      status: 'COMPLETED',
      paymentMethod: 'e-transfer',
      submittedAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-20'),
      notes: 'Customer was very satisfied with the process',
    },
  });

  const order2 = await prisma.tradeInOrder.create({
    data: {
      orderNumber: 'TI-2024-002',
      customerId: customer2.id,
      deviceModelId: samsungS24.id,
      deviceConditionId: goodCondition.id,
      quotedAmount: 900.00,
      finalAmount: 720.00,
      status: 'PROCESSING',
      paymentMethod: 'paypal',
      submittedAt: new Date('2024-01-18'),
      notes: 'Device condition was slightly worse than expected',
    },
  });

  const order3 = await prisma.tradeInOrder.create({
    data: {
      orderNumber: 'TI-2024-003',
      customerId: customer3.id,
      deviceModelId: macbookAir.id,
      deviceConditionId: fairCondition.id,
      quotedAmount: 1200.00,
      finalAmount: 720.00,
      status: 'PENDING',
      paymentMethod: 'cheque',
      submittedAt: new Date('2024-01-20'),
      notes: 'Waiting for customer to ship device',
    },
  });

  console.log('✅ Created sample trade-in orders');

  // Create sample shipping labels
  await prisma.shippingLabel.create({
    data: {
      orderId: order1.id,
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS',
      labelUrl: 'https://example.com/shipping-label-1.pdf',
    },
  });

  await prisma.shippingLabel.create({
    data: {
      orderId: order2.id,
      trackingNumber: '1Z999AA1234567891',
      carrier: 'FedEx',
      labelUrl: 'https://example.com/shipping-label-2.pdf',
    },
  });

  // Create sample payments
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      paymentMethodId: 1, // Assuming first payment method
      amount: 1200.00,
      status: 'COMPLETED',
      processedAt: new Date('2024-01-20'),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      paymentMethodId: 2, // Assuming second payment method
      amount: 720.00,
      status: 'PENDING',
    },
  });

  // Create sample order status history
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'PENDING',
        notes: 'Order submitted by customer',
        updatedBy: staffUser.id,
      },
      {
        orderId: order1.id,
        status: 'PROCESSING',
        notes: 'Device received and being evaluated',
        updatedBy: staffUser.id,
      },
      {
        orderId: order1.id,
        status: 'COMPLETED',
        notes: 'Payment processed and order completed',
        updatedBy: staffUser.id,
      },
      {
        orderId: order2.id,
        status: 'PENDING',
        notes: 'Order submitted by customer',
        updatedBy: staffUser.id,
      },
      {
        orderId: order2.id,
        status: 'PROCESSING',
        notes: 'Device evaluation in progress',
        updatedBy: staffUser.id,
      },
      {
        orderId: order3.id,
        status: 'PENDING',
        notes: 'Order submitted by customer',
        updatedBy: staffUser.id,
      },
    ],
  });

  console.log('✅ Created sample order data');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 