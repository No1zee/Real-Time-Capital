import { PrismaClient } from "@prisma/client"

console.log("🔓 DECODING ENVIRONMENT VARIABLES...")
console.log("----------------------------------------")
console.log(`DATABASE_URL="${process.env.DATABASE_URL}"`)
console.log("----------------------------------------")
console.log("Copy the value above (inside quotes) to Vercel.")
