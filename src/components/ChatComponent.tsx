'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        'Hello! I\'m the Dorm RA ChatBot. I can help you with questions about dorm policies, community guidelines, and residential life. Upload a PDF with community guides to get started!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSources, setShowSources] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {message.sources && message.sources.length > 0 && (
                <button
                  onClick={() =>
                    setShowSources(
                      showSources === message.id ? null : message.id
                    )
                  }
                  className={`text-xs mt-2 underline ${message.role === 'user' ? 'text-indigo-100' : 'text-indigo-600'}`}
                >
                  {showSources === message.id ? 'Hide' : 'Show'} sources (
                  {message.sources.length})
                </button>
              )}

              {showSources === message.id && message.sources && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                  {message.sources.map((source, idx) => (
                    <div
                      key={idx}
                      className={`mt-1 ${message.role === 'user' ? 'text-indigo-100' : 'text-gray-600'}`}
                    >
                      📄 {source}
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`text-xs mt-2 block ${
                  message.role === 'user'
                    ? 'text-indigo-200'
                    : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md px-4 py-3 rounded-lg rounded-bl-none flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question about dorm policies..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
