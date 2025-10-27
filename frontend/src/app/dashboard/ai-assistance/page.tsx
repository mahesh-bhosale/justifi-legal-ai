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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Legal Assistant</h1>
        <p className="text-gray-600 mt-2">
          Get instant answers to your legal questions with our AI-powered assistant.
        </p>
      </div>

      <Card className="h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="border-b flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with AI Assistant
          </CardTitle>
          <CardDescription>
            Ask any legal question and get instant, accurate responses.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages Area - Fixed height with proper scrolling */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Start a conversation by typing your legal question below.</p>
                  <p className="text-sm mt-2">The AI assistant is ready to help with your legal inquiries.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">You</span>
                      </div>
                      <p className="break-words">{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">AI Assistant</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.reply}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span className="text-sm font-medium">AI Assistant</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <p>Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Input Area - Fixed at bottom */}
          <div className="border-t p-4 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your legal question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}