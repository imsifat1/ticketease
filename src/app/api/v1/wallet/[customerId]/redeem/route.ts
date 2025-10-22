import { redeemRewardPoints } from "@/ai/flows/redeem-points-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: { customerId: string } }
) {
    const customerId = params.customerId;
    
    if (!customerId) {
        return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    try {
        const result = await redeemRewardPoints({ customerId });
        
        if (!result.success) {
            return NextResponse.json({ message: result.message }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error redeeming points:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
