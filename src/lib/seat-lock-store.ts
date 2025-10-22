/**
 * @fileoverview In-memory store for managing temporary seat locks.
 * This is a simplified, non-persistent store for demonstration purposes.
 * In a real-world application, this would be replaced by a distributed cache like Redis.
 */
import type { SeatLock } from "./types";
import { randomUUID } from 'crypto';

// Use a Map to store locks. Key: lockId, Value: SeatLock
const seatLocks = new Map<string, SeatLock>();

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Removes any locks that have expired.
 */
export function clearExpiredLocks() {
    const now = Date.now();
    for (const [lockId, lock] of seatLocks.entries()) {
        if (lock.expiresAt < now) {
            seatLocks.delete(lockId);
        }
    }
}

/**
 * Adds a new lock for a set of seats.
 * @param {Omit<SeatLock, 'lockId' | 'expiresAt'>} lockInfo - Information about the lock to create.
 * @returns {Pick<SeatLock, 'lockId' | 'expiresAt'>} The ID and expiry of the created lock.
 */
export function addLock(lockInfo: Omit<SeatLock, 'lockId' | 'expiresAt'>): Pick<SeatLock, 'lockId' | 'expiresAt'> {
    const lockId = randomUUID();
    const expiresAt = Date.now() + LOCK_DURATION_MS;

    const newLock: SeatLock = {
        ...lockInfo,
        lockId,
        expiresAt,
    };
    seatLocks.set(lockId, newLock);
    return { lockId, expiresAt };
}

/**
 * Retrieves a lock by its ID.
 * @param {string} lockId - The ID of the lock to retrieve.
 * @returns {SeatLock | undefined} The lock object or undefined if not found.
 */
export function getLock(lockId: string): SeatLock | undefined {
    clearExpiredLocks();
    return seatLocks.get(lockId);
}

/**
 * Retrieves all active (non-expired) locks.
 * @returns {SeatLock[]} An array of all active locks.
 */
export function getAllLocks(): SeatLock[] {
    clearExpiredLocks();
    return Array.from(seatLocks.values());
}


/**
 * Finds if a specific seat on a specific bus is currently locked.
 * @param busId The ID of the bus.
 * @param seatNumber The seat number to check.
 * @returns The lock object if the seat is locked, otherwise undefined.
 */
export function getLockBySeat(busId: string, seatNumber: string): SeatLock | undefined {
    clearExpiredLocks();
    for (const lock of seatLocks.values()) {
        if (lock.busId === busId && lock.seatNumbers.includes(seatNumber)) {
            return lock;
        }
    }
    return undefined;
}


/**
 * Removes a lock by its ID.
 * @param {string} lockId - The ID of the lock to remove.
 */
export function removeLock(lockId: string): void {
    seatLocks.delete(lockId);
}
