'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';

const FirebaseContext = createContext<{
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} | null>(null);

export function FirebaseProvider({
  children,
  app,
  auth,
  db,
}: PropsWithChildren & {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}) {
  const contextValue = useMemo(
    () => ({
      app,
      auth,
      db,
    }),
    [app, auth, db]
  );
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
};
export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
};
export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.db;
};
