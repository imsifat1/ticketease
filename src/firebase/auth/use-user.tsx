
'use client';

import { useEffect, useState } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';

import { useAuth } from '@/firebase';

// A custom type to allow for our mock user object
type AuthUser = User | {
    uid: string;
    phoneNumber: string | null;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
} | null;

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check for demo user in localStorage first
    const demoUserString = localStorage.getItem('demo-user');
    if (demoUserString) {
        try {
            const demoUser = JSON.parse(demoUserString);
            setUser(demoUser);
            setLoading(false);
            // Don't return here, let firebase auth run as well to overwrite if needed
        } catch (e) {
            console.error("Failed to parse demo user from localStorage", e);
        }
    }


    if (!auth) {
      if (!demoUserString) setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If there's a firebase user, it overrides any demo user
      if (user) {
        localStorage.removeItem('demo-user');
        setUser(user);
      } else if (!localStorage.getItem('demo-user')) {
        // Only set to null if no demo user exists
        setUser(null);
      }
      setLoading(false);
    });
    
    const handleDemoUserUpdate = (event: CustomEvent) => {
        const { currentUser } = event.detail;
        if (currentUser) {
            localStorage.setItem('demo-user', JSON.stringify(currentUser));
            setUser(currentUser);
        } else {
            localStorage.removeItem('demo-user');
            // If firebase auth is not loaded yet, this might be overwritten
            // but onAuthStateChanged will correct it.
            if(!auth?.currentUser) {
              setUser(null);
            }
        }
        setLoading(false);
    };
    
    document.addEventListener('demo-user-update', handleDemoUserUpdate as EventListener);

    return () => {
        unsubscribe();
        document.removeEventListener('demo-user-update', handleDemoUserUpdate as EventListener);
    }
  }, [auth, isClient]);

  return { user, loading };
}
