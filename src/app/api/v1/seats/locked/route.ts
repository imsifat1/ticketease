import { getAllLockedSeats } from "@/ai/flows/get-all-locked-seats-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const lockedSeats = await getAllLockedSeats();
        return NextResponse.json(lockedSeats);
    } catch (error) {
        console.error("Error fetching locked seats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
