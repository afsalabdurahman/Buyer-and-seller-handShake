
"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
    const { data: session } = useSession()

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ResourceHub
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/browse" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Browse
                    </Link>

                    {session ? (
                        <>
                            {session.user.role === 'SUPPLIER' && (
                                <>
                                    <Link href="/supplier/listings" className="text-sm font-medium hover:text-blue-600 transition-colors">
                                        My Listings
                                    </Link>
                                    <Link href="/supplier/requests" className="text-sm font-medium hover:text-blue-600 transition-colors">
                                        Incoming Requests
                                    </Link>
                                </>
                            )}
                            {session.user.role === 'BUYER' && (
                                <>
                                    <Link href="/buyer/requests" className="text-sm font-medium hover:text-blue-600 transition-colors">
                                        My Requests
                                    </Link>
                                </>
                            )}

                            <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
                                <span className="text-sm text-gray-500 hidden sm:inline-block">
                                    {session.user.name} ({session.user.role})
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                                Log In
                            </Link>
                            <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
