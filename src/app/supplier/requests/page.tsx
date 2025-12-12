
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Request } from "@/types"

export default function SupplierRequestsPage() {
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

    const handleStatusUpdate = async (id: string, status: "ACCEPTED" | "REJECTED") => {
        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                const data = await res.json()
                setRequests(prev => prev.map(r => r.id === id ? { ...r, status: data.status, paymentStatus: data.paymentStatus } : r))

                if (status === "ACCEPTED") {
                    toast.success("Request Accepted")
                } else {
                    toast.info("Request Rejected. Payment refunded to buyer.")
                }
            } else {
                toast.error("Failed to update status")
            }
        } catch (err) {
            toast.error("Error updating status")
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Incoming Requests</h1>

            {loading ? (
                <div>Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500">No requests found.</div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{req.listing?.name}</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Buyer: <span className="font-medium">{req.buyer?.name} ({req.buyer?.email})</span></p>
                                    <p>Quantity: <span className="font-medium">{req.requestedQuantity}</span></p>
                                    {req.message && <p className="italic">"{req.message}"</p>}
                                    {req.totalAmount && <p className="text-green-600 font-semibold">Total: ${req.totalAmount}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {req.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, "ACCEPTED")}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
