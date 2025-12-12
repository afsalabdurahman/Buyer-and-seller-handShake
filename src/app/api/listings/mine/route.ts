
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPPLIER") {
        // If buyer tries to access, deny. Or if not logged in.
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const listings = await prisma.listing.findMany({
            where: {
                supplierId: session.user.id
            }
        })
        return NextResponse.json(listings)
    } catch (error) {
        return NextResponse.json({ message: "Error fetching listings" }, { status: 500 })
    }
}
