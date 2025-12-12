"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CreditCard, Calendar, Lock } from "lucide-react"
import { toast } from "sonner"

function PaymentForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const listingId = searchParams.get("listingId")
    const quantity = Number(searchParams.get("quantity"))

    const [loading, setLoading] = useState(false)
    const [totalAmount, setTotalAmount] = useState<number | null>(null)

    useEffect(() => {
        if (!listingId) {
            router.push("/browse")
            return
        }
    }, [listingId, router])

    // Mock total calculation (in real app, fetch from server)
    // For this dummy implementation, I'll pass amount in query for now to speed up, 
    // though unsafe, it's a "dummy" payment page.
    const amount = searchParams.get("amount")

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate Network Delay
        await new Promise(r => setTimeout(r, 2000))

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId,
                    requestedQuantity: quantity,
                    message: "Paid via Card",
                    totalAmount: Number(amount),
                    paymentStatus: "COMPLETED"
                })
            })

            if (!res.ok) throw new Error("Payment failed")

            toast.success("Payment Successful!", {
                description: "Your order has been placed successfully.",
                duration: 4000,
            })

            router.push("/buyer/requests")
            router.refresh()
        } catch (err) {
            toast.error("Payment Failed", { description: "Please try again." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Secure Payment
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Total to pay: <span className="font-bold text-lg text-green-600">${amount}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handlePayment}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Card Number</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text" required
                                    maxLength={19}
                                    placeholder="0000 0000 0000 0000"
                                    className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" required
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CVC</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" required
                                        maxLength={4}
                                        placeholder="123"
                                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                            <input
                                type="text" required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : `Pay $${amount}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PaymentForm />
        </Suspense>
    )
}
