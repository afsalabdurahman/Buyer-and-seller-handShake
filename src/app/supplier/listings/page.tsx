
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Listing } from "@/types"

import { toast } from "sonner"

export default function SupplierListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchListings();
    }, [])

    const fetchListings = async () => {
        try {
            const res = await fetch("/api/listings/mine")
            if (res.ok) {
                const data = await res.json()
                setListings(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return

        try {
            const res = await fetch(`/api/listings/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success("Listing deleted successfully")
                setListings(prev => prev.filter(l => l.id !== id))
            } else {
                toast.error("Failed to delete listing")
            }
        } catch (error) {
            toast.error("Error deleting listing")
        }
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Listings</h1>
                <Link
                    href="/supplier/listings/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Create New Listing
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : listings.length === 0 ? (
                <div className="text-gray-500 text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    You haven't created any listings yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                        <div key={listing.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="mb-4">
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                                    {listing.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{listing.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{listing.description}</p>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Available</p>
                                        <p className="font-semibold text-gray-900">{listing.quantityAvailable} {listing.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500">Price</p>
                                        <p className="font-semibold text-gray-900">
                                            {listing.pricingMode === 'FIXED' ? `$${listing.unitPrice}/${listing.unit}` : 'RFQ'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/supplier/listings/${listing.id}/edit`}
                                        className="flex-1 text-center border border-gray-200 bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(listing.id)}
                                        className="flex-1 text-center border border-red-200 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
