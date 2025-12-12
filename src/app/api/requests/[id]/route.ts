
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
})

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPPLIER") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { status } = updateSchema.parse(body)
        const { id } = params

        let updateData: any = { status }

        const existingRequest = await prisma.request.findUnique({
            where: { id },
            include: { listing: true }
        })
        if (!existingRequest) return NextResponse.json({ message: "Not found" }, { status: 404 })

        const updated = await prisma.$transaction(async (tx) => {
            // REJECTION LOGIC
            if (status === "REJECTED") {
                if (existingRequest.paymentStatus === "COMPLETED") {
                    updateData.paymentStatus = "REFUNDED"
                    // Add stock back since we deducted on creation
                    await tx.listing.update({
                        where: { id: existingRequest.listingId },
                        data: { quantityAvailable: { increment: existingRequest.requestedQuantity } }
                    })
                }
            }
            // ACCEPTANCE LOGIC
            else if (status === "ACCEPTED") {
                // If RFQ (not paid on create), deduct now
                if (existingRequest.paymentStatus !== "COMPLETED") {
                    // Check stock first
                    const currentListing = await tx.listing.findUnique({ where: { id: existingRequest.listingId } })
                    if (!currentListing || currentListing.quantityAvailable < existingRequest.requestedQuantity) {
                        throw new Error("Insufficient stock to accept")
                    }

                    await tx.listing.update({
                        where: { id: existingRequest.listingId },
                        data: { quantityAvailable: { decrement: existingRequest.requestedQuantity } }
                    })
                }
            }

            return await tx.request.update({
                where: { id },
                data: updateData
            })
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ message: "Error updating request" }, { status: 500 })
    }
}
