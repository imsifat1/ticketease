'use server';
/**
 * @fileOverview A flow for redeeming customer reward points.
 *
 * - redeemRewardPoints - A function to redeem 100 points for 100 Taka.
 * - RedeemPointsInput - The input type for the redeemRewardPoints function.
 * - RedeemPointsOutput - The output type for the redeemRewardPoints function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { redeemPoints } from '@/lib/wallet-store';

const RedeemPointsInputSchema = z.object({
    customerId: z.string().describe("The ID of the customer, usually their mobile number."),
});
export type RedeemPointsInput = z.infer<typeof RedeemPointsInputSchema>;


const WalletSchema = z.object({
    customerId: z.string(),
    balance: z.number(),
    rewardPoints: z.number(),
});

const RedeemPointsOutputSchema = z.object({
    wallet: WalletSchema,
    success: z.boolean(),
    message: z.string(),
});
export type RedeemPointsOutput = z.infer<typeof RedeemPointsOutputSchema>;

export async function redeemRewardPoints(input: RedeemPointsInput): Promise<RedeemPointsOutput> {
    return redeemPointsFlow(input);
}

const redeemPointsFlow = ai.defineFlow(
  {
    name: 'redeemPointsFlow',
    inputSchema: RedeemPointsInputSchema,
    outputSchema: RedeemPointsOutputSchema,
  },
  async ({ customerId }) => {
    return redeemPoints(customerId);
  }
);
