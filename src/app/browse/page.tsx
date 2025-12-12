
"use client"

import { useEffect, useState } from "react"
import { Listing } from "@/types"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function BrowsePage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [filter, setFilter] = useState("all")
    const { data: session } = useSession()
    const router = useRouter()
    // Request Modal State
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
    const [requestQty, setRequestQty] = useState(0)
    const [requestMsg, setRequestMsg] = useState("")
    const [requestLoading, setRequestLoading] = useState(false)

    useEffect(() => {
        fetch("/api/listings")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setListings(data)
            })
            .catch(err => console.error(err))
    }, [])

    const filteredListings = filter === "all"
        ? listings
        : listings.filter(l => l.category === filter)

    const handleRequestPurchase = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!session) {
            router.push("/login")
            return
        }
        if (!selectedListing) return

        // Fixed Price -> Redirect to Payment
        if (selectedListing.pricingMode === "FIXED" && selectedListing.unitPrice) {
            const total = (requestQty * selectedListing.unitPrice).toFixed(2)
            router.push(`/payment?listingId=${selectedListing.id}&quantity=${requestQty}&amount=${total}`)
            return
        }

        setRequestLoading(true)
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: selectedListing.id,
                    requestedQuantity: requestQty,
                    message: requestMsg,
                    totalAmount: null
                })
            })

            if (res.ok) {
                toast.success("Quote Requested Successfully")
                setSelectedListing(null)
                setRequestQty(0)
                setRequestMsg("")
            } else {
                toast.error("Failed to send request")
            }
        } catch (err) {
            toast.error("Error sending request")
        } finally {
            setRequestLoading(false)
        }
    }

    return (
        <div className="container py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Browse Resources</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['all', 'raw_material', 'service', 'other'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${filter === cat ? 'bg-white shadow-sm text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(listing => (
                    <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {listing.category.replace('_', ' ')}
                                </span>
                                {listing.pricingMode === 'FIXED' ? (
                                    <span className="text-green-700 font-bold bg-green-50 px-3 py-1 rounded-lg">
                                        ${listing.unitPrice}/{listing.unit}
                                    </span>
                                ) : (
                                    <span className="text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-lg">
                                        RFQ
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{listing.description}</p>

                            <div className="flex items-center text-sm text-gray-500 mb-6 gap-4">
                                <span className="flex items-center gap-1">
                                    📦 {listing.quantityAvailable} {listing.unit}
                                </span>
                                <span className="flex items-center gap-1">
                                    🌍 {listing.locationCountry}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    if (!session) {
                                        router.push("/login")
                                        return
                                    }
                                    if (session.user.role === 'SUPPLIER') {
                                        toast.error("Suppliers cannot make requests.")
                                        return
                                    }
                                    setSelectedListing(listing)
                                }}
                                disabled={listing.quantityAvailable <= 0}
                                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${listing.quantityAvailable <= 0
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                                    }`}
                            >
                                {listing.quantityAvailable <= 0
                                    ? 'Out of Stock'
                                    : listing.pricingMode === 'FIXED' ? 'Request Purchase' : 'Request Quote'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Request Modal */}
            {selectedListing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-1">
                            {selectedListing.pricingMode === 'FIXED' ? 'Purchase Request' : 'Request a Quote'}
                        </h2>
                        <p className="text-gray-500 mb-6">for {selectedListing.name}</p>

                        <form onSubmit={handleRequestPurchase}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Quantity ({selectedListing.unit})
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedListing.quantityAvailable}
                                        required
                                        className="w-full border p-2 rounded-lg"
                                        value={requestQty}
                                        onChange={(e) => setRequestQty(Number(e.target.value))}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Available: {selectedListing.quantityAvailable}</p>
                                </div>

                                {selectedListing.pricingMode === 'FIXED' && selectedListing.unitPrice && (
                                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Total Price</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            ${(requestQty * selectedListing.unitPrice).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                                    <textarea
                                        className="w-full border p-2 rounded-lg"
                                        rows={3}
                                        placeholder="Add notes for the supplier..."
                                        value={requestMsg}
                                        onChange={(e) => setRequestMsg(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setSelectedListing(null)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={requestLoading || requestQty <= 0}
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {requestLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
