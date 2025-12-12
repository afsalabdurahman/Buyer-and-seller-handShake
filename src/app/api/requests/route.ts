
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const requestSchema = z.object({
    listingId: z.string(),
    requestedQuantity: z.number().positive(),
    message: z.string().optional(),
    totalAmount: z.number().nullable().optional(),
    paymentStatus: z.string().optional(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BUYER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const data = requestSchema.parse(body)

        // Check availability
        const listing = await prisma.listing.findUnique({
            where: { id: data.listingId }
        })

        if (!listing) {
            return NextResponse.json({ message: "Listing not found" }, { status: 404 })
        }

        if (listing.quantityAvailable < data.requestedQuantity) {
            return NextResponse.json({ message: "Insufficient stock" }, { status: 400 })
        }

        // Use transaction if decrementing
        const result = await prisma.$transaction(async (tx) => {
            const request = await tx.request.create({
                data: {
                    ...data,
                    buyerId: session.user.id,
                }
            })

            // If Paid (Fixed), deduct immediately
            if (data.paymentStatus === 'COMPLETED') {
                await tx.listing.update({
                    where: { id: data.listingId },
                    data: {
                        quantityAvailable: {
                            decrement: data.requestedQuantity
                        }
                    }
                })
            }

            return request
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Invalid data or Error" }, { status: 400 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        let where: any = {}
        if (session.user.role === "SUPPLIER") {
            // Find listings by this supplier, then find requests for those listings
            // This logic is best handled by DB relation filtering.
            // Mock DB logic in requestDelegate supports: where.listing.supplierId
            where = {
                listing: {
                    supplierId: session.user.id
                }
            }
        } else {
            where = {
                buyerId: session.user.id
            }
        }

        const requests = await prisma.request.findMany({
            where,
            include: {
                listing: true,
                buyer: true, // Suppliers want to see who requested
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(requests)
    } catch (error) {
        return NextResponse.json({ message: "Error fetching requests" }, { status: 500 })
    }
}
