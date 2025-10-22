'use server';
/**
 * @fileOverview A flow for retrieving all currently locked seats.
 *
 * - getAllLockedSeats - A function that returns a list of all active seat locks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAllLocks } from '@/lib/seat-lock-store';

const SeatLockSchema = z.object({
    lockId: z.string(),
    busId: z.string(),
    seatNumbers: z.array(z.string()),
    customerId: z.string(),
    expiresAt: z.number(),
});

const GetAllLockedSeatsOutputSchema = z.array(SeatLockSchema);
export type GetAllLockedSeatsOutput = z.infer<typeof GetAllLockedSeatsOutputSchema>;

export async function getAllLockedSeats(): Promise<GetAllLockedSeatsOutput> {
  return getAllLockedSeatsFlow();
}

const getAllLockedSeatsFlow = ai.defineFlow(
  {
    name: 'getAllLockedSeatsFlow',
    inputSchema: z.void(),
    outputSchema: GetAllLockedSeatsOutputSchema,
  },
  async () => {
    return getAllLocks();
  }
);
