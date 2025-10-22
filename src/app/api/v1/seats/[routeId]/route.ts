import { getSeatLayout } from "@/ai/flows/get-seat-layout-flow";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic'; 

export async function GET(
    request: Request,
    { params }: { params: { routeId: string } }
) {
    const routeId = params.routeId;
    if (!routeId) {
        return NextResponse.json({ error: "routeId is required" }, { status: 400 });
    }

    // This is a workaround to simulate session/state in a stateless API context for this demo.
    // In a real app, this lock info would come from a database or a distributed cache like Redis.
    const headersList = headers();
    const lockedSeatsHeader = headersList.get("X-Locked-Seats");
    const lockedRouteIdHeader = headersList.get("X-Locked-Route-Id");
    
    const lockedSeats = lockedSeatsHeader ? JSON.parse(lockedSeatsHeader) : undefined;
    const currentRouteId = lockedRouteIdHeader || undefined;

    try {
        const seatLayout = await getSeatLayout({ routeId, lockedSeats, currentRouteId });

        if (!seatLayout) {
            return NextResponse.json({ error: "Route not found" }, { status: 404 });
        }

        return NextResponse.json(seatLayout);

    } catch (error) {
        console.error("Error fetching seat layout:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
