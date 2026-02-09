# Authentication System - Testing Guide

## Prerequisites

Before testing the authentication system, you need to:

### 1. Setup PostgreSQL Database

Ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aim_vs;
\q
```

### 2. Update Environment Variables

Update your `.env` file with your actual credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aim_vs"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"  # Run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Database Migration

Initialize the database schema:

```bash
cd app-src
npx prisma migrate dev --name init
npx prisma generate
```

This will create all the necessary tables from the Prisma schema.

---

## Testing Checklist

### 1. Buyer Signup Flow

1. Navigate to `http://localhost:3000`
2. Click "Sign Up" or "Sign up as Buyer"
3. Fill in the buyer signup form:
   - Full Name: Test Buyer
   - Email: buyer@test.com
   - Password: test123
   - Confirm Password: test123
   - Phone: +254 700 000 000 (optional)
   - Location: Nyali, Mombasa (optional)
4. Click "Create Buyer Account"
5. **Expected**: Auto-login and redirect to homepage
6. **Verify**: User menu shows email and "Profile" button

### 2. Dealer Signup Flow (Pioneer Status)

1. Sign out if logged in
2. Navigate to `/auth/signup/dealer`
3. **Step 1 - Personal Info**:
   - Full Name: Test Dealer 1
   - Email: dealer1@test.com
   - Password: test123
   - Confirm Password: test123
   - Click "Continue"
4. **Step 2 - Business Info**:
   - Business Name: Premium Cars Mombasa
   - Business Phone: +254 700 111 111
   - Business Address: Moi Avenue, Ganjoni
   - Location: Ganjoni
   - Permit Number: BPN-2026-001 (optional)
   - Upload permit document (optional)
   - Click "Create Dealer Account"
5. **Expected**: Auto-login and redirect to `/dashboard`
6. **Verify**: 
   - "Pioneer Dealer" badge shows (first 10 dealers)
   - "Pending Verification" badge shows
   - Warning message about pending verification

### 3. Additional Dealer Signups (Test Pioneer Limit)

Repeat dealer signup 9 more times with different emails (dealer2@test.com through dealer10@test.com).

**Expected**: All 10 dealers get the Pioneer badge.

Create an 11th dealer (dealer11@test.com):

**Expected**: No Pioneer badge (only first 10).

### 4. Login Flow

1. Sign out
2. Navigate to `/auth/login`
3. Enter credentials: buyer@test.com / test123
4. Click "Sign In"
5. **Expected**: Redirect to homepage, logged in as buyer
6. Try invalid credentials
7. **Expected**: Error message "Invalid email or password"

### 5. Route Protection

**Protected Dealer Routes**:
1. While logged in as buyer, try to access `/dashboard`
2. **Expected**: Redirect to homepage (role check failed)

**Protected Buyer Routes**:
1. While logged in as dealer, try to access `/buyer`
2. **Expected**: Redirect to homepage (role check failed)

**Unauthenticated Access**:
1. Sign out
2. Try to access `/dashboard`
3. **Expected**: Redirect to `/auth/login`
4. Try to access `/buyer`
5. **Expected**: Redirect to `/auth/login`

**Auth Page Redirects**:
1. While logged in, try to access `/auth/login`
2. **Expected**: Redirect to homepage

### 6. Admin Verification System

**Create Admin User** (manual database update required):

```bash
# Connect to database
sudo -u postgres psql

\l
\c aim_vs

# Update a user to be admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'buyer@test.com';
\q
```

**Test Admin Panel**:
1. Sign out and log back in as the admin user
2. Navigate to `/admin/verifications`
3. **Expected**: See list of pending dealers
4. Click "Approve" on dealer1@test.com
5. **Expected**: Dealer approved (you'd need to refresh or implement live updates)
6. Sign in as dealer1@test.com
7. **Expected**:  Verified" badge shows instead of "Pending"

###  7. Session Persistence

1. Log in as any user
2. Refresh the page
3. **Expected**: Still logged in
4. Navigate between pages
5. **Expected**: Session persists

### 8. Sign Out

1. While logged in, click "Sign Out"
2. **Expected**: Redirect to homepage, logged out
3. Try to access protected routes
4. **Expected**: Redirect to login

---

## Database Verification

Check the database to verify data:

```sql
--View all users
SELECT id, name, email, role FROM "User";

--View dealer profiles
SELECT dp.id dp."businessName" dp."isVerified" dp."isPioneer" u.email FROM "DealerProfile" dp JOIN "User" u ON dp."userId" = u.id;

--View buyer profiles
SELECT bp.id, bp.phone, bp.location, u.email FROM "BuyerProfile" bp JOIN "User" u ON bp."userId" = u.id;

--Count pioneer dealers
SELECT COUNT(*) FROM "DealerProfile" WHERE "isPioneer" = true;
--Expected: 10 or fewer

--Check verified dealers
SELECT COUNT(*) FROM "DealerProfile" WHERE "isVerified" = true;
```

---

## Known Issues & Notes

1. **Admin User Creation**: Currently requires manual database update. In production, this would be done via a seed script or separate admin creation endpoint.

2. **BOLO Fetch API**: The admin verifications page has a placeholder `fetchPendingDealers()` function. This would need a separate API route to fetch pending dealers from the database.

3. **Cloudinary Upload Preset**: For dealer permit uploads, you need to create an upload preset named `aim_vs_permits` in your Cloudinary dashboard with unsigned uploads enabled.

4. **Email Notifications**: Currently not implemented. Dealers won't receive email notifications when verified.

---

## Next Steps (Phase 2)

After authentication is verified:
- Implement dealer inventory management
- Create marketplace for buyers
- Add car listing/browsing functionality
- Implement favorites system
- Build BOLO request matching

---

## Troubleshooting

**"Database connection error"**:
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database `aim_vs` exists

**"NextAuth configuration error"**:
- Verify NEXTAUTH_SECRET is set in `.env`
- Check NEXTAUTH_URL matches your local setup

**"Cloudinary upload failed"**:
- Verify Cloudinary credentials in `.env`
- Check upload preset exists and allows unsigned uploads

**"Middleware redirect loop"**:
- Clear browser cache and cookies
- Check middleware.ts configuration

---

