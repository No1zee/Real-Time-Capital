import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Map keywords to specific high-quality Unsplash images
const IMAGE_MAP: Record<string, string> = {
    "iPhone": "https://images.unsplash.com/photo-1592286211734-4b241539b5e9?auto=format&fit=crop&w=800&q=80",
    "MacBook": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80",
    "Rolex": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80",
    "Ring": "https://images.unsplash.com/photo-1605100804763-eb2fc603675d?auto=format&fit=crop&w=800&q=80",
    "Necklace": "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=800&q=80",
    "Toyota": "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    "Honda": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    "Bike": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80",
    "PS5": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    "PlayStation": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    "Xbox": "https://images.unsplash.com/photo-1621259182902-885f6e3a5728?auto=format&fit=crop&w=800&q=80",
    "Gaming PC": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    "Stratocaster": "https://images.unsplash.com/photo-1550985543-f47f38aee65d?auto=format&fit=crop&w=800&q=80",
    "Les Paul": "https://images.unsplash.com/photo-1550985543-f47f38aee65d?auto=format&fit=crop&w=800&q=80", // Fallback guitar
    "Drill": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "Handbag": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "Jacket": "https://images.unsplash.com/photo-1551028919-30164a7ed4af?auto=format&fit=crop&w=800&q=80",
    "Comic": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80",
    "Painting": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
    "Table": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
    "Sofa": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "Rug": "https://images.unsplash.com/photo-1596162954151-cd6d6abb2dcb?auto=format&fit=crop&w=800&q=80",
    "Samsung": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    "Canon": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "Drone": "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80",
    "Watch": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80", // Generic watch
}

async function main() {
    console.log("Fetching all items in auction...")
    const items = await prisma.item.findMany({
        where: { status: "IN_AUCTION" }
    })

    console.log(`Found ${items.length} items. Fixing images...`)

    for (const item of items) {
        let newImage = null

        // Find matching keyword
        for (const [keyword, url] of Object.entries(IMAGE_MAP)) {
            if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
                newImage = url
                break
            }
        }

        if (newImage) {
            await prisma.item.update({
                where: { id: item.id },
                data: { images: JSON.stringify([newImage]) }
            })
            // console.log(`Updated ${item.name}`)
            process.stdout.write(".")
        } else {
            console.log(`\nNo match found for: ${item.name}`)
        }
    }

    console.log("\nDone! Images updated.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
