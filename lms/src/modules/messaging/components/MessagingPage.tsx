'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useConversations, ConversationPreview, ConversationUser } from '../hooks/useConversations';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import NewConversationModal from './NewConversationModal';

interface MessagingPageProps {
  currentUserId: string;
}

export default function MessagingPage({ currentUserId }: MessagingPageProps) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { conversations, loading, createConversation } = useConversations();
  const [activeConversation, setActiveConversation] = useState<ConversationPreview | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showList, setShowList] = useState(true);

  // Open conversation from URL param
  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === convId);
      if (found) {
        setActiveConversation(found);
        setShowList(false);
      }
    }
  }, [searchParams, conversations]);

  // Keep active conversation in sync with refreshed data
  useEffect(() => {
    if (activeConversation) {
      const updated = conversations.find((c) => c.id === activeConversation.id);
      if (updated) {
        setActiveConversation(updated);
      }
    }
  }, [conversations]);

  const handleSelectConversation = (conv: ConversationPreview) => {
    setActiveConversation(conv);
    setShowList(false);
  };

  const handleNewConversation = async (user: ConversationUser) => {
    setShowNewModal(false);
    try {
      const conv = await createConversation(user.id);
      // Find the conversation in the refreshed list or build a preview
      const preview: ConversationPreview = {
        id: conv.id,
        otherUser: user,
        lastMessage: null,
        unreadCount: 0,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
      setActiveConversation(preview);
      setShowList(false);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleBack = () => {
    setShowList(true);
    setActiveConversation(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Conversation List - hidden on mobile when viewing a conversation */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${!showList ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={handleSelectConversation}
          onNewConversation={() => setShowNewModal(true)}
          loading={loading}
        />
      </div>

      {/* Conversation View - hidden on mobile when viewing list */}
      <div className={`flex-1 ${showList ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ConversationView
          conversation={activeConversation}
          currentUserId={currentUserId}
          onBack={handleBack}
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSelectUser={handleNewConversation}
      />
    </div>
  );
}
