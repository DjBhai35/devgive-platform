# DevGive SaaS - Developer Source Code Sharing & Marketplace Platform

A production-ready, full-stack SaaS platform built with **Next.js 14 (App Router)**, **TypeScript**, **Bootstrap 5 / React-Bootstrap**, **Prisma ORM**, and a relational SQL database. 

DevGive allows creators and software developers to publish original source-code repositories, monetize premium codebases via structured donations/purchases, share free open-source scripts gated by YouTube watch verification, and administer all platform resources through a dedicated Admin Panel.

---

## 🚀 Key Highlights & Architecture

* **Modern SaaS Design System**: Custom theme featuring cyan, electric blue, purple, and magenta gradients, glassmorphism cards (`backdrop-filter: blur`), subtle glow shadows, and responsive Bootstrap grid.
* **Real Relational Database**: Backed by **Prisma ORM** with real foreign key constraints, relational schema (`User`, `Category`, `Project`, `Purchase`, `FreeClaim`, `Download`, `Wishlist`, `Setting`), and zero mock data.
* **Secure JWT Authentication**: HTTP-only, secure cookie sessions, bcrypt password hashing, role-based authorization (`USER`, `ADMIN`), and account activation/suspension states.
* **YouTube Verification Engine**: Built-in verification flow ensuring free open-source scripts require the configured watch duration (e.g. 60 seconds) before recording claims and unlocking source files.
* **Protected File Delivery**: Gated download API route (`/api/downloads/[projectId]`) that enforces verified claims or approved purchases before streaming the zip archive and auditing access telemetry (IP, user agent, timestamps).
* **Dynamic Statistics**: 100% database-calculated metrics on both public marketplace (projects, downloads, supporters, approved donations) and user dashboards (approved, pending, downloads, favorites).
* **Comprehensive Admin Console**: Dedicated admin panel for full control over projects (CRUD, live publish toggle, price updates), categories, user accounts, order reviews, free claim verifications, downloads audit trail, and site settings.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Bootstrap 5, React-Bootstrap, Custom SCSS / Glassmorphism |
| **Icons** | Lucide React |
| **Database & ORM** | Prisma ORM, SQLite (or PostgreSQL via DATABASE_URL) |
| **Authentication** | JSON Web Tokens (JWT), HTTP-Only Cookies, bcryptjs |

---

## 📁 Project Directory Structure

```text
├── app/
│   ├── layout.tsx              # Root Layout with AuthProvider, Navbar & Footer
│   ├── page.tsx                # Marketplace Homepage (Hero, Stats, Filter, How it works)
│   ├── globals.scss            # Bootstrap 5 + Glassmorphism theme & gradient styles
│   ├── auth/
│   │   ├── login/page.tsx      # Secure User Sign-In
│   │   └── register/page.tsx   # User Registration
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard Overview (Stat Cards, Recent Orders)
│   │   ├── donations/page.tsx  # User Order & Donation History
│   │   ├── downloads/page.tsx  # Downloaded Repositories History
│   │   ├── wishlist/page.tsx   # Saved Favorites
│   │   └── profile/page.tsx    # Profile Settings & Password Change
│   ├── project/[id]/page.tsx   # Project Detail (YouTube player, Claim/Buy modal)
│   ├── admin/
│   │   ├── page.tsx            # Admin Overview & Quick Approvals
│   │   ├── projects/page.tsx   # Project CRUD, Pricing, & Publish Controls
│   │   ├── categories/page.tsx # Categories Management
│   │   ├── transactions/page.tsx # Order & Donation Reviews (Approve/Reject)
│   │   ├── claims/page.tsx     # Free Claim Verifications Audit
│   │   ├── downloads/page.tsx  # Download Logs & Security Telemetry
│   │   ├── users/page.tsx      # User Management & Account Suspension
│   │   └── settings/page.tsx   # Global Platform & Payment Settings
│   └── api/                    # 19 REST API Endpoints (Auth, Projects, Claims, etc.)
├── components/
│   ├── AuthContext.tsx         # Client Auth Provider & Session Hook
│   ├── Navbar.tsx              # Responsive Navigation Bar with Live Search
│   ├── Footer.tsx              # Social Links & Copyright
│   ├── DashboardLayout.tsx     # User Dashboard Sidebar & Layout
│   └── AdminLayout.tsx         # Admin Console Sidebar & Role Guard
├── lib/
│   ├── prisma.ts               # Prisma Client Singleton
│   └── auth.ts                 # JWT Token Signing & Password Hashing
├── prisma/
│   ├── schema.prisma           # Relational Database Schema
│   └── seed.js                 # Database Seeding Script (Admin, Projects, Categories)
├── storage/packages/           # Gated Source Code Archives
└── test-e2e.js                 # End-to-End Integration Test Suite
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-production-jwt-secret-key-32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@devgive.com"
ADMIN_PASSWORD="AdminPassword123!"
PORT=3000
```

---

## 🚀 Installation & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Sample Records
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Build & Execution

### 1. Build Production Assets
```bash
npm run build
```

### 2. Launch Production Server
```bash
npm start
```

---

## 🧪 Automated End-to-End Testing

With the server running on `http://localhost:3000`, run:
```bash
node test-e2e.js
```
This script validates:
1. Public statistics API
2. Marketplace project and category queries
3. User registration and secure cookie session issuance
4. Wishlist addition and retrieval
5. Free claim verification with YouTube watch duration checks
6. Protected file download for verified free projects
7. Access prevention on unpurchased premium projects (403 Forbidden)
8. Premium order submission with payment proof
9. Admin login and manual order approval
10. Unlocked premium download verification
11. Admin project creation and real-time public marketplace reflection
12. Project unpublishing and immediate removal from public search

---

## 🔑 Default Credentials

* **Admin Email**: `admin@devgive.com`
* **Admin Password**: `AdminPassword123!`
* **Admin URL**: `/admin`
* **User Dashboard URL**: `/dashboard`

---

## 📄 License
MIT License. Built for production developer ecosystems.
