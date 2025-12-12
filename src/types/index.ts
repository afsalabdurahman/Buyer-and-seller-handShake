
export interface Listing {
    id: string;
    supplierId: string;
    category: string;
    name: string;
    description: string;
    quantityAvailable: number;
    unit: string;
    locationCountry: string;
    pricingMode: "FIXED" | "RFQ_ONLY";
    unitPrice: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface Request {
    id: string;
    listingId: string;
    listing?: Listing;
    buyerId: string;
    buyer?: {
        id: string;
        name: string;
        email: string;
    };
    requestedQuantity: number;
    message: string | null;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    paymentStatus?: string | null;
    totalAmount: number | null;
    createdAt: string;
}

export type UserRole = "BUYER" | "SUPPLIER";
