
import { AlertTriangle, TrendingUp, Users, Package } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'

export default async function Home() {
    const session = await getServerSession(authOptions)

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-3xl">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                    The Modern Marketplace for <span className="text-blue-600">Global Resources</span>
                </h1>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                    Connect directly with suppliers and buyers. Streamline your procurement process with our secure, efficient, and transparent platform.
                </p>

                {!session ? (
                    <div className="flex gap-4 justify-center">
                        <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Get Started
                        </Link>
                        <Link href="/browse" className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="flex gap-4 justify-center">
                        {session.user.role === 'SUPPLIER' ? (
                            <Link href="/supplier/listings" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg">
                                Manage Listings
                            </Link>
                        ) : (
                            <Link href="/browse" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg">
                                Find Resources
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl px-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Package size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Diverse Inventory</h3>
                    <p className="text-gray-500">Access thousands of raw materials and services from trusted global suppliers.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Fair Pricing</h3>
                    <p className="text-gray-500">Compare fixed prices or request quotes (RFQ) to get the best deal.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Direct Connection</h3>
                    <p className="text-gray-500">Negotiate and communicate directly. No middlemen, full transparency.</p>
                </div>
            </div>
        </div>
    )
}
