import { getCustomers } from "@/ai/flows/get-customers-flow";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const customers = await getCustomers();
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
