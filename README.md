# ADYK ZUOG

> **COMPLIANCE, SIMPLIFIED.**  
> Vendor compliance and document management platform for Indian MSMEs and manufacturing businesses.

---

## 🌟 Overview

**ADYK ZUOG** is a production SaaS platform designed for Indian manufacturing businesses and MSMEs to eliminate compliance chaos, track vendor certificate expirations, securely manage statutory documents, and maintain audit readiness from a single unified workspace.

### Attribution
**Build & Develop:** Rejiesh Ashwanth V  
**Company:** ADYK Multi Venture Company

---

## 🚀 Key Features

- **Real Document Upload & Private Storage:**
  - Native file picker working seamlessly across Desktop, Laptop, Android, iPhone, and Tablet devices.
  - Supports PDF (`application/pdf`) and high-resolution images (`.jpg`, `.jpeg`, `.png`, `.webp`) up to **25 MB**.
  - Secure private object storage architecture (metadata stored in PostgreSQL, binaries stored privately).
  - Short-lived HMAC-SHA256 signed URLs (15–60 min) for authorized streaming and preview.

- **In-Browser Document Preview & Actions:**
  - In-browser interactive PDF viewer (`<iframe>`) and image zoom viewer (`<img>`).
  - Direct secure attachment download.
  - Document replacement and single-click auditor verification / rejection with recorded audit trail.
  - Secure deletion with automatic cleanup of object storage and database records.

- **Persistent Multi-Tenant Architecture:**
  - Built on **Neon PostgreSQL** as the single source of truth for all business data.
  - **Prisma 6** schema with strict workspace-level tenant isolation.
  - Canonical user identity synchronized from **Supabase Auth** (`authUserId`).
  - Returning user flow seamlessly restores all workspaces, vendors, documents, and compliance metrics (no duplicate records).
  - **Zero business data in `localStorage`**.

- **Statutory Document Catalog for Indian Manufacturing:**
  - GST Registration Certificate
  - PAN Card Verification
  - Udyam MSME Registration
  - Commercial / Transit Insurance Policies
  - ISO 9001 Quality Management Certification
  - Factory License (Statutory Factory Inspection)
  - Municipal Trade License
  - Vendor Master Agreement & NDA
  - Quality Test / Calibration Certificates

- **Automated Expiry & Compliance Notifications:**
  - Expiry alert schedule: 30 days, 15 days, 7 days, 1 day, and on expiry.
  - Multi-channel notification pipeline (WhatsApp Business Cloud API & transactional Email).
  - Real-time compliance health score and renewal alerts.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Neon Serverless PostgreSQL
- **ORM:** Prisma 6
- **Authentication:** Supabase Auth (`@supabase/ssr`)
- **Styling:** Tailwind CSS (Navy `#0B1E3B`, Teal `#00A878`, Slate `#F8FAFC`)
- **Icons:** Lucide React
- **Runtime:** Node.js 20+

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 20.x or higher
- A Neon PostgreSQL database
- A Supabase project for authentication

### 2. Environment Setup
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-dry-firefly-bdsq972j-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-dry-firefly-bdsq972j.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Database Deployment
Generate Prisma Client and push the schema to Neon:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy

- All document binary files are stored in private storage and accessed exclusively via time-limited, cryptographically signed URLs.
- Workspace-level multi-tenancy ensures complete isolation between organizations.
- Full immutable audit trail (`AuditLog`) tracking every document upload, verification, rejection, and deletion.

---

## 📄 License & Attribution

Copyright © 2026 **ADYK Multi Venture Company**. All rights reserved.  
**Build & Develop:** Rejiesh Ashwanth V
