'use server';
/**
 * @fileOverview A flow for retrieving a customer's wallet information.
 *
 * - getWallet - A function that returns wallet balance and reward points.
 * - GetWalletInput - The input type for the getWallet function.
 * - GetWalletOutput - The output type for the getWallet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getOrCreateWallet } from '@/lib/wallet-store';

const GetWalletInputSchema = z.object({
    customerId: z.string().describe("The ID of the customer, usually their mobile number."),
});
export type GetWalletInput = z.infer<typeof GetWalletInputSchema>;

const WalletSchema = z.object({
    customerId: z.string(),
    balance: z.number(),
    rewardPoints: z.number(),
});

const GetWalletOutputSchema = WalletSchema;
export type GetWalletOutput = z.infer<typeof GetWalletOutputSchema>;

export async function getWallet(input: GetWalletInput): Promise<GetWalletOutput> {
    return getWalletFlow(input);
}

const getWalletFlow = ai.defineFlow(
  {
    name: 'getWalletFlow',
    inputSchema: GetWalletInputSchema,
    outputSchema: GetWalletOutputSchema,
  },
  async ({ customerId }) => {
    return getOrCreateWallet(customerId);
  }
);
