
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const listingSchema = z.object({
    category: z.string(),
    name: z.string().min(1),
    description: z.string(),
    quantityAvailable: z.number().int().positive(),
    unit: z.string(),
    locationCountry: z.string(),
    pricingMode: z.enum(["FIXED", "RFQ_ONLY"]),
    unitPrice: z.number().nullable().optional(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPPLIER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const data = listingSchema.parse(body)

        const listing = await prisma.listing.create({
            data: {
                ...data,
                supplierId: session.user.id,
            }
        })

        return NextResponse.json(listing, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Invalid data" }, { status: 400 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const supplierId = searchParams.get("supplierId") // Optional filter

    const where: any = {}
    if (category) where.category = category
    if (supplierId) where.supplierId = supplierId

    try {
        const listings = await prisma.listing.findMany({
            where,
            include: {
                supplier: true
            }
        })
        return NextResponse.json(listings)
    } catch (error) {
        return NextResponse.json({ message: "Error fetching listings" }, { status: 500 })
    }
}
