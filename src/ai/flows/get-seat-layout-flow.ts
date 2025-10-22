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
  async ({ routeId }) => {
    const route = mockBusRoutes.find(r => r.id === routeId);

    if (!route) {
      return null;
    }

    return route.seatLayout;
  }
);
