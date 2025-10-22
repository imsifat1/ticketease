'use server';
/**
 * @fileOverview A flow for retrieving a single booking by its PNR.
 *
 * - getTicketByPnr - A function that returns a booking for a given PNR.
 * - GetTicketByPnrInput - The input type for the getTicketByPnr function.
 * - GetTicketByPnrOutput - The output type for the getTicketByPnr function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBookings } from '@/lib/mock-data';

const GetTicketByPnrInputSchema = z.object({
    pnr: z.string().describe("The PNR (ticket number) of the booking."),
});
export type GetTicketByPnrInput = z.infer<typeof GetTicketByPnrInputSchema>;

const BookingSchema = z.object({
    pnr: z.string(),
    status: z.string(),
    route: z.any(),
    departureDate: z.string(),
    pickupPoint: z.string(),
    selectedSeats: z.array(z.string()),
    totalAmount: z.number(),
    contactName: z.string(),
    contactMobile: z.string(),
    customerId: z.string(),
});

const GetTicketByPnrOutputSchema = BookingSchema.nullable();
export type GetTicketByPnrOutput = z.infer<typeof GetTicketByPnrOutputSchema>;


export async function getTicketByPnr(input: GetTicketByPnrInput): Promise<GetTicketByPnrOutput> {
    return getTicketByPnrFlow(input);
}


const getTicketByPnrFlow = ai.defineFlow(
  {
    name: 'getTicketByPnrFlow',
    inputSchema: GetTicketByPnrInputSchema,
    outputSchema: GetTicketByPnrOutputSchema,
  },
  async ({ pnr }) => {
    const booking = mockBookings.find(b => b.pnr.toLowerCase() === pnr.toLowerCase());
    return booking || null;
  }
);
