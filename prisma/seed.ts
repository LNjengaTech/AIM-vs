// prisma/seed.ts
// Demo seed data for AIM-Mombasa.
// Creates: 1 admin, 3 dealers (2 verified + 1 pending), 2 buyers,
//          15 cars, 2 BOLO requests, 2 published reviews,
//          1 conversation with 3 messages, 1 admin notification.
// Run: npx prisma db seed

import { PrismaClient, CarStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateUniqueCarSlug } from '../lib/utils/slug';
import { calculateCompletenessScore } from '../lib/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING SEEDING ---');

  // SECTION 1 — CLEANUP
  console.log('Cleaning up database...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.bOLOMatch.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bOLORequest.deleteMany();
  await prisma.car.deleteMany();
  await prisma.dealerAnalytics.deleteMany();
  await prisma.dealerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.heroSection.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // SECTION 2 — PASSWORD HASHES
  /*
    Credentials:
    admin@aim-mombasa.com  /  Admin@2026!
    dealer1@test.com       /  Dealer@2026!
    dealer2@test.com       /  Dealer@2026!
    dealer3@test.com       /  Dealer@2026!
    buyer1@test.com        /  Buyer@2026!
    buyer2@test.com        /  Buyer@2026!
  */
  const adminPass = await bcrypt.hash("Admin@2026!", 12);
  const dealerPass = await bcrypt.hash("Dealer@2026!", 12);
  const buyerPass = await bcrypt.hash("Buyer@2026!", 12);

  // SECTION 3 — CREATE USERS
  console.log('Creating users...');

  const admin = await prisma.user.create({
    data: {
      name: "AIM Admin",
      email: "admin@aim-mombasa.com",
      password: adminPass,
      role: UserRole.ADMIN,
    },
  });

  const dealer1 = await prisma.user.create({
    data: {
      name: "Hassan Mwamba",
      email: "dealer1@test.com",
      password: dealerPass,
      role: UserRole.DEALER,
      dealerProfile: {
        create: {
          businessName: "Ganjoni Auto Dealers",
          businessPhone: "0712 345 678",
          businessAddress: "Ganjoni, near Shell petrol station, Mombasa",
          location: "Ganjoni",
          description: "Established used car dealer in Ganjoni since 2015. We specialize in high-quality foreign used Japanese vehicles.",
          isVerified: true,
          isPioneer: true,
          verifiedAt: new Date(),
          pioneerBadgeDate: new Date(),
        },
      },
    },
    include: { dealerProfile: true },
  });

  const dealer2 = await prisma.user.create({
    data: {
      name: "Fatuma Abdalla",
      email: "dealer2@test.com",
      password: dealerPass,
      role: UserRole.DEALER,
      dealerProfile: {
        create: {
          businessName: "Nyali Premium Cars",
          businessPhone: "0722 111 222",
          businessAddress: "Nyali Centre, Mombasa",
          location: "Nyali",
          description: "Mombasa's premier destination for luxury and premium vehicles.",
          isVerified: true,
          isPioneer: false,
          verifiedAt: new Date(),
        },
      },
    },
    include: { dealerProfile: true },
  });

  const dealer3 = await prisma.user.create({
    data: {
      name: "Omar Salim",
      email: "dealer3@test.com",
      password: dealerPass,
      role: UserRole.DEALER,
      dealerProfile: {
        create: {
          businessName: "Shimanzi Motors",
          businessPhone: "0733 444 555",
          businessAddress: "Shimanzi Industrial Area, Mombasa",
          location: "Shimanzi",
          description: "Reliable commercial and utility vehicles in the heart of Shimanzi.",
          isVerified: false,
          isPioneer: false,
        },
      },
    },
    include: { dealerProfile: true },
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: "Amina Odhiambo",
      email: "buyer1@test.com",
      password: buyerPass,
      role: UserRole.BUYER,
      buyerProfile: { create: {} },
    },
    include: { buyerProfile: true },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "David Kariuki",
      email: "buyer2@test.com",
      password: buyerPass,
      role: UserRole.BUYER,
      buyerProfile: { create: {} },
    },
    include: { buyerProfile: true },
  });

  // SECTION 4 — HELPER FUNCTION createCar
  async function createCar(params: any) {
    const {
      make, model, year, color, price, mileage, condition, bodyType, transmission,
      fuelType, engineCapacity, features, description, dealerId, isVerified, status = CarStatus.AVAILABLE
    } = params;

    const slug = await generateUniqueCarSlug(make, model, year, prisma);
    const completenessScore = calculateCompletenessScore({
      images: [],
      description,
      features,
      has360View: false,
    });

    return prisma.car.create({
      data: {
        dealerId,
        make,
        model,
        year,
        color,
        price,
        mileage,
        condition,
        bodyType,
        transmission,
        fuelType,
        engineCapacity,
        features,
        description,
        isVerified,
        status,
        slug,
        completenessScore,
        images: [],
        has360View: false,
      },
    });
  }

  // SECTION 5 — CREATE 15 CARS
  console.log('Creating 15 cars...');

  const carsData = [
    {
      make: "Toyota", model: "Axio", year: 2019, color: "Pearl White", price: 890000, mileage: 42000,
      condition: "FOREIGN_USED", bodyType: "SEDAN", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1500cc",
      features: ["Reversing Camera", "Tinted Windows", "Alloy Wheels", "Bluetooth"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "This 2019 Toyota Axio in pearl white is a well-maintained foreign-used sedan with only 42,000 km. Automatic transmission, reversing camera included. KES 890,000 negotiable."
    },
    {
      make: "Toyota", model: "Axio", year: 2017, color: "Silver", price: 720000, mileage: 68000,
      condition: "FOREIGN_USED", bodyType: "SEDAN", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1500cc",
      features: ["USB Port", "Tinted Windows", "Fog Lights"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "Clean 2017 Toyota Axio. Reliable and fuel efficient. Silver color with fog lights."
    },
    {
      make: "Toyota", model: "Vitz", year: 2016, color: "Red", price: 580000, mileage: 55000,
      condition: "FOREIGN_USED", bodyType: "HATCHBACK", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1000cc",
      features: ["Bluetooth", "Fuel Efficient", "Compact"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "Perfect city car. Red Toyota Vitz 2016 model. Very low fuel consumption."
    },
    {
      make: "Toyota", model: "Harrier", year: 2020, color: "Black", price: 2400000, mileage: 28000,
      condition: "FOREIGN_USED", bodyType: "SUV", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "2000cc",
      features: ["Sunroof", "Leather Seats", "360 Camera", "Heated Seats", "Apple CarPlay"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "Luxurious 2020 Toyota Harrier. Black with full leather interior and sunroof. Top of the line features."
    },
    {
      make: "Nissan", model: "Note", year: 2018, color: "White", price: 650000, mileage: 51000,
      condition: "FOREIGN_USED", bodyType: "HATCHBACK", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1200cc",
      features: ["Reversing Camera", "Bluetooth", "Fuel Efficient"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "Spacious and efficient Nissan Note. 2018 model in pristine white."
    },
    {
      make: "Mitsubishi", model: "Outlander", year: 2018, color: "White", price: 1850000, mileage: 44000,
      condition: "FOREIGN_USED", bodyType: "SUV", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "2400cc",
      features: ["7 Seater", "All-Wheel Drive", "Sunroof", "Reversing Camera"],
      dealerId: dealer1.dealerProfile!.id, isVerified: true,
      description: "Family SUV. 7-seater Mitsubishi Outlander. AWD with sunroof. Great for Mombasa roads."
    },
    {
      make: "Nissan", model: "X-Trail", year: 2019, color: "Silver", price: 1950000, mileage: 35000,
      condition: "FOREIGN_USED", bodyType: "SUV", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "2000cc",
      features: ["7 Seater", "All-Wheel Drive", "Sunroof", "Apple CarPlay", "Reversing Camera"],
      dealerId: dealer2.dealerProfile!.id, isVerified: true,
      description: "Versatile 2019 Nissan X-Trail. Silver SUV with low mileage and modern infotainment."
    },
    {
      make: "Mazda", model: "Demio", year: 2018, color: "Blue", price: 680000, mileage: 47000,
      condition: "FOREIGN_USED", bodyType: "HATCHBACK", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1300cc",
      features: ["Bluetooth", "USB Port", "Alloy Wheels"],
      dealerId: dealer2.dealerProfile!.id, isVerified: true,
      description: "Stylish and economical Mazda Demio. Deep blue color, 2018 model."
    },
    {
      make: "Mazda", model: "CX-5", year: 2020, color: "Soul Red", price: 2200000, mileage: 22000,
      condition: "FOREIGN_USED", bodyType: "SUV", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "2500cc",
      features: ["Sunroof", "Leather Seats", "Heads-Up Display", "Lane Assist", "Reversing Camera"],
      dealerId: dealer2.dealerProfile!.id, isVerified: true,
      description: "Premium 2020 Mazda CX-5 in Soul Red. Low mileage and loaded with safety features."
    },
    {
      make: "Honda", model: "Vezel", year: 2019, color: "White", price: 1750000, mileage: 31000,
      condition: "FOREIGN_USED", bodyType: "CROSSOVER", transmission: "AUTO", fuelType: "HYBRID", engineCapacity: "1500cc",
      features: ["Hybrid Engine", "Reversing Camera", "Apple CarPlay", "Honda Sensing"],
      dealerId: dealer2.dealerProfile!.id, isVerified: true,
      description: "Efficient and modern Honda Vezel Hybrid. 2019 model with advanced safety tech."
    },
    {
      make: "Suzuki", model: "Swift", year: 2018, color: "Orange", price: 620000, mileage: 49000,
      condition: "FOREIGN_USED", bodyType: "HATCHBACK", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1200cc",
      features: ["Alloy Wheels", "Bluetooth", "Fuel Efficient"],
      dealerId: dealer2.dealerProfile!.id, isVerified: true,
      description: "Zippy and fun Suzuki Swift. Bright orange, 2018 model. Excellent fuel economy."
    },
    {
      make: "Subaru", model: "Forester", year: 2017, color: "Dark Grey", price: 1450000, mileage: 72000,
      condition: "FOREIGN_USED", bodyType: "SUV", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "2000cc",
      features: ["All-Wheel Drive", "Sunroof", "Leather Seats"],
      dealerId: dealer3.dealerProfile!.id, isVerified: false,
      description: "Capable Subaru Forester. Symmetrical AWD, leather interior, and sunroof. 2017 model."
    },
    {
      make: "Subaru", model: "Impreza", year: 2016, color: "Blue", price: 890000, mileage: 85000,
      condition: "FOREIGN_USED", bodyType: "SEDAN", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1600cc",
      features: ["All-Wheel Drive", "Alloy Wheels"],
      dealerId: dealer3.dealerProfile!.id, isVerified: false,
      description: "Reliable AWD Subaru Impreza. Blue sedan, 2016 model. Solid performance."
    },
    {
      make: "Honda", model: "Fit", year: 2017, color: "Silver", price: 680000, mileage: 60000,
      condition: "FOREIGN_USED", bodyType: "HATCHBACK", transmission: "AUTO", fuelType: "PETROL", engineCapacity: "1300cc",
      features: ["Magic Seat", "Bluetooth", "Reversing Camera"],
      dealerId: dealer3.dealerProfile!.id, isVerified: false,
      description: "Versatile Honda Fit with magic seats. Silver, 2017 model. Surprisingly spacious."
    },
    {
      make: "Mitsubishi", model: "Colt", year: 2015, color: "Silver", price: 420000, mileage: 120000,
      condition: "LOCAL_USED", bodyType: "HATCHBACK", transmission: "MANUAL", fuelType: "PETROL", engineCapacity: "1300cc",
      features: ["Fuel Efficient"],
      dealerId: dealer3.dealerProfile!.id, isVerified: false, status: CarStatus.SOLD,
      description: "Sold - Local used Mitsubishi Colt. 2015 model, silver color."
    },
  ];

  for (const car of carsData) {
    await createCar(car);
  }

  // SECTION 6 — BOLO REQUESTS
  console.log('Creating BOLO requests...');
  await prisma.bOLORequest.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      make: "Toyota",
      model: "Axio",
      yearMin: 2018,
      yearMax: 2022,
      priceMax: 900000,
      transmission: "AUTO",
      isActive: true,
    },
  });

  await prisma.bOLORequest.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      bodyType: "SUV",
      priceMax: 1500000,
      fuelType: "PETROL",
      isActive: true,
    },
  });

  // SECTION 7 — HERO SECTION
  console.log('Setting up Hero Section...');
  await prisma.heroSection.upsert({
    where: { id: "default-hero" },
    update: {},
    create: {
      id: "default-hero",
      headline: "LIMITLESS",
      tagline: "PERFORMANCE",
      subheadline: "No more wasted trips. Browse live inventory, set alerts, and connect with trusted dealers.",
      isActive: true,
      hasFeaturedCar: false,
    },
  });

  // SECTION 8 — REVIEWS
  console.log('Adding reviews...');
  await prisma.review.create({
    data: {
      buyerId: buyer1.buyerProfile!.id,
      rating: 5,
      isPublished: true,
      isRemoved: false,
      content: "Found my Toyota Axio through AIM-Mombasa in less than a week. The BOLO alert feature is brilliant — I set my criteria and got notified when it was listed. The dealer was professional and the car was exactly as described. No wasted trips.",
    },
  });

  await prisma.review.create({
    data: {
      buyerId: buyer2.buyerProfile!.id,
      rating: 4,
      isPublished: true,
      isRemoved: false,
      content: "Good platform for finding cars in Mombasa. I liked that all dealers are verified — it gave me confidence. The 360 view would have been nice but not all dealers have it yet. Overall a great experience.",
    },
  });

  // SECTION 9 — CONVERSATION + MESSAGES
  console.log('Seeding conversations and messages...');
  await prisma.conversation.create({
    data: {
      dealerId: dealer1.id,
      adminId: admin.id,
    },
  });

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneAndHalfDaysAgo = new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  await prisma.message.createMany({
    data: [
      {
        senderId: dealer1.id,
        receiverId: admin.id,
        content: "Hello, I submitted my dealer permit last week. Could you let me know when verification will be complete?",
        isRead: true,
        createdAt: twoDaysAgo,
      },
      {
        senderId: admin.id,
        receiverId: dealer1.id,
        content: "Hi Hassan! Your permit has been verified and your account is now approved. You have also been awarded the Pioneer badge as one of our first dealers. Welcome to AIM-Mombasa!",
        isRead: true,
        createdAt: oneAndHalfDaysAgo,
      },
      {
        senderId: dealer1.id,
        receiverId: admin.id,
        content: "Thank you! Really appreciate the quick turnaround. Looking forward to listing my cars.",
        isRead: false,
        createdAt: oneDayAgo,
      },
    ],
  });

  // SECTION 10 — ADMIN NOTIFICATION
  console.log('Adding admin notification...');
  await prisma.notification.create({
    data: {
      type: "CONTACT_FORM",
      title: "New message: Research Collaboration",
      message: "From Dr. Mwangi (mwangi@tum.ac.ke): Interested in discussing the AIM-Mombasa research for the TUM IT department journal...",
      isRead: false,
    },
  });

  // SECTION 11 — CONSOLE LOGS
  console.log('--- SEED COMPLETE ---');
  console.log('Admin:    admin@aim-mombasa.com / Admin@2026!');
  console.log('Dealer 1: dealer1@test.com      / Dealer@2026!');
  console.log('Dealer 2: dealer2@test.com      / Dealer@2026!');
  console.log('Dealer 3: dealer3@test.com      / Dealer@2026!');
  console.log('Buyer 1:  buyer1@test.com       / Buyer@2026!');
  console.log('Buyer 2:  buyer2@test.com       / Buyer@2026!');
  console.log('Summary: 15 cars, 2 BOLO requests, 2 reviews, 1 conversation (3 messages), 1 notification');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
