import { getBookings } from "@/ai/flows/get-bookings-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const bookings = await getBookings();
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
