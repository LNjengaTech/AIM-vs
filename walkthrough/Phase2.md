# PHASE 2: Core Inventory & Marketplace

## Overview

successfully built the core engine of AIM-Mombasa:
1.  **Supply Side (Dealer Dashboard)**: Dealers can upload and manage inventory.
2.  **Demand Side (Marketplace)**: Buyers can browse, search, and view vehicle details.



# STAGE 1: DEALER DASHBOARD (`/dashboard`)


*Target Users: Verified Dealers*

## Overview

Successfully implemented the **Dealer Dashboard**, allowing verified dealers to manage their inventory seamlessly. This sets the foundation for the inventory supply side of the marketplace.

## Key Features Implemented

### 1. Dashboard Shell & Navigation
- **Responsive Layout**: Sidebar navigation for desktop, optimized for mobile.
- **Route Protection**: Middleware and layout-level checks ensure only dealers access these pages.
- **Overview Page**: Displays key stats (Views, Leads, Sales) and Verification Status.

**file**
* app/dashboard/page.tsx - only updated

### 2. Multi-Step Car Upload Wizard (`/dashboard/add-car`)
A sophisticated 3-step form using `react-hook-form` and `zod`:
1.  **Basic Details**: Make, Model, Year, Price, Mileage.
2.  **Specifications**: Body Type, Transmission, Fuel, Color, Features key-value pairs.
3.  **Media & Finish**: Image upload integration and final review.
- **Completeness Score**: Automatically calculated logic backend (based on field density and image count).

- **files**
    - app/dashboard/add-car/page.tsx
    - components/dashboard/add-car-form.tsx
    - components/ui/button
    - components/dashboard/image-upload
    - lib/validations/car

- **API routes files**
    - `POST /api/cars`: creation + completeness score.
    - `PATCH /api/cars/[id]`: updates status (requires ownership). - *for inventory management*
    - `DELETE /api/cars/[id]`: deletes listing (requires ownership). - *for inventory management*


### 3. Inventory Management (`/dashboard/inventory`)
- **Data Table**: Lists all vehicles belonging to the dealer.
- **Status Indicators**: "Available" (Green) vs "Sold" (Gray).
- **Completeness Bar**: Visual indicator of listing quality. Auto-calculated metric to encourage better listings.
- **Actions**:
    - **Toggle Status**: Instantly mark cars as Sold/Available.
    - **Delete**: Remove listings (with confirmation).

- **files**
    - app/dashboard/inventory/
    - components/dashboard/inventory-actions.tsx

### 4. Image Upload System
- **Cloudinary Integration**: Direct-to-cloud upload using unsigned preset `aim_mombasa_permits`.
- **Preview & Remove**: UI to view uploaded thumbnails and remove them before submission.

## Technical Components
* **API Routes**:
    - `POST /api/cars`: Handles creation + scoring.
    - `PATCH /api/cars/[id]`: Updates status (requires ownership).
    - `DELETE /api/cars/[id]`: Deletes listing (requires ownership).
* **Components**: 
- AddCarForm - components/dashboard/add-car-form.tsx, 
- ImageUpload -components/dashboard/image-upload.tsx,
- InventoryActions - components/dashboard/inventory-actions.tsx,
- DashboardNav - components/dashboard/dashboard-nav.tsx

## Testing procedure

### 1. Verification
1.  **Login** as a Dealer.
2.  Navigate to **Dashboard** -> **Add Car**.
3.  Complete the 3 steps. Upload at least 1 image.
4.  Submit. You should be redirected to **Inventory**.
5.  Check the **Completeness Score** bar in the table.
6.  Click **Mark Sold** - status badge should change to "SOLD".
7.  Click **Delete** - listing should disappear.

### 2. Next Steps
- Begin **Phase 2, Stage 2: Marketplace** to display these cars to buyers.

> [!NOTE]
> The current Image Upload uses an unsigned preset. For production, switch to signed uploads via a secure backend route.



# Phase 2, Stage 2: Marketplace Implementation Plan
Goal Description
Build the public-facing marketplace where buyers can browse, filter, and view details of available vehicles. This involves creating the main gallery page, individual car detail pages, and the search/filtering infrastructure.

User Review Required
NOTE

I will use Server Components for the gallery for SEO and performance. Filtering will use URL search params to ensure shareable links (e.g., /cars?make=Toyota&priceMax=2000000).

Proposed Changes
1. Reusable Components
[NEW] 
components/cars/car-card.tsx
Displays thumbnail, price, year, make, model.
Badges for "Verified Dealer" or "Pioneer".
"Heart" icon for favorites (requires auth check).
[NEW] 
components/cars/car-filters.tsx
Sidebar or top bar filters.
Use useSearchParams and useRouter to update URL.
Debounced text search.
[NEW] 
components/cars/car-sort.tsx
Dropdown for sorting (Price Low/High, Newest, Completeness).
2. Gallery Page
[NEW] 
app/cars/page.tsx
Server Component.
Fetches cars from Prisma based on searchParams.
Implements pagination or load more button.
[NEW] 
app/cars/loading.tsx
Skeleton loader grid for better UX.
3. Detail Page
[NEW] 
app/cars/[id]/page.tsx
Full details view.
Image gallery (main image + thumbnails).
"Contact Dealer" button (opens modal or mailto).
"Save to Favorites" button.
360 View placeholder (for Phase 3).
4. Database & Logic
[MODIFY] 
lib/actions/cars.ts
Create server actions for secure data fetching if needed, or stick to direct Prisma calls in Server Components.
Verification Plan
Automated Tests
Verify filter logic returns correct subset of cars.
Manual Verification
Gallery:
Visit /cars. Ensure all "Available" cars are shown.
Test filters: Select "Toyota" -> Only Toyotas shown.
Test sorting: Price Low to High.
Detail Page:
Click a card. Verify correct car details load.
Check "Contact Dealer" button displays dealer info.
Responsive: Check grid layout on mobile vs desktop.



# STAGE 2: MARKETPLACE (`/cars`)

*Target Users: Public Buyers*

### Key Features
- **Gallery Grid**: Responsive grid displaying available vehicles.
- **Smart Filtering**:
    - **Sidebar**: Filter by Make, Price Range, Year, Transmission.
    - **URL Sync**: Shareable links (e.g., `/cars?make=Toyota&maxPrice=2000000`).
- **Sorting**: Price (Low/High), Mileage, Newest.
- **Car Detail Page (`/cars/[id]`)**:
    - **Image Gallery**: Interactive main view + thumbnails.
    - **Specs & Features**: Comprehensive breakdown.
    - **Dealer Info**: Contact details and location of the seller.

### Verification Steps
1.  Go to Home Page (`/`).
2.  Click **"Browse Inventory"**.
3.  **Test Filters**: Enter "Toyota" in search. Verify non-Toyotas disappear.
4.  **Test Sort**: Select "Price: Low to High".
5.  **View Detail**: Click on the Harrier card.
    - Check that images load.
    - Verify "Contact Dealer" button is visible.
    - Confirm specifications match what was uploaded.



# Next: PHASE 3

- **360° Viewer**: Integrate interactive spin views.
- **BOLO System**: "Be On Look Out" matching for buyers.