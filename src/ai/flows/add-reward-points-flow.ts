'use server';
/**
 * @fileOverview A flow for adding reward points to a customer's wallet.
 *
 * - addPoints - A function to add a specified number of points.
 * - AddPointsInput - The input type for the addPoints function.
 * - AddPointsOutput - The output type for the addPoints function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { addRewardPoints, getOrCreateWallet } from '@/lib/wallet-store';

const AddPointsInputSchema = z.object({
    customerId: z.string().describe("The ID of the customer, usually their mobile number."),
    pointsToAdd: z.number().int().positive().describe("The number of points to add."),
});
export type AddPointsInput = z.infer<typeof AddPointsInputSchema>;

const WalletSchema = z.object({
    customerId: z.string(),
    balance: z.number(),
    rewardPoints: z.number(),
});

const AddPointsOutputSchema = z.object({
    wallet: WalletSchema,
    success: z.boolean(),
    message: z.string(),
});
export type AddPointsOutput = z.infer<typeof AddPointsOutputSchema>;

export async function addPoints(input: AddPointsInput): Promise<AddPointsOutput> {
    return addPointsFlow(input);
}

const addPointsFlow = ai.defineFlow(
  {
    name: 'addPointsFlow',
    inputSchema: AddPointsInputSchema,
    outputSchema: AddPointsOutputSchema,
  },
  async ({ customerId, pointsToAdd }) => {
    try {
      const updatedWallet = addRewardPoints(customerId, pointsToAdd);
      return {
        wallet: updatedWallet,
        success: true,
        message: `${pointsToAdd} points added successfully.`,
      };
    } catch (error) {
      const wallet = getOrCreateWallet(customerId); // Return current wallet state on error
      return {
        wallet,
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred.',
      };
    }
  }
);
