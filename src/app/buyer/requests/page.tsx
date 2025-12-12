
"use client"

import { useEffect, useState } from "react"
import type { Request } from "@/types"

export default function BuyerRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/requests")
            if (res.ok) {
                setRequests(await res.json())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">My Requests</h1>

            {loading ? (
                <div>Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500">No requests sent yet.</div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{req.listing?.name}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Supplier: <span className="font-medium text-gray-800">Unknown (Mock)</span></p>
                                    {/* In real app we would Include listing.supplier to show name */}
                                    <p>Quantity: <span className="font-medium">{req.requestedQuantity}</span></p>
                                    {req.totalAmount && <p className="text-green-600 font-semibold">Total: ${req.totalAmount}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {req.status}
                                </span>
                                {req.paymentStatus && (
                                    <>
                                        <span className={`text-xs px-2 py-1 rounded border ${req.paymentStatus === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            req.paymentStatus === 'REFUNDED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {req.paymentStatus === 'COMPLETED' ? 'Paid via Card' : req.paymentStatus}
                                        </span>
                                        {req.paymentStatus === 'REFUNDED' && (
                                            <p className="text-xs text-orange-600 mt-1 max-w-[200px] text-right">
                                                Refund amount will be credited to your account within 24 hours.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
