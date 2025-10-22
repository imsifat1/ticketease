import { getBookings } from "@/ai/flows/get-bookings-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request
) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    try {
        const bookings = await getBookings({ status });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
