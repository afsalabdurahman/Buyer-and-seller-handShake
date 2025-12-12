
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["BUYER", "SUPPLIER"]),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, role } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            }
        })

        return NextResponse.json({ user: { id: newUser.id, email: newUser.email, role: newUser.role } }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
