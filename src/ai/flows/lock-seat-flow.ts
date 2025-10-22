'use server';
/**
 * @fileOverview A flow for locking bus seats.
 *
 * - lockSeats - A function that locks seats for a given bus, customer, and date.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBusRoutes } from '@/lib/mock-data';
import { addLock, getLockBySeat, clearExpiredLocks } from '@/lib/seat-lock-store';

const LockSeatsInputSchema = z.object({
  busId: z.string().describe('The ID of the bus route.'),
  seatNumbers: z.array(z.string()).describe('The array of seat numbers to lock.'),
  customerId: z.string().describe('The ID of the customer.'),
});
type LockSeatsInput = z.infer<typeof LockSeatsInputSchema>;

const LockSeatsOutputSchema = z.object({
  success: z.boolean().describe('Whether the lock operation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
  lockId: z.string().optional().describe('The ID of the lock created.'),
  expiresAt: z.number().optional().describe('The timestamp when the lock expires.'),
  error: z.string().optional().describe('An error message if the operation failed.'),
});
type LockSeatsOutput = z.infer<typeof LockSeatsOutputSchema>;


export async function lockSeats(input: LockSeatsInput): Promise<LockSeatsOutput> {
  return lockSeatsFlow(input);
}


const lockSeatsFlow = ai.defineFlow(
  {
    name: 'lockSeatsFlow',
    inputSchema: LockSeatsInputSchema,
    outputSchema: LockSeatsOutputSchema,
  },
  async ({ busId, seatNumbers, customerId }) => {
    // Clear any expired locks before attempting a new one
    clearExpiredLocks();
    
    const route = mockBusRoutes.find(r => r.id === busId);
    
    if (!route) {
        return { success: false, message: 'Bus route not found.', error: 'Invalid busId.' };
    }
    
    // Check against permanently booked seats
    const alreadyBooked = seatNumbers.filter(seat => route.seatLayout.booked.includes(seat));
    if (alreadyBooked.length > 0) {
        return {
            success: false,
            message: `The following seats are already booked: ${alreadyBooked.join(', ')}.`,
            error: 'Seats already booked.'
        };
    }
    
    // Check against temporarily locked seats
    for (const seat of seatNumbers) {
        const existingLock = getLockBySeat(busId, seat);
        if (existingLock) {
            return {
                success: false,
                message: `Seat ${seat} is temporarily held by another user. Please try again in a moment.`,
                error: 'Seat temporarily locked.'
            }
        }
    }

    const { lockId, expiresAt } = addLock({ busId, seatNumbers, customerId });
    
    return {
      success: true,
      message: 'Seats successfully locked for 5 minutes.',
      lockId,
      expiresAt
    };
  }
);
