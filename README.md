# AIM-Mombasa

**AI-Enhanced Automotive Inventory Management & Matchmaking System**

A modern web platform designed to digitize and optimize the automotive market in Mombasa, Kenya, by creating a "Live Digital Twin" of physical car showrooms.

##  Features

- **Real-Time Inventory Management** - Dealers can manage inventory with live stock updates
- **BOLO Matchmaking Engine** - Buyers submit demands and get notified when matches arrive
- **AI-Driven Verification** - Client-side image analysis for vehicle verification
- **360-Degree Virtual Tours** - Interactive vehicle walkarounds
- **Advanced Search & Filtering** - Find exactly what you're looking for
- **Mobile-First PWA** - Works offline, installable on any device
- **Dark/Light Mode** - Full theme support for user preference

##  Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **Image Storage**: Cloudinary
- **AI/ML**: TensorFlow.js (planned)
- **Deployment**: Vercel

##  Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aim-mombasa-ag/app-src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

##  Project Structure

```
app-src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── loading.tsx        # Global loading fallback
│   ├── error.tsx          # Global error boundary
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── providers/         # Context providers (theme, etc.)
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client singleton
│   ├── utils.ts          # General utilities
│   └── cloudinary.ts     # Cloudinary helpers
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## 🗄️ Database Schema

The application uses a comprehensive database schema including:

- **Authentication** - User accounts with NextAuth
- **User Profiles** - Separate dealer and buyer profiles
- **Car Listings** - Full vehicle inventory with images and metadata
- **BOLO Requests** - Demand-based matchmaking system
- **Engagements** - Track user interactions for ranking
- **Favorites** - Save cars for later
- **Hero Section** - Admin-managed hero content

---

##  Development Phases


### Phase 1: Foundation
* **Stage 1:** Environment SetuP
* **Stage 2:** Authentication System


### Phase 2: Core Inventory & Marketplace
* **Stage 1:** Dealer Dashboard
* **Stage 2:** Marketplace


### Phase 3: Top-Shelf Features
* **Stage 1:** 360-Degree Viewer
* **Stage 2:** BOLO Matchmaker


### Phase 4: AI Layer
* **Stage 1:** Visual Verification
* **Stage 2:** Background Solutions


### Phase 5: Polish & Deployment
* **Stage 1:** Optimization
* **Stage 2:** Deployment


### Phase 6: Enhancements & Future
* **Stage 1:** Immediate Enhancements
* **Stage 2:** Future Improvements


##  License
This is a student project for the Technical University of Mombasa (TUM).

##  Contributors
Solo project

---

**Budget**: ~KES 7,000 | **Timeline**: 12 weeks
