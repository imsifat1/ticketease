'use server';
/**
 * @fileOverview A flow for retrieving mock booking data.
 *
 * - getBookings - A function that returns a list of all bookings.
 * - GetBookingsOutput - The output type for the getBookings function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBookings } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';

const BookingSchema = z.object({
    pnr: z.string(),
    status: z.string(), // Assuming BookingStatus is a string union
    route: z.any(), // Keeping route as 'any' for simplicity, can be defined if needed
    departureDate: z.string(),
    pickupPoint: z.string(),
    selectedSeats: z.array(z.string()),
    totalAmount: z.number(),
    contactName: z.string(),
    contactMobile: z.string(),
});

const GetBookingsOutputSchema = z.array(BookingSchema);
export type GetBookingsOutput = z.infer<typeof GetBookingsOutputSchema>;

export async function getBookings(): Promise<GetBookingsOutput> {
    return getBookingsFlow();
}

const getBookingsFlow = ai.defineFlow(
  {
    name: 'getBookingsFlow',
    inputSchema: z.void(),
    outputSchema: GetBookingsOutputSchema,
  },
  async () => {
    // In a real application, you might fetch this based on a logged-in user ID.
    return mockBookings;
  }
);
