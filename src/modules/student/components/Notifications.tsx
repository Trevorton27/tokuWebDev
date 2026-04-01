'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'new_message': return '💬';
    case 'feedback': return '📝';
    case 'announcement': return '📢';
    default: return '🔔';
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await axios.patch('/api/messages/notifications', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.notifications')}</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          href="/student/messages"
          className="text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium"
        >
          {t('student.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.slice(0, 5).map((notification) => (
            <Link
              key={notification.id}
              href={notification.link}
              className={`block rounded-lg p-3 border transition-all ${notification.read
                  ? 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`text-sm font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                      }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-1.5 ml-2"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('student.noNotifications')}</p>
        </div>
      )}

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={handleMarkAllRead}
            className="w-full text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium text-center"
          >
            {t('student.markAllRead')}
          </button>
        </div>
      )}
    </div>
  );
}
