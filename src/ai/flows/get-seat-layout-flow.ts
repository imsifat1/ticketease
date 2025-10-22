'use server';
/**
 * @fileOverview A flow for retrieving seat layout information for a given bus route.
 *
 * - getSeatLayout - A function that returns the seat layout for a specific route.
 * - GetSeatLayoutInput - The input type for the getSeatLayout function.
 * - GetSeatLayoutOutput - The output type for the getSeatLayout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { mockBusRoutes } from '@/lib/mock-data';

const GetSeatLayoutInputSchema = z.object({
  routeId: z.string().describe('The ID of the bus route.'),
  lockedSeats: z.array(z.string()).optional().describe('An array of seat IDs that are temporarily locked in a session.'),
  currentRouteId: z.string().optional().describe('The route ID for which seats are locked.'),
});
export type GetSeatLayoutInput = z.infer<typeof GetSeatLayoutInputSchema>;

const GetSeatLayoutOutputSchema = z.object({
  rows: z.array(z.array(z.string())).describe('The 2D array representing seat rows.'),
  booked: z.array(z.string()).describe('An array of booked seat IDs.'),
}).nullable();
export type GetSeatLayoutOutput = z.infer<typeof GetSeatLayoutOutputSchema>;


export async function getSeatLayout(input: GetSeatLayoutInput): Promise<GetSeatLayoutOutput> {
    return getSeatLayoutFlow(input);
}


const getSeatLayoutFlow = ai.defineFlow(
  {
    name: 'getSeatLayoutFlow',
    inputSchema: GetSeatLayoutInputSchema,
    outputSchema: GetSeatLayoutOutputSchema,
  },
  async ({ routeId, lockedSeats, currentRouteId }) => {
    const route = mockBusRoutes.find(r => r.id === routeId);

    if (!route) {
      return null;
    }

    // Combine permanently booked seats with temporarily locked seats
    // only if the lock belongs to the current route
    const allBookedSeats = new Set(route.seatLayout.booked);
    if (lockedSeats && currentRouteId === routeId) {
        lockedSeats.forEach(seat => allBookedSeats.add(seat));
    }

    return {
        ...route.seatLayout,
        booked: Array.from(allBookedSeats)
    };
  }
);
