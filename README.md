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

##  Development & Deployment

### Development

**Running Locally:**
```bash
npm run dev
```
(runs: `npx tsx server.ts` — boots Next.js + Socket.io on port 3000)

**Next.js only (no real-time messaging):**
```bash
npm run dev:next
```

**Seeding:**
```bash
npm run seed
```
Creates: demo users (1 admin, 3 dealers, 2 buyers), 15 cars, BOLO requests, reviews, and a sample conversation. 
Credentials can be found in `prisma/seed.ts`.

**Environment Variables:**
Copy `.env.example` to `.env` and fill in the values. All services used have free tiers with no credit card required for development.

### Deployment

**Vercel (Next.js app):**
1. Push to GitHub.
2. Connect your repository to Vercel.
3. Add all environment variables from `.env.example` to Vercel project settings.
4. Set `NEXTAUTH_URL` to your Vercel domain.
5. Deploy.

**Socket.io on Railway (for true WebSocket support):**
Vercel serverless functions do not hold persistent WebSocket connections. The app automatically falls back to HTTP long-polling on Vercel (functional but slower). For true WebSocket support:
1. Deploy `server.ts` as a separate Node.js service on [Railway](https://railway.app) (free tier available).
2. Set `NEXT_PUBLIC_SOCKET_URL` to your Railway URL in both environments.
3. The app in `hooks/use-socket.ts` will use this URL if present, otherwise falling back to the origin.

**Database (Neon):**
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string to `DATABASE_URL`.
3. Run: `npx prisma migrate deploy`.
4. Run: `npm run seed`.

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
