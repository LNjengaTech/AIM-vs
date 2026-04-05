// prisma/seed.ts
import { PrismaClient, UserRole, CarStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('--- SEEDING DATABASE ---')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aimmombasa.com' },
    update: {},
    create: {
      email: 'admin@aimmombasa.com',
      name: 'System Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log('Admin user created:', admin.email)

  // 2. Create Dealer User & Profile
  const dealerPassword = await bcrypt.hash('dealer123', 10)
  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer@showroom.com' },
    update: {},
    create: {
      email: 'dealer@showroom.com',
      name: 'Mombasa Motors',
      password: dealerPassword,
      role: UserRole.DEALER,
      dealerProfile: {
        create: {
          businessName: 'Mombasa Motors Ltd',
          businessPhone: '+254712345678',
          businessAddress: 'Nyali, Mombasa',
          location: 'Nyali',
          isVerified: true,
          isPioneer: true,
        }
      }
    },
    include: { dealerProfile: true }
  })
  console.log('Dealer user created:', dealerUser.email)

  // 3. Create Buyer User & Profile
  const buyerPassword = await bcrypt.hash('buyer123', 10)
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      email: 'buyer@test.com',
      name: 'John Buyer',
      password: buyerPassword,
      role: UserRole.BUYER,
      buyerProfile: {
        create: {
          phone: '+254788888888',
          location: 'Ganjoni',
        }
      }
    }
  })
  console.log('Buyer user created:', buyerUser.email)

  // 4. Create sample car for the dealer
  if (dealerUser.dealerProfile) {
    const sampleCar = await prisma.car.create({
      data: {
        dealerId: dealerUser.dealerProfile.id,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        bodyType: 'Sedan',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        mileage: 45000,
        price: 2500000.00,
        condition: 'Excellent',
        status: CarStatus.AVAILABLE,
        slug: 'toyota-corolla-2020-seed',
        isVerified: true,
        images: ['https://res.cloudinary.com/ducayuasy/image/upload/v1/aim_vs/sample_car'],
        features: ['Sunroof', 'Leather Seats', 'Reverse Camera'],
      }
    })
    console.log('Sample car created:', sampleCar.slug)
  }

  // 5. Create default Hero Section
  await prisma.heroSection.upsert({
    where: { id: 'default-hero' },
    update: {},
    create: {
      id: 'default-hero',
      isActive: true,
      headline: 'Find Your Perfect Car – Verified, Available, and Matched Just for You!',
      subheadline: 'No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.',
      tagline: 'Mombasa\'s #1 AI-Powered Auto Hub',
      foregroundImageScale: 1,
      foregroundImageX: 0,
      foregroundImageY: 0,
    }
  })
  console.log('Default Hero Section created.')

  console.log('--- SEEDING COMPLETE ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
