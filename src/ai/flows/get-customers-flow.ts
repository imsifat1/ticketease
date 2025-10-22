'use server';
/**
 * @fileOverview A flow for retrieving a unique list of all customers from bookings.
 *
 * - getCustomers - A function that returns a list of all unique customers.
 * - GetCustomersOutput - The output type for the getCustomers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockBookings } from '@/lib/mock-data';

const CustomerSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
});

const GetCustomersOutputSchema = z.array(CustomerSchema);
export type GetCustomersOutput = z.infer<typeof GetCustomersOutputSchema>;

export async function getCustomers(): Promise<GetCustomersOutput> {
  return getCustomersFlow();
}

const getCustomersFlow = ai.defineFlow(
  {
    name: 'getCustomersFlow',
    inputSchema: z.void(),
    outputSchema: GetCustomersOutputSchema,
  },
  async () => {
    const customerMap = new Map<string, string>();

    mockBookings.forEach(booking => {
      if (!customerMap.has(booking.customerId)) {
        customerMap.set(booking.customerId, booking.contactName);
      }
    });

    const uniqueCustomers = Array.from(customerMap.entries()).map(([id, name]) => ({
      customerId: id,
      customerName: name,
    }));

    return uniqueCustomers;
  }
);
