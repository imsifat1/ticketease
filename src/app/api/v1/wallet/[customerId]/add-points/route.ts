import { addPoints } from "@/ai/flows/add-reward-points-flow";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const AddPointsRequestSchema = z.object({
    pointsToAdd: z.number().int().positive(),
});

export async function POST(
    request: Request,
    { params }: { params: { customerId: string } }
) {
    const customerId = params.customerId;
    
    if (!customerId) {
        return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }
    
    let requestBody: any;
    try {
        requestBody = await request.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const validation = AddPointsRequestSchema.safeParse(requestBody);
    if (!validation.success) {
        return NextResponse.json({ error: "Invalid input", details: validation.error.flatten() }, { status: 400 });
    }

    try {
        const result = await addPoints({
            customerId,
            pointsToAdd: validation.data.pointsToAdd
        });
        
        if (!result.success) {
            return NextResponse.json({ message: result.message }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error adding points:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
