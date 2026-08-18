import dotenv from "dotenv"
import path from "path"
import { defineConfig } from "prisma/config"

// Load env.development for Prisma CLI commands (e.g. migrations)
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx ./prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"],
  },
})
