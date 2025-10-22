import { getWallet } from "@/ai/flows/get-wallet-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { customerId: string } }
) {
    const customerId = params.customerId;
    
    if (!customerId) {
        return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    try {
        const wallet = await getWallet({ customerId });
        return NextResponse.json(wallet);
    } catch (error) {
        console.error("Error fetching wallet:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
