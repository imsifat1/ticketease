import { getSeatLayout } from "@/ai/flows/get-seat-layout-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Defaults to auto
export async function GET(
    request: Request,
    { params }: { params: { routeId: string } }
) {
    const routeId = params.routeId;
    if (!routeId) {
        return NextResponse.json({ error: "routeId is required" }, { status: 400 });
    }

    try {
        const seatLayout = await getSeatLayout({ routeId });

        if (!seatLayout) {
            return NextResponse.json({ error: "Route not found" }, { status: 404 });
        }

        return NextResponse.json(seatLayout);

    } catch (error) {
        console.error("Error fetching seat layout:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
