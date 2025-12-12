
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Resource Hub",
    description: "Connect buyers and suppliers efficiently.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
