import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      name?: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    phone: string;
    name?: string | null;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    role: UserRole;
  }
}
