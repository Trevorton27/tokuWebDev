'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import axios from 'axios';
import MessagingPage from '@/modules/messaging/components/MessagingPage';

export default function AdminMessagesPage() {
  const { user, isLoaded } = useUser();
  const { t } = useLanguage();
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    axios.get('/api/auth/me').then((res) => {
      if (res.data.success) {
        setDbUserId(res.data.user.id);
      }
    }).finally(() => setLoading(false));
  }, [isLoaded, user]);

  if (!isLoaded || loading || !dbUserId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('messaging.messages')}</h1>
      <MessagingPage currentUserId={dbUserId} />
    </div>
  );
}
