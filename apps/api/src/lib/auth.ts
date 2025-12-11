import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema/auth-schema";
import "dotenv/config";

export const auth = betterAuth({
  basePath: "/api/auth",
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 32,
    minPasswordLength: 8,
  },
});
