'use client';

import { useState } from 'react';
import assessmentClient from '@/lib/assessmentClient';
import type { ChatMessage, TutorResponse } from '@/lib/types';

interface TutorChatProps {
  challengeId: string;
  userCode?: string;
}

export default function TutorChat({ challengeId, userCode }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<TutorResponse['sources']>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await assessmentClient.chatWithTutor(
        challengeId,
        [...messages, userMessage],
        userCode
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSources(response.sources);
    } catch (err) {
      console.error('Failed to get tutor response:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">AI Tutor</h3>

      <div className="h-96 overflow-y-auto mb-4 space-y-3 border rounded-lg p-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            Ask me anything about this challenge!
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-100 ml-auto max-w-[80%]'
                  : 'bg-white border max-w-[80%]'
              }`}
            >
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        {loading && (
          <div className="p-3 rounded-lg bg-white border max-w-[80%]">
            <p className="text-sm text-gray-500">Thinking...</p>
          </div>
        )}
      </div>

      {sources.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Sources:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {sources.map((source, index) => (
              <li key={index}>
                {source.url ? (
                  <a href={source.url} className="hover:underline" target="_blank" rel="noopener">
                    {source.title}
                  </a>
                ) : (
                  <span>{source.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
