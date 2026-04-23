'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useContacts } from '../hooks/useContacts';
import { ConversationUser } from '../hooks/useConversations';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ConversationUser) => void;
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

export default function NewConversationModal({ isOpen, onClose, onSelectUser }: NewConversationModalProps) {
  const { t } = useLanguage();
  const { contacts, loading } = useContacts();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = contacts.filter((c) => {
    const text = `${c.name || ''} ${c.email} ${c.role}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Group by role
  const grouped = filtered.reduce<Record<string, ConversationUser[]>>((acc, contact) => {
    const role = contact.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(contact);
    return acc;
  }, {});

  const roleOrder = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('messaging.newMessage')}</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('messaging.searchContacts')}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('messaging.noContacts')}</p>
            </div>
          ) : (
            roleOrder.map((role) => {
              const users = grouped[role];
              if (!users || users.length === 0) return null;
              return (
                <div key={role} className="mb-2">
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-1">
                    {role === 'ADMIN' ? t('messaging.admins') : role === 'INSTRUCTOR' ? t('messaging.instructors') : t('messaging.students')}
                  </p>
                  {users.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => onSelectUser(contact)}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition text-left"
                    >
                      {contact.avatarUrl ? (
                        <img src={contact.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {getInitials(contact.name, contact.email)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {contact.name || contact.email}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{contact.email}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(contact.role)}`}>
                        {contact.role}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
