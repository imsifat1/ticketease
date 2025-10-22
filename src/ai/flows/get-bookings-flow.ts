'use server';
/**
 * @fileOverview A flow for retrieving mock booking data. It can filter by customer and/or status.
 *
 * - getBookings - A function that returns a list of bookings.
 * - GetBookingsInput - The input type for the getBookings function.
 * - GetBookingsOutput - The output type for the getBookings function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBookings } from '@/lib/mock-data';
import type { Booking, BookingStatus } from '@/lib/types';

const GetBookingsInputSchema = z.object({
    customerId: z.string().optional().describe("The ID of the customer, usually their mobile number."),
    status: z.string().optional().describe("The booking status to filter by (e.g., 'Paid', 'Booked', 'upcoming', 'all')."),
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
  async ({ customerId, status }) => {
    let filteredBookings = mockBookings;

    if (customerId) {
        filteredBookings = filteredBookings.filter(booking => booking.customerId === customerId);
    }

    if (status && status.toLowerCase() !== 'all') {
        if (status.toLowerCase() === 'upcoming') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to the beginning of today
            filteredBookings = filteredBookings.filter(booking => {
                const departureDate = new Date(booking.departureDate);
                return departureDate >= today;
            });
        } else {
            filteredBookings = filteredBookings.filter(booking => booking.status.toLowerCase() === status.toLowerCase());
        }
    }

    return filteredBookings;
  }
);
