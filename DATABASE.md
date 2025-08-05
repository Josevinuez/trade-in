# 🗄️ TradeIn Pro Database Documentation

## 📊 Overview

The TradeIn Pro system uses **PostgreSQL** as its primary database with **Prisma ORM** for type-safe database operations. The database is designed to handle all aspects of the trade-in business including user management, device catalog, order processing, payments, and analytics.

## 🏗️ Database Architecture

### **Core Components**

1. **Authentication & Users** - Staff and customer management
2. **Device Catalog** - Product catalog with categories, brands, models, and conditions
3. **Trade-In Orders** - Complete order lifecycle management (WOMS)
4. **Shipping & Tracking** - Shipping labels and address management
5. **Payments** - Payment processing and transaction tracking
6. **Communication** - Customer messaging system
7. **Analytics** - Daily statistics and reporting

## 🗂️ Database Schema

### **1. Authentication & Users**

#### **Staff Table**
```sql
- id: Primary key
- email: Unique staff email
- passwordHash: Bcrypt hashed password
- firstName, lastName: Staff name
- role: ADMIN, MANAGER, OPERATOR, INSPECTOR
- phone: Contact number
- isActive: Account status
- createdAt, updatedAt: Timestamps
```

#### **Customer Table**
```sql
- id: Primary key
- email: Unique customer email
- passwordHash: Bcrypt hashed password
- firstName, lastName: Customer name
- phone: Contact number
- addressLine1, addressLine2: Address
- city, province, postalCode, country: Location
- isActive: Account status
- createdAt, updatedAt: Timestamps
```

#### **AuthToken Table**
```sql
- id: Primary key
- userId: User ID (staff or customer)
- userType: STAFF or CUSTOMER
- token: Unique authentication token
- expiresAt: Token expiration
- createdAt: Timestamp
```

### **2. Device Catalog**

#### **DeviceCategory Table**
```sql
- id: Primary key
- name: Unique category name (Smartphone, Tablet, Laptop, Smartwatch)
- description: Category description
- icon: Icon identifier
- isActive: Category status
- createdAt: Timestamp
```

#### **DeviceBrand Table**
```sql
- id: Primary key
- name: Unique brand name (Apple, Samsung, Google, Microsoft)
- logoUrl: Brand logo URL
- isActive: Brand status
- createdAt: Timestamp
```

#### **DeviceModel Table**
```sql
- id: Primary key
- categoryId: Foreign key to DeviceCategory
- brandId: Foreign key to DeviceBrand
- name: Unique model name
- modelNumber: Model identifier
- releaseYear: Year released
- basePrice: Base trade-in value
- isActive: Model status
- createdAt: Timestamp
```

#### **DeviceCondition Table**
```sql
- id: Primary key
- name: Unique condition name (Excellent, Good, Fair, Poor)
- description: Condition description
- priceMultiplier: Price adjustment factor
- isActive: Condition status
- createdAt: Timestamp
```

### **3. Trade-In Orders (WOMS)**

#### **TradeInOrder Table**
```sql
- id: Primary key
- orderNumber: Unique order number (TI-YYYY-NNN)
- customerId: Foreign key to Customer
- deviceModelId: Foreign key to DeviceModel
- deviceConditionId: Foreign key to DeviceCondition
- quotedAmount: Initial quote amount
- finalAmount: Final payment amount
- status: PENDING, PROCESSING, COMPLETED, CANCELLED, REJECTED
- notes: Order notes
- submittedAt: Order submission time
- processedAt: Processing start time
- completedAt: Completion time
- createdAt, updatedAt: Timestamps
```

#### **OrderStatusHistory Table**
```sql
- id: Primary key
- orderId: Foreign key to TradeInOrder
- status: Order status
- notes: Status change notes
- updatedBy: Foreign key to Staff
- updatedAt: Timestamp
```

### **4. Shipping & Tracking**

#### **ShippingLabel Table**
```sql
- id: Primary key
- orderId: Foreign key to TradeInOrder
- trackingNumber: Unique tracking number
- carrier: Shipping carrier
- labelUrl: Shipping label URL
- shippedAt: Shipment time
- deliveredAt: Delivery time
- createdAt: Timestamp
```

#### **ShippingAddress Table**
```sql
- id: Primary key
- customerId: Foreign key to Customer
- addressType: SHIPPING or BILLING
- addressLine1, addressLine2: Address lines
- city, province, postalCode, country: Location
- isDefault: Default address flag
- createdAt: Timestamp
```

### **5. Payments**

#### **PaymentMethod Table**
```sql
- id: Primary key
- name: Unique method name
- description: Method description
- isActive: Method status
- createdAt: Timestamp
```

#### **Payment Table**
```sql
- id: Primary key
- orderId: Foreign key to TradeInOrder
- paymentMethodId: Foreign key to PaymentMethod
- amount: Payment amount
- transactionId: Unique transaction ID
- status: PENDING, COMPLETED, FAILED, REFUNDED
- processedAt: Processing time
- notes: Payment notes
- createdAt: Timestamp
```

### **6. Communication**

#### **CustomerMessage Table**
```sql
- id: Primary key
- customerId: Foreign key to Customer
- orderId: Optional foreign key to TradeInOrder
- subject: Message subject
- message: Message content
- messageType: EMAIL, SMS, NOTIFICATION
- status: SENT, DELIVERED, FAILED
- sentAt: Timestamp
```

### **7. Analytics**

#### **DailyStatistic Table**
```sql
- id: Primary key
- date: Unique date
- totalOrders: Daily order count
- completedOrders: Completed order count
- totalRevenue: Daily revenue
- averageOrderValue: Average order value
- createdAt: Timestamp
```

## 🔐 Security Features

### **Password Security**
- All passwords are hashed using **bcrypt** with salt rounds of 10
- Passwords are never stored in plain text
- Secure password comparison using timing-safe methods

### **Authentication**
- Token-based authentication system
- Tokens expire after 24 hours
- Automatic cleanup of expired tokens
- Role-based access control for staff

### **Data Protection**
- All sensitive data is encrypted
- Database connections use SSL in production
- Regular security audits and updates

## 📈 Sample Data

### **Staff Users**
- **Admin**: admin@tradeinpro.com / staff123
- **Manager**: manager@tradeinpro.com / staff123
- **Operator**: operator@tradeinpro.com / staff123
- **Inspector**: inspector@tradeinpro.com / staff123

### **Customer Users**
- **John Smith**: john.smith@email.com / customer123
- **Sarah Johnson**: sarah.johnson@email.com / customer123
- **Mike Davis**: mike.davis@email.com / customer123
- **Lisa Wilson**: lisa.wilson@email.com / customer123
- **David Brown**: david.brown@email.com / customer123

### **Device Categories**
- Smartphone, Tablet, Laptop, Smartwatch

### **Device Brands**
- Apple, Samsung, Google, Microsoft

### **Device Conditions**
- Excellent (100%), Good (85%), Fair (70%), Poor (50%)

## 🚀 Database Setup

### **Prerequisites**
- PostgreSQL 15+
- Node.js 18+
- pnpm package manager

### **Installation Steps**

1. **Install PostgreSQL**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database**
   ```bash
   createdb tradein_pro
   ```

3. **Install Dependencies**
   ```bash
   pnpm add pg @types/pg prisma @prisma/client bcryptjs
   ```

4. **Setup Environment**
   ```bash
   echo 'DATABASE_URL="postgresql://username@localhost:5432/tradein_pro?schema=public"' > .env
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Seed Database**
   ```bash
   npx tsx prisma/seed.ts
   ```

## 🔧 Database Operations

### **Prisma Commands**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database
npm run seed
```

### **Database Utilities**

```typescript
// Import Prisma client
import { prisma } from './lib/database';

// Import authentication service
import { AuthService } from './lib/auth';

// Example: Authenticate staff
const result = await AuthService.authenticateStaff(email, password);

// Example: Get customer orders
const orders = await prisma.tradeInOrder.findMany({
  where: { customerId: customerId },
  include: {
    customer: true,
    deviceModel: {
      include: {
        brand: true,
        category: true,
      },
    },
    deviceCondition: true,
    shippingLabels: true,
    payments: true,
  },
});
```

## 📊 Analytics & Reporting

### **Daily Statistics**
The system automatically tracks:
- Total orders per day
- Completed orders per day
- Total revenue per day
- Average order value per day

### **Order Analytics**
- Order status distribution
- Revenue by device category
- Customer order history
- Payment method usage

### **Performance Metrics**
- Order processing times
- Customer satisfaction scores
- Device condition distribution
- Geographic order distribution

## 🔄 Data Flow

### **Order Lifecycle**
1. **Customer submits trade-in request**
2. **System generates quote** based on device model and condition
3. **Order created** with PENDING status
4. **Staff processes order** (changes to PROCESSING)
5. **Device received and inspected**
6. **Final amount determined**
7. **Payment processed**
8. **Order completed** (changes to COMPLETED)

### **Authentication Flow**
1. **User logs in** with email/password
2. **System validates credentials** against database
3. **Auth token generated** and stored
4. **Token used for subsequent requests**
5. **Token expires** after 24 hours

## 🛡️ Backup & Recovery

### **Backup Strategy**
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication
- Encrypted backup storage

### **Recovery Procedures**
- Database restore from backup
- Migration rollback procedures
- Data integrity verification
- Performance monitoring

## 📋 Maintenance

### **Regular Tasks**
- Clean up expired auth tokens
- Update device pricing
- Archive old orders
- Optimize database performance
- Monitor disk space usage

### **Performance Optimization**
- Index optimization
- Query performance monitoring
- Connection pooling
- Caching strategies

## 🔍 Troubleshooting

### **Common Issues**

1. **Connection Errors**
   - Check PostgreSQL service status
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Check schema syntax
   - Verify foreign key relationships

3. **Authentication Issues**
   - Verify password hashing
   - Check token expiration
   - Validate user account status

### **Debug Commands**
```bash
# Check database connection
npx prisma db pull

# View database schema
npx prisma studio

# Test database connection
npx prisma db seed
```

## 📞 Support

For database-related issues:
1. Check the logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Review Prisma documentation
5. Contact the development team

---

**Last Updated**: August 4, 2025  
**Version**: 1.0.0  
**Database**: PostgreSQL 15  
**ORM**: Prisma 6.13.0 