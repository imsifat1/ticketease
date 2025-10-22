import { getTicketByPnr } from "@/ai/flows/get-ticket-by-pnr-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { pnr: string } }
) {
    const pnr = params.pnr;
    
    if (!pnr) {
        return NextResponse.json({ error: "PNR is required" }, { status: 400 });
    }

    try {
        const booking = await getTicketByPnr({ pnr });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }
        return NextResponse.json(booking);
    } catch (error) {
        console.error(`Error fetching booking for PNR ${pnr}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
