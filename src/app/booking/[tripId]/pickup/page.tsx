'use client';
import { useRouter } from 'next/navigation';

export default function PickupPage() {
    const router = useRouter();
    if (typeof window !== 'undefined') {
        router.replace('/');
    }
    return null;
}