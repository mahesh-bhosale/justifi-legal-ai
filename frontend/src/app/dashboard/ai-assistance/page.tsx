'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getToken } from '@/lib/auth';

// Using inline SVG icons instead of lucide-react for better compatibility
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
import { API_BASE_URL } from '@/lib/api';
const API_URL = API_BASE_URL;

interface ChatMessage {
  id: string;
  message: string;
  reply: string;
  timestamp: Date;
}

export default function AIAssistancePage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken(); // Get the token first
      const response = await fetch(`${API_URL}/api/ai/chat/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: userMessage,
        reply: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Legal Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Get instant answers to your legal questions with our AI-powered assistant.
        </p>
      </div>

      <Card className="h-[650px] flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 shadow-xl">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Bot className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            Chat with AI Assistant
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Ask any legal question and get instant, accurate responses based on legal principles.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-white dark:bg-gray-900">
          {/* Messages Area - Fixed height with proper scrolling */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="max-w-md px-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Bot className="h-10 w-10 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Type a legal question below to start a conversation. I can help with contract terms, legal definitions, or general procedures.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-2 text-left">
                    {['What are the key elements of an NDA?', 'Explain what force majeure means.', 'How to draft a simple service agreement?'].map((suggestion) => (
                      <button 
                        key={suggestion}
                        onClick={() => setMessage(suggestion)}
                        className="text-sm px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors text-left"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-yellow-600 dark:bg-yellow-500 text-white dark:text-gray-900 rounded-2xl rounded-tr-none p-4 shadow-md max-w-[85%]">
                      <div className="flex items-center gap-2 mb-2 opacity-90">
                        <User className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">You</span>
                      </div>
                      <p className="text-sm md:text-base break-words leading-relaxed font-medium">{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-700 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-yellow-600 dark:bg-yellow-500 p-1 rounded-md">
                          <Bot className="h-3.5 w-3.5 text-white dark:text-gray-900" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">AI Assistant</span>
                      </div>
                      <div className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {msg.reply}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-600 dark:bg-yellow-500 p-1 rounded-md">
                      <Bot className="h-3.5 w-3.5 text-white dark:text-gray-900" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">AI Assistant</span>
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-500 ml-2" />
                  </div>
                  <p className="text-sm mt-2 text-gray-500 dark:text-gray-400 italic font-medium">Analysing and generating response...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-2">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 lg:p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your legal question here..."
                disabled={isLoading}
                className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 min-h-[50px] shadow-sm focus:ring-yellow-500 transition-all dark:text-white"
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-6 h-[50px] rounded-xl shadow-lg shadow-yellow-500/10"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold">Send</span>
                  <Send className="h-5 w-5" />
                </div>
              )}
            </Button>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-3 text-center uppercase tracking-widest font-semibold">
            AI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </Card>
    </div>
  );
}