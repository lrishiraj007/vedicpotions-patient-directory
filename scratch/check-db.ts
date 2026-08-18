import dotenv from "dotenv"
import path from "path"

// Load local development environment file
dotenv.config({ path: path.join(__dirname, "../.env.development") })

async function main() {
  const { prisma } = await import("../src/lib/db")
  const users = await prisma.user.findMany()
  const accounts = await prisma.account.findMany()
  
  console.log("=== DB DIAGNOSTIC ===")
  console.log("USERS:")
  console.log(JSON.stringify(users, null, 2))
  console.log("\nACCOUNTS:")
  console.log(JSON.stringify(accounts, null, 2))
  
  await prisma.$disconnect()
}

main()
  .catch(console.error)
