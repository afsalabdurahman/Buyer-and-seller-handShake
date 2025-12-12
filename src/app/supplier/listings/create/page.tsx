
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { toast } from "sonner"

export default function CreateListingPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        category: "raw_material",
        name: "",
        description: "",
        quantityAvailable: 0,
        unit: "kg",
        locationCountry: "",
        pricingMode: "FIXED",
        unitPrice: 0
    })
    const [loading, setLoading] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                unitPrice: formData.pricingMode === "FIXED" ? Number(formData.unitPrice) : null,
                quantityAvailable: Number(formData.quantityAvailable)
            }

            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to create listing")

            toast.success("Listing Created Successfully")
            router.push("/supplier/listings")
            router.refresh()
        } catch (error) {
            toast.error("Error creating listing")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text" required
                            className="w-full border p-2 rounded-lg"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            className="w-full border p-2 rounded-lg"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="raw_material">Raw Material</option>
                            <option value="service">Service</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full border p-2 rounded-lg"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number" min="1" required
                            className="w-full border p-2 rounded-lg"
                            value={formData.quantityAvailable}
                            onChange={(e) => setFormData({ ...formData, quantityAvailable: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Unit</label>
                        <input
                            type="text" required placeholder="kg, ton, etc."
                            className="w-full border p-2 rounded-lg"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Location (Country)</label>
                        <input
                            type="text" required
                            className="w-full border p-2 rounded-lg"
                            value={formData.locationCountry}
                            onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Pricing Mode</label>
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricingMode"
                                value="FIXED"
                                checked={formData.pricingMode === "FIXED"}
                                onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}
                            />
                            <span className="font-medium">Fixed Price</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="pricingMode"
                                value="RFQ_ONLY"
                                checked={formData.pricingMode === "RFQ_ONLY"}
                                onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}
                            />
                            <span className="font-medium">Request for Quote (RFQ)</span>
                        </label>
                    </div>

                    {formData.pricingMode === "FIXED" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Unit Price ($)</label>
                            <input
                                type="number" min="0" step="0.01" required
                                className="w-full border p-2 rounded-lg"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit" disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold w-full md:w-auto"
                >
                    {loading ? "Creating..." : "Publish Listing"}
                </button>
            </form>
        </div>
    )
}
