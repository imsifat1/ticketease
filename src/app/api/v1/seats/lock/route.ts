import { lockSeats, LockSeatsInputSchema } from "@/ai/flows/lock-seat-flow";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    let requestBody: any;
    try {
        requestBody = await request.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const validation = LockSeatsInputSchema.safeParse(requestBody);

    if (!validation.success) {
        return NextResponse.json({ error: "Invalid input", details: validation.error.flatten() }, { status: 400 });
    }

    try {
        const result = await lockSeats(validation.data);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 409 }); // 409 Conflict is suitable for "already booked"
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error locking seats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
