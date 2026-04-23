'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useMessages } from '../hooks/useMessages';
import { ConversationPreview } from '../hooks/useConversations';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ConversationViewProps {
  conversation: ConversationPreview | null;
  currentUserId: string | null;
  onBack?: () => void;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function ConversationView({ conversation, currentUserId, onBack }: ConversationViewProps) {
  const { t } = useLanguage();
  const { messages, loading, sendMessage, markRead, hasMore, loadMore } = useMessages(conversation?.id ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markRead();
    }
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && !loading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loading]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-surface">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('messaging.selectConversation')}</p>
        </div>
      </div>
    );
  }

  const other = conversation.otherUser;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-card">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-dark-border">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {other.avatarUrl ? (
          <img src={other.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {getInitials(other.name, other.email)}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {other.name || other.email}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">
            {other.role.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <button
                  onClick={loadMore}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  {t('messaging.loadEarlier')}
                </button>
              </div>
            )}
            {/* Messages are in desc order from API, reverse for display */}
            {[...messages].reverse().map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
              />
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('messaging.noMessagesYet')}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
