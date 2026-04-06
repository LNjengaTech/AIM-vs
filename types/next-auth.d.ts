//types/next-auth.d.ts
//Extend NextAuth types to include custom user properties

import { UserRole } from "@prisma/client"

declare module "next-auth" {
    interface User {
        role: UserRole
    }

    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            role: string
        }
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        role: string
        id: string
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role: UserRole
    }
}
