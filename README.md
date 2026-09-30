# Srijan — White-Label D2C Commerce Platform

A multi-tenant, white-label e-commerce platform that lets brands launch fully independent storefronts with zero platform leakage. Built with **Next.js 14**, **NestJS**, **Prisma ORM**, and **PostgreSQL**.

---

## 🏗️ Architecture

```
Srijan/
├── frontend/          # Next.js 14 App Router — Storefronts + Admin panels
├── backend/           # NestJS REST API — Multi-tenant, Prisma ORM
└── package.json       # Root workspace
```

---

## ✨ Key Features

### 5 Brand Archetypes (Super Admin selects per brand)
| Archetype | Inspired By | Visual Style |
|-----------|------------|-------------|
| **Beauty / Skincare** | Pilgrim, Foxtale | Glassmorphism, clinical badges |
| **Organic / Soaps** | Ghar Soaps, Khadi | Earthy, cold-process artisan |
| **Luxury Fashion** | Zara, FabIndia, Masaba | Editorial minimal, GI-certified |
| **Fine Jewellery** | Kalyan, CaratLane | Gold gradient, BIS Hallmark |
| **Multi-Store** | Nykaa, Flipkart | Flash sales, mega-nav grid |

### Role Separation
- **Super Admin** — assigns archetypes, custom domains, website design
- **Brand Admin** — manages products, variants, reviews, shipping, WhatsApp

### White-Label Stealth
- Zero "Srijan" or "Powered by" branding on storefronts
- Custom domain per brand (DNS → SSL → Middleware tenant resolver)

### SEO-Ready
- Dynamic `sitemap.xml` auto-discovers all products
- `robots.txt` blocks admin/API from Googlebot
- JSON-LD structured data on every product page (star ratings in Google)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm / yarn

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env          # Fill in DATABASE_URL, JWT_SECRET etc.
npx prisma migrate dev        # Run migrations
npx prisma db seed            # Seed demo brands & products
npm run dev                   # Runs on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local    # Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/srijan"
JWT_SECRET="your-super-secret-jwt-key"
PORT=4000
PLATFORM_ADMIN_SECRET="platform-super-admin-token"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🌐 Custom Domain Guide

See [`custom_domain_seo_guide.md`](docs/custom_domain_seo_guide.md) for:
- DNS A record / CNAME configuration
- SSL certificate setup (Cloudflare / Certbot)
- Google Search Console sitemap submission
- JSON-LD rich results setup

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT Bearer Tokens |
| Payments | Razorpay |
| Shipping | Shiprocket |
| Messaging | WhatsApp Business API (Meta) |
| Analytics | Custom event tracking |

---

## 📄 License

Private — All rights reserved © 2026 Srijan Platform
