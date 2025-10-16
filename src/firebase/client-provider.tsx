'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { PropsWithChildren, useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';

export default function FirebaseClientProvider({
  children,
}: PropsWithChildren) {
  const [
    {
      app,
      auth,
      db,
    },
    setFirebase,
  ] = useState<{
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
  }>({ app: null, auth: null, db: null });
  useEffect(() => {
    const { app, auth, db } = initializeFirebase();
    setFirebase({ app, auth, db });
  }, []);
  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}
