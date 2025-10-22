'use server';
/**
 * @fileOverview A flow for locking bus seats.
 *
 * - lockSeats - A function that locks seats for a given bus, customer, and date.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBusRoutes } from '@/lib/mock-data';

const LockSeatsInputSchema = z.object({
  busId: z.string().describe('The ID of the bus route.'),
  seatNumbers: z.array(z.string()).describe('The array of seat numbers to lock.'),
  customerId: z.string().describe('The ID of the customer.'),
  date: z.string().describe('The date of the journey in YYYY-MM-DD format.'),
});
type LockSeatsInput = z.infer<typeof LockSeatsInputSchema>;

const LockSeatsOutputSchema = z.object({
  success: z.boolean().describe('Whether the lock operation was successful.'),
  message: z.string().describe('A message detailing the result of the operation.'),
  lockedSeats: z.array(z.string()).optional().describe('The seats that were successfully locked.'),
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
  async ({ busId, seatNumbers, customerId, date }) => {
    const route = mockBusRoutes.find(r => r.id === busId);
    
    if (!route) {
        return { success: false, message: 'Bus route not found.', error: 'Invalid busId.' };
    }
    
    const alreadyBooked = seatNumbers.filter(seat => route.seatLayout.booked.includes(seat));
    if (alreadyBooked.length > 0) {
        return {
            success: false,
            message: `The following seats are already booked: ${alreadyBooked.join(', ')}.`,
            error: 'Seats already booked.'
        };
    }
    
    // In a real application, you would lock the seats in a database with an expiry time.
    // For this demo, we'll just simulate a successful lock.
    return {
      success: true,
      message: 'Seats successfully locked for 5 minutes.',
      lockedSeats: seatNumbers,
    };
  }
);
