
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // We don't want to redirect from the login page itself
    if (pathname === '/admin/login') return;

    if (isClient && !loading && !admin) {
      router.replace('/admin/login');
    }
  }, [admin, loading, router, isClient, pathname]);

  // If we are on the login page, we let it handle its own loading/redirect logic
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isClient || loading || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
