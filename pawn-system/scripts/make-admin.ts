import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const email = "jdovi@gmail.com"

    console.log(`Promoting ${email} to ADMIN...`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.error("User not found!")
        return
    }

    const updated = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" }
    })

    console.log("User updated:", updated)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
