import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create device categories
  const smartphoneCategory = await prisma.deviceCategory.upsert({
    where: { name: 'Smartphone' },
    update: {},
    create: {
      name: 'Smartphone',
      description: 'Mobile phones and smartphones',
      icon: 'smartphone',
    },
  });

  const tabletCategory = await prisma.deviceCategory.upsert({
    where: { name: 'Tablet' },
    update: {},
    create: {
      name: 'Tablet',
      description: 'Tablets and iPads',
      icon: 'tablet',
    },
  });

  const laptopCategory = await prisma.deviceCategory.upsert({
    where: { name: 'Laptop' },
    update: {},
    create: {
      name: 'Laptop',
      description: 'Laptops and notebooks',
      icon: 'laptop',
    },
  });

  const smartwatchCategory = await prisma.deviceCategory.upsert({
    where: { name: 'Smartwatch' },
    update: {},
    create: {
      name: 'Smartwatch',
      description: 'Smartwatches and wearables',
      icon: 'watch',
    },
  });

  // Create device brands
  const appleBrand = await prisma.deviceBrand.upsert({
    where: { name: 'Apple' },
    update: {},
    create: {
      name: 'Apple',
      logoUrl: '/logos/apple.png',
    },
  });

  const samsungBrand = await prisma.deviceBrand.upsert({
    where: { name: 'Samsung' },
    update: {},
    create: {
      name: 'Samsung',
      logoUrl: '/logos/samsung.png',
    },
  });

  const googleBrand = await prisma.deviceBrand.upsert({
    where: { name: 'Google' },
    update: {},
    create: {
      name: 'Google',
      logoUrl: '/logos/google.png',
    },
  });

  const microsoftBrand = await prisma.deviceBrand.upsert({
    where: { name: 'Microsoft' },
    update: {},
    create: {
      name: 'Microsoft',
      logoUrl: '/logos/microsoft.png',
    },
  });

  // Create device conditions
  const excellentCondition = await prisma.deviceCondition.upsert({
    where: { name: 'Excellent' },
    update: {},
    create: {
      name: 'Excellent',
      description: 'Like new condition, no scratches or damage',
      priceMultiplier: 1.00,
    },
  });

  const goodCondition = await prisma.deviceCondition.upsert({
    where: { name: 'Good' },
    update: {},
    create: {
      name: 'Good',
      description: 'Minor wear, fully functional',
      priceMultiplier: 0.85,
    },
  });

  const fairCondition = await prisma.deviceCondition.upsert({
    where: { name: 'Fair' },
    update: {},
    create: {
      name: 'Fair',
      description: 'Some wear and tear, still functional',
      priceMultiplier: 0.70,
    },
  });

  const poorCondition = await prisma.deviceCondition.upsert({
    where: { name: 'Poor' },
    update: {},
    create: {
      name: 'Poor',
      description: 'Significant damage but repairable',
      priceMultiplier: 0.50,
    },
  });

  // Create device models
  const iphone15Pro = await prisma.deviceModel.upsert({
    where: { name: 'iPhone 15 Pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      modelNumber: 'A3102',
      releaseYear: 2023,
      displayOrder: 1,
      categoryId: smartphoneCategory.id,
      brandId: appleBrand.id,
    },
  });

  const samsungS24 = await prisma.deviceModel.upsert({
    where: { name: 'Samsung Galaxy S24' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24',
      modelNumber: 'SM-S921',
      releaseYear: 2024,
      displayOrder: 2,
      categoryId: smartphoneCategory.id,
      brandId: samsungBrand.id,
    },
  });

  const ipadPro = await prisma.deviceModel.upsert({
    where: { name: 'iPad Pro 12.9"' },
    update: {},
    create: {
      name: 'iPad Pro 12.9"',
      modelNumber: 'A2435',
      releaseYear: 2022,
      displayOrder: 1,
      categoryId: tabletCategory.id,
      brandId: appleBrand.id,
    },
  });

  const macbookAir = await prisma.deviceModel.upsert({
    where: { name: 'MacBook Air M2' },
    update: {},
    create: {
      name: 'MacBook Air M2',
      modelNumber: 'A2681',
      releaseYear: 2022,
      displayOrder: 1,
      categoryId: laptopCategory.id,
      brandId: appleBrand.id,
    },
  });

  const appleWatch = await prisma.deviceModel.upsert({
    where: { name: 'Apple Watch Series 9' },
    update: {},
    create: {
      name: 'Apple Watch Series 9',
      modelNumber: 'A2972',
      releaseYear: 2023,
      displayOrder: 1,
      categoryId: smartwatchCategory.id,
      brandId: appleBrand.id,
    },
  });

  // Create storage options for devices
  await prisma.deviceStorageOption.createMany({
    data: [
      // iPhone 15 Pro storage options
      { 
        modelId: iphone15Pro.id, 
        storage: '128GB', 
        excellentPrice: 1200.00,
        goodPrice: 1080.00,
        fairPrice: 960.00,
        poorPrice: 840.00
      },
      { 
        modelId: iphone15Pro.id, 
        storage: '256GB', 
        excellentPrice: 1350.00,
        goodPrice: 1215.00,
        fairPrice: 1080.00,
        poorPrice: 945.00
      },
      { 
        modelId: iphone15Pro.id, 
        storage: '512GB', 
        excellentPrice: 1500.00,
        goodPrice: 1350.00,
        fairPrice: 1200.00,
        poorPrice: 1050.00
      },
      { 
        modelId: iphone15Pro.id, 
        storage: '1TB', 
        excellentPrice: 1650.00,
        goodPrice: 1485.00,
        fairPrice: 1320.00,
        poorPrice: 1155.00
      },
      
      // Samsung Galaxy S24 storage options
      { 
        modelId: samsungS24.id, 
        storage: '128GB', 
        excellentPrice: 1100.00,
        goodPrice: 990.00,
        fairPrice: 880.00,
        poorPrice: 770.00
      },
      { 
        modelId: samsungS24.id, 
        storage: '256GB', 
        excellentPrice: 1250.00,
        goodPrice: 1125.00,
        fairPrice: 1000.00,
        poorPrice: 875.00
      },
      { 
        modelId: samsungS24.id, 
        storage: '512GB', 
        excellentPrice: 1400.00,
        goodPrice: 1260.00,
        fairPrice: 1120.00,
        poorPrice: 980.00
      },
      
      // iPad Pro storage options
      { 
        modelId: ipadPro.id, 
        storage: '128GB', 
        excellentPrice: 1200.00,
        goodPrice: 1080.00,
        fairPrice: 960.00,
        poorPrice: 840.00
      },
      { 
        modelId: ipadPro.id, 
        storage: '256GB', 
        excellentPrice: 1350.00,
        goodPrice: 1215.00,
        fairPrice: 1080.00,
        poorPrice: 945.00
      },
      { 
        modelId: ipadPro.id, 
        storage: '512GB', 
        excellentPrice: 1500.00,
        goodPrice: 1350.00,
        fairPrice: 1200.00,
        poorPrice: 1050.00
      },
      { 
        modelId: ipadPro.id, 
        storage: '1TB', 
        excellentPrice: 1650.00,
        goodPrice: 1485.00,
        fairPrice: 1320.00,
        poorPrice: 1155.00
      },
      { 
        modelId: ipadPro.id, 
        storage: '2TB', 
        excellentPrice: 1800.00,
        goodPrice: 1620.00,
        fairPrice: 1440.00,
        poorPrice: 1260.00
      },
      
      // MacBook Air storage options
      { 
        modelId: macbookAir.id, 
        storage: '256GB', 
        excellentPrice: 1500.00,
        goodPrice: 1350.00,
        fairPrice: 1200.00,
        poorPrice: 1050.00
      },
      { 
        modelId: macbookAir.id, 
        storage: '512GB', 
        excellentPrice: 1700.00,
        goodPrice: 1530.00,
        fairPrice: 1360.00,
        poorPrice: 1190.00
      },
      { 
        modelId: macbookAir.id, 
        storage: '1TB', 
        excellentPrice: 1900.00,
        goodPrice: 1710.00,
        fairPrice: 1520.00,
        poorPrice: 1330.00
      },
      { 
        modelId: macbookAir.id, 
        storage: '2TB', 
        excellentPrice: 2100.00,
        goodPrice: 1890.00,
        fairPrice: 1680.00,
        poorPrice: 1470.00
      },
      
      // Apple Watch storage options
      { 
        modelId: appleWatch.id, 
        storage: '41mm', 
        excellentPrice: 400.00,
        goodPrice: 360.00,
        fairPrice: 320.00,
        poorPrice: 280.00
      },
      { 
        modelId: appleWatch.id, 
        storage: '45mm', 
        excellentPrice: 450.00,
        goodPrice: 405.00,
        fairPrice: 360.00,
        poorPrice: 315.00
      },
    ],
    skipDuplicates: true,
  });

  // Create payment methods
  const interacETransfer = await prisma.paymentMethod.upsert({
    where: { name: 'Interac E-Transfer' },
    update: {},
    create: {
      name: 'Interac E-Transfer',
      description: 'Direct bank transfer',
    },
  });

  const paypal = await prisma.paymentMethod.upsert({
    where: { name: 'PayPal' },
    update: {},
    create: {
      name: 'PayPal',
      description: 'PayPal payment',
    },
  });

  const cheque = await prisma.paymentMethod.upsert({
    where: { name: 'Cheque' },
    update: {},
    create: {
      name: 'Cheque',
      description: 'Physical cheque',
    },
  });

  // Create staff users
  const hashedPassword = await bcrypt.hash('staff123', 10);
  
  const adminStaff = await prisma.staff.upsert({
    where: { email: 'admin@tradeinpro.com' },
    update: {},
    create: {
      email: 'admin@tradeinpro.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1-555-000-0001',
    },
  });

  const managerStaff = await prisma.staff.upsert({
    where: { email: 'manager@tradeinpro.com' },
    update: {},
    create: {
      email: 'manager@tradeinpro.com',
      passwordHash: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      phone: '+1-555-000-0002',
    },
  });

  const operatorStaff = await prisma.staff.upsert({
    where: { email: 'operator@tradeinpro.com' },
    update: {},
    create: {
      email: 'operator@tradeinpro.com',
      passwordHash: hashedPassword,
      firstName: 'Operator',
      lastName: 'User',
      role: 'OPERATOR',
      phone: '+1-555-000-0003',
    },
  });

  const inspectorStaff = await prisma.staff.upsert({
    where: { email: 'inspector@tradeinpro.com' },
    update: {},
    create: {
      email: 'inspector@tradeinpro.com',
      passwordHash: hashedPassword,
      firstName: 'Inspector',
      lastName: 'User',
      role: 'INSPECTOR',
      phone: '+1-555-000-0004',
    },
  });

  // Create customer users
  const customerPassword = await bcrypt.hash('customer123', 10);
  
  const johnSmith = await prisma.customer.upsert({
    where: { email: 'john.smith@email.com' },
    update: {},
    create: {
      email: 'john.smith@email.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-123-4567',
      addressLine1: '123 Main St',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 3A8',
    },
  });

  const sarahJohnson = await prisma.customer.upsert({
    where: { email: 'sarah.johnson@email.com' },
    update: {},
    create: {
      email: 'sarah.johnson@email.com',
      passwordHash: customerPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-234-5678',
      addressLine1: '456 Oak Ave',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6B 1A1',
    },
  });

  const mikeDavis = await prisma.customer.upsert({
    where: { email: 'mike.davis@email.com' },
    update: {},
    create: {
      email: 'mike.davis@email.com',
      passwordHash: customerPassword,
      firstName: 'Mike',
      lastName: 'Davis',
      phone: '+1-555-345-6789',
      addressLine1: '789 Pine Rd',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H2Y 1C6',
    },
  });

  const lisaWilson = await prisma.customer.upsert({
    where: { email: 'lisa.wilson@email.com' },
    update: {},
    create: {
      email: 'lisa.wilson@email.com',
      passwordHash: customerPassword,
      firstName: 'Lisa',
      lastName: 'Wilson',
      phone: '+1-555-456-7890',
      addressLine1: '321 Elm St',
      city: 'Calgary',
      province: 'AB',
      postalCode: 'T2P 1J9',
    },
  });

  const davidBrown = await prisma.customer.upsert({
    where: { email: 'david.brown@email.com' },
    update: {},
    create: {
      email: 'david.brown@email.com',
      passwordHash: customerPassword,
      firstName: 'David',
      lastName: 'Brown',
      phone: '+1-555-567-8901',
      addressLine1: '654 Maple Dr',
      city: 'Ottawa',
      province: 'ON',
      postalCode: 'K1P 1J1',
    },
  });

  // Create sample trade-in orders
  const order1 = await prisma.tradeInOrder.upsert({
    where: { orderNumber: 'TI-2024-001' },
    update: {},
    create: {
      orderNumber: 'TI-2024-001',
      customerId: johnSmith.id,
      deviceModelId: iphone15Pro.id,
      deviceConditionId: excellentCondition.id,
      quotedAmount: 850.00,
      finalAmount: 850.00,
      status: 'PROCESSING',
      notes: 'Device received, under inspection',
    },
  });

  const order2 = await prisma.tradeInOrder.upsert({
    where: { orderNumber: 'TI-2024-002' },
    update: {},
    create: {
      orderNumber: 'TI-2024-002',
      customerId: sarahJohnson.id,
      deviceModelId: samsungS24.id,
      deviceConditionId: goodCondition.id,
      quotedAmount: 720.00,
      finalAmount: 720.00,
      status: 'COMPLETED',
      notes: 'Payment sent via e-transfer',
      completedAt: new Date(),
    },
  });

  const order3 = await prisma.tradeInOrder.upsert({
    where: { orderNumber: 'TI-2024-003' },
    update: {},
    create: {
      orderNumber: 'TI-2024-003',
      customerId: mikeDavis.id,
      deviceModelId: ipadPro.id,
      deviceConditionId: fairCondition.id,
      quotedAmount: 650.00,
      finalAmount: 600.00,
      status: 'PENDING',
      notes: 'Awaiting device shipment',
    },
  });

  const order4 = await prisma.tradeInOrder.upsert({
    where: { orderNumber: 'TI-2024-004' },
    update: {},
    create: {
      orderNumber: 'TI-2024-004',
      customerId: lisaWilson.id,
      deviceModelId: macbookAir.id,
      deviceConditionId: excellentCondition.id,
      quotedAmount: 1200.00,
      finalAmount: 1200.00,
      status: 'PROCESSING',
      notes: 'Device received, data wipe in progress',
    },
  });

  const order5 = await prisma.tradeInOrder.upsert({
    where: { orderNumber: 'TI-2024-005' },
    update: {},
    create: {
      orderNumber: 'TI-2024-005',
      customerId: davidBrown.id,
      deviceModelId: appleWatch.id,
      deviceConditionId: goodCondition.id,
      quotedAmount: 380.00,
      finalAmount: 380.00,
      status: 'COMPLETED',
      notes: 'Payment completed',
      completedAt: new Date(),
    },
  });

  // Create shipping labels
  await prisma.shippingLabel.upsert({
    where: { trackingNumber: 'TRK123456789' },
    update: {},
    create: {
      orderId: order1.id,
      trackingNumber: 'TRK123456789',
      carrier: 'Canada Post',
      shippedAt: new Date(),
    },
  });

  await prisma.shippingLabel.upsert({
    where: { trackingNumber: 'TRK987654321' },
    update: {},
    create: {
      orderId: order2.id,
      trackingNumber: 'TRK987654321',
      carrier: 'FedEx',
      shippedAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  await prisma.shippingLabel.upsert({
    where: { trackingNumber: 'TRK456789123' },
    update: {},
    create: {
      orderId: order3.id,
      trackingNumber: 'TRK456789123',
      carrier: 'UPS',
    },
  });

  await prisma.shippingLabel.upsert({
    where: { trackingNumber: 'TRK789123456' },
    update: {},
    create: {
      orderId: order4.id,
      trackingNumber: 'TRK789123456',
      carrier: 'Canada Post',
      shippedAt: new Date(),
    },
  });

  await prisma.shippingLabel.upsert({
    where: { trackingNumber: 'TRK321654987' },
    update: {},
    create: {
      orderId: order5.id,
      trackingNumber: 'TRK321654987',
      carrier: 'FedEx',
      shippedAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  // Create payments
  await prisma.payment.upsert({
    where: { transactionId: 'ET-2024-001' },
    update: {},
    create: {
      orderId: order2.id,
      paymentMethodId: interacETransfer.id,
      amount: 720.00,
      transactionId: 'ET-2024-001',
      status: 'COMPLETED',
      processedAt: new Date(),
    },
  });

  await prisma.payment.upsert({
    where: { transactionId: 'ET-2024-002' },
    update: {},
    create: {
      orderId: order5.id,
      paymentMethodId: interacETransfer.id,
      amount: 380.00,
      transactionId: 'ET-2024-002',
      status: 'COMPLETED',
      processedAt: new Date(),
    },
  });

  // Create order status history
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'PENDING',
        notes: 'Order created',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order1.id,
        status: 'PROCESSING',
        notes: 'Device received',
        updatedBy: inspectorStaff.id,
      },
      {
        orderId: order2.id,
        status: 'PENDING',
        notes: 'Order created',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order2.id,
        status: 'PROCESSING',
        notes: 'Device received',
        updatedBy: inspectorStaff.id,
      },
      {
        orderId: order2.id,
        status: 'COMPLETED',
        notes: 'Payment processed',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order3.id,
        status: 'PENDING',
        notes: 'Order created',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order4.id,
        status: 'PENDING',
        notes: 'Order created',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order4.id,
        status: 'PROCESSING',
        notes: 'Device received',
        updatedBy: inspectorStaff.id,
      },
      {
        orderId: order5.id,
        status: 'PENDING',
        notes: 'Order created',
        updatedBy: operatorStaff.id,
      },
      {
        orderId: order5.id,
        status: 'PROCESSING',
        notes: 'Device received',
        updatedBy: inspectorStaff.id,
      },
      {
        orderId: order5.id,
        status: 'COMPLETED',
        notes: 'Payment processed',
        updatedBy: operatorStaff.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 