'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ConversationPreview } from '../hooks/useConversations';

interface ConversationListProps {
  conversations: ConversationPreview[];
  activeId: string | null;
  onSelect: (conversation: ConversationPreview) => void;
  onNewConversation: () => void;
  loading: boolean;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'INSTRUCTOR': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  }
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  loading,
}: ConversationListProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const name = (c.otherUser.name || c.otherUser.email).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('messaging.messages')}</h2>
          <button
            onClick={onNewConversation}
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
            aria-label={t('messaging.newMessage')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('messaging.searchConversations')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('messaging.noConversations')}</p>
            <button
              onClick={onNewConversation}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              {t('messaging.startConversation')}
            </button>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-dark-border transition hover:bg-gray-50 dark:hover:bg-dark-hover ${
                activeId === conv.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                {conv.otherUser.avatarUrl ? (
                  <img
                    src={conv.otherUser.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {getInitials(conv.otherUser.name, conv.otherUser.email)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {conv.otherUser.name || conv.otherUser.email}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(conv.otherUser.role)}`}>
                        {conv.otherUser.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessage?.createdAt ?? conv.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.content || t('messaging.noMessagesYet')}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
