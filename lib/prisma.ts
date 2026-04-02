//lib/prisma.ts
//Prisma client singleton for Next.js to prevent multiple instances during development

// ---> Explained <---//
//nn Next.js, the server reloads every time u save a file. Without the globalForPrisma check in the code, prisma create a new connection to the db every time i save, eventually causeing db crash with a "too many connections" error

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
