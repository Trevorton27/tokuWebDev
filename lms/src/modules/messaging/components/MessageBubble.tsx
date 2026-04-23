'use client';

import { MessageItem } from '../hooks/useMessages';

interface MessageBubbleProps {
  message: MessageItem;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-dark-surface text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            {message.sender.name || message.sender.email}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {message.attachmentUrl && (
          <div className="mt-2">
            {message.attachmentType?.startsWith('image/') ? (
              <img
                src={message.attachmentUrl}
                alt={message.attachmentName || 'attachment'}
                className="max-w-full rounded-lg max-h-60 object-cover"
              />
            ) : (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 text-xs underline ${
                  isOwn ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>{message.attachmentName || 'Download file'}</span>
              </a>
            )}
          </div>
        )}

        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOwn ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
        }`}>
          <span className="text-[10px]">{time}</span>
          {isOwn && message.readAt && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
