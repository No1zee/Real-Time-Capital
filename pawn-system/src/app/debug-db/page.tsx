import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function DebugDB() {
    try {
        const count = await prisma.auction.count()
        const auctions = await prisma.auction.findMany({
            take: 5,
            include: { item: true }
        })

        return (
            <div className="p-10 font-mono">
                <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
                <p className="mb-4">Total Auctions: {count}</p>
                <div className="bg-slate-900 text-green-400 p-4 rounded overflow-auto">
                    <pre>{JSON.stringify(auctions, null, 2)}</pre>
                </div>
            </div>
        )
    } catch (error: any) {
        return (
            <div className="p-10 font-mono text-red-500">
                <h1>Connection Error</h1>
                <pre>{error.message}</pre>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        )
    }
}
