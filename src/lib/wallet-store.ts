/**
 * @fileoverview In-memory store for managing customer wallets.
 * This is a simplified, non-persistent store for demonstration purposes.
 * In a real-world application, this would be replaced by a database like Firestore.
 */
import type { Wallet } from "./types";

// Use a Map to store wallets. Key: customerId, Value: Wallet
const wallets = new Map<string, Wallet>();

/**
 * Gets or creates a wallet for a customer.
 * @param customerId The ID of the customer.
 * @returns The customer's wallet.
 */
export function getOrCreateWallet(customerId: string): Wallet {
    if (!wallets.has(customerId)) {
        wallets.set(customerId, {
            customerId,
            balance: 0,
            rewardPoints: 0,
        });
    }
    return wallets.get(customerId)!;
}

/**
 * Adds reward points to a customer's wallet.
 * @param customerId The ID of the customer.
 * @param pointsToAdd The number of points to add.
 * @returns The updated wallet.
 */
export function addRewardPoints(customerId: string, pointsToAdd: number): Wallet {
    const wallet = getOrCreateWallet(customerId);
    wallet.rewardPoints += pointsToAdd;
    return wallet;
}

/**
 * Redeems reward points for wallet balance.
 * @param customerId The ID of the customer.
 * @returns The updated wallet and a status message.
 */
export function redeemPoints(customerId: string): { wallet: Wallet; success: boolean; message: string; } {
    const wallet = getOrCreateWallet(customerId);
    if (wallet.rewardPoints >= 100) {
        wallet.rewardPoints -= 100;
        wallet.balance += 100;
        return { wallet, success: true, message: '100 points redeemed for 100 Taka.' };
    } else {
        return { wallet, success: false, message: 'Not enough points to redeem.' };
    }
}
