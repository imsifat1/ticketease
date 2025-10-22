'use server';
/**
 * @fileOverview A flow for retrieving mock booking data for a specific customer.
 *
 * - getBookings - A function that returns a list of bookings for a given customer ID.
 * - GetBookingsInput - The input type for the getBookings function.
 * - GetBookingsOutput - The output type for the getBookings function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBookings } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';

const GetBookingsInputSchema = z.object({
    customerId: z.string().describe("The ID of the customer, usually their mobile number."),
});
export type GetBookingsInput = z.infer<typeof GetBookingsInputSchema>;


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

const GetBookingsOutputSchema = z.array(BookingSchema);
export type GetBookingsOutput = z.infer<typeof GetBookingsOutputSchema>;

export async function getBookings(input: GetBookingsInput): Promise<GetBookingsOutput> {
    return getBookingsFlow(input);
}

const getBookingsFlow = ai.defineFlow(
  {
    name: 'getBookingsFlow',
    inputSchema: GetBookingsInputSchema,
    outputSchema: GetBookingsOutputSchema,
  },
  async ({ customerId }) => {
    // Filter bookings for the given customerId
    return mockBookings.filter(booking => booking.customerId === customerId);
  }
);
