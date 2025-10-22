import { getBookings } from "@/ai/flows/get-bookings-flow";
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
        const bookings = await getBookings({ customerId });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
