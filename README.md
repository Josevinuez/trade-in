# TradeIn Pro - Device Buyback Suite

A modern, full-stack web application for managing device trade-ins and buybacks. Built with Next.js, React, and a professional landing page inspired by industry leaders like GoRecell.

## 🚀 Features

### Professional Landing Page
- **Modern Design**: Clean, professional landing page with mobile-responsive design
- **Trade-In Widget**: Interactive device trade-in flow embedded in the hero section
- **Trust Building**: Customer testimonials, ratings, and company statistics
- **Smooth Navigation**: Sticky header with smooth scrolling navigation
- **Call-to-Action**: Multiple conversion points throughout the page

### Customer Widget
- Interactive device trade-in flow with step-by-step process
- Real-time price quotes based on device specifications
- Mobile-friendly design with responsive UI
- Support for smartphones, tablets, laptops, and smartwatches
- Device condition assessment and storage options

### Staff Dashboard
- Brand and device model management
- Trade-in order management and tracking
- Image uploads to Supabase Storage
- Staff authentication (JWT, HttpOnly cookies)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Package Manager**: pnpm (workspaces)

## 📁 Project Structure

```
trade in/
├── apps/
│   └── widget/               # Landing + widget + serverless API routes
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── pages/        # Next.js pages & API routes
│       │   ├── lib/          # Auth, security middleware
│       │   ├── store/        # Zustand state
│       │   └── styles/       # Global styles
│       └── prisma/           # (unused with Supabase)
├── packages/
│   └── types/                # Shared TypeScript types
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended) or npm
- **Git**: For version control

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd trade-in
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment variables (widget)**:
   Create `apps/widget/.env.local` (or copy from `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=change_me_to_a_long_random_string
   NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
   ```

4. **Start the development server**:
   ```bash
   cd apps/widget
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Running the Application

### Development Mode

```bash
# From the root directory
pnpm dev

# Or navigate to the widget app
cd apps/widget
pnpm dev
```

### Production Build

```bash
# Build from repository root
pnpm build

# Start production server (from apps/widget)
cd apps/widget && pnpm start
```

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

## 🎨 Landing Page Features

### Hero Section
- Professional gradient background
- Integrated trade-in widget
- Clear value proposition
- Call-to-action buttons

### How It Works
- 3-step process explanation
- Visual step indicators
- Clear instructions for users

### Why Choose Us
- 6 key benefits with icons
- Trust-building elements
- Professional presentation

### Device Categories
- Visual representation of accepted devices
- Hover effects and interactions
- Clear device type descriptions

### Customer Testimonials
- Real customer reviews
- Star ratings
- Trust signals

### About Section
- Company information
- Key statistics
- Service highlights

## 🔐 Security

This project includes a security hardening pass for public deployment:

- **Authentication**: Staff login issues short-lived JWTs; token is also set as HttpOnly, SameSite=Strict cookie (`auth_token`).
- **Authorization**: All `pages/api/staff/**` routes require a valid JWT and enforce roles.
- **Rate limiting**: In-memory IP-based limiter on sensitive endpoints (swap to Redis/Upstash in production).
- **Input validation**: All critical endpoints validate payloads with zod.
- **CORS & Headers**: Wildcard CORS removed; `NEXT_PUBLIC_SITE_ORIGIN` allowlisted. CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, and HSTS (prod) are set in `next.config.js`.
- **Supabase service role**: Always used server-side only; protected by auth on staff endpoints.

See `SECURITY.md` for details and production notes.

## 🔧 Customization

### Branding
Update the branding in `apps/widget/src/pages/index.tsx`:
- Company name: "TradeIn Pro"
- Phone number: "1-800-TRADE-IN"
- Colors: Blue theme (customizable in Tailwind config)

### Content
- Update testimonials in the testimonials section
- Modify company statistics in the About section
- Customize device categories and descriptions

### Styling
- Colors: Edit `apps/widget/tailwind.config.js`
- Components: Modify `apps/widget/src/components/`
- Global styles: Update `apps/widget/src/styles/`

## 📱 Mobile Responsiveness

The landing page is fully responsive and includes:
- Mobile-first design approach
- Responsive navigation with hamburger menu
- Optimized layouts for all screen sizes
- Touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build the project
pnpm build

# Deploy the `out` directory
```

### Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   # Kill the process
   lsof -ti:3000 | xargs kill -9
   # Or use a different port
   pnpm dev --port 3001
   ```

2. **Dependencies not installed**:
   ```bash
   # Clear cache and reinstall
   pnpm store prune
   pnpm install
   ```

3. **TypeScript errors**:
   ```bash
   # Run type checking
   pnpm type-check
   ```

### Development Tips

- Use the browser's developer tools to inspect the responsive design
- Test the mobile menu functionality
- Verify smooth scrolling navigation
- Check that the trade-in widget works correctly

## 📈 Performance

The application is optimized for:
- Fast loading times
- SEO-friendly structure
- Accessibility compliance
- Mobile performance

## 📄 Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only)
- `JWT_SECRET`: Secret for signing staff JWTs
- `NEXT_PUBLIC_SITE_ORIGIN`: Allowed site origin for CORS/security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**TradeIn Pro** - Making device trade-ins simple, secure, and profitable. 