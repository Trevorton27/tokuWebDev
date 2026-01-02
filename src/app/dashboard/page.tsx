'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToDashboard() {
      try {
        // Get current user from API which checks database role
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success || !data.user) {
          router.push('/sign-in');
          return;
        }

        // Redirect based on user role
        switch (data.user.role) {
          case 'ADMIN':
            router.push('/admin');
            break;
          case 'INSTRUCTOR':
            router.push('/instructor');
            break;
          case 'STUDENT':
            router.push('/student');
            break;
          default:
            router.push('/');
        }
      } catch (error) {
        console.error('Error redirecting to dashboard:', error);
        router.push('/');
      }
    }

    redirectToDashboard();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
