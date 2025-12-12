
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const listingSchema = z.object({
    category: z.string().min(1),
    name: z.string().min(3),
    description: z.string().min(10),
    quantityAvailable: z.number().int().positive(),
    unit: z.string().min(1),
    locationCountry: z.string().min(2),
    pricingMode: z.enum(["FIXED", "RFQ_ONLY"]),
    unitPrice: z.number().optional().nullable(),
})

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const listing = await prisma.listing.findUnique({
        where: { id }
    })

    if (!listing) {
        return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    return NextResponse.json(listing)
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPPLIER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const validated = listingSchema.parse(body)
        const { id } = params

        // Ensure ownership
        const existing = await prisma.listing.findUnique({ where: { id } })
        if (!existing || existing.supplierId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.listing.update({
            where: { id },
            data: validated
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ message: "Error updating" }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPPLIER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = params

        const existing = await prisma.listing.findUnique({ where: { id } })
        if (!existing || existing.supplierId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        await prisma.listing.delete({ where: { id } })

        return NextResponse.json({ message: "Deleted successfully" })
    } catch (error) {
        return NextResponse.json({ message: "Error deleting listing" }, { status: 500 })
    }
}
