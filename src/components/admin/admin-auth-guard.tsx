'use client';

import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to home page
        router.replace('/');
        return;
      }

      // Check if user is admin (email ends with @tumblebunnies.com)
      if (!user.email || !user.email.endsWith('@tumblebunnies.com')) {
        // Not an admin, redirect to home page
        router.replace('/');
        return;
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
} 