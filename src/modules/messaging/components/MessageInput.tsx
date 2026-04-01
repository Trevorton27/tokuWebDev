'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-4">
      <div className="flex items-end space-x-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={t('messaging.typeMessage')}
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          className="flex-shrink-0 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl p-2.5 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('messaging.send')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">
        {t('messaging.enterToSend')}
      </p>
    </div>
  );
}
