import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const email = "jdovi@gmail.com"
    const user = await prisma.user.findUnique({
        where: { email }
    })

    console.log("User Check:", user ? { email: user.email, role: user.role } : "Not Found")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
