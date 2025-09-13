'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CaseMessage, CreateMessageInput } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';

// Simple debounce implementation with proper TypeScript types
const debounce = <F extends (...args: unknown[]) => unknown>(
  fn: F,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: unknown, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
    return () => clearTimeout(timeoutId);
  };
};

// Use CaseMessage type directly since it already has all the required fields

interface CaseMessagesProps {
  messages: CaseMessage[];
  onSendMessage: (data: CreateMessageInput) => void;
  onMarkAsRead: (messageId: number) => void;
  currentUserId: string;
  otherParticipantId: string;
  isLoading?: boolean;
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date for display (e.g., "Today", "Yesterday", or "MMM D")
const formatMessageDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time part for date comparison
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  
  // For dates older than yesterday, show the full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


export function CaseMessages({
  messages,
  onSendMessage,
  onMarkAsRead,
  otherParticipantId,
  isLoading = false,
}: CaseMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior
      });
    }
  }, []);
  
  // Ensure we have a valid user ID
  const currentUserId = useMemo(() => {
    const id = user?.id ? String(user.id).trim() : '';
    if (process.env.NODE_ENV === 'development' && !id && !isAuthLoading) {
      console.warn('CaseMessages - No current user ID available');
    }
    return id;
  }, [user?.id, isAuthLoading]);
  
  // Log auth state for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CaseMessages - Auth state:', { 
        hasUser: !!user, 
        userId: currentUserId,
        isAuthLoading,
        messagesCount: messages.length
      });
    }
  }, [user, currentUserId, isAuthLoading, messages.length]);


  // Handle scroll events and auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setShowScrollToBottom(!isAtBottom);
    };

    // Initial check
    handleScroll();
    
    // Auto-scroll when new messages arrive
    if (messages.length !== prevMessagesLength.current) {
      const wasAtBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) < 100;
      if (wasAtBottom || messages.length < prevMessagesLength.current) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: messages.length > prevMessagesLength.current ? 'smooth' : 'auto'
        });
      }
      prevMessagesLength.current = messages.length;
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read when component mounts
    messages.forEach((message) => {
      if (!message.isRead && message.recipientId === currentUserId) {
        onMarkAsRead(message.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  const MAX_MESSAGE_LENGTH = 2000;
  const remainingChars = MAX_MESSAGE_LENGTH - newMessage.length;
  const isMessageTooLong = remainingChars < 0;
  const isSendDisabled = !newMessage.trim() || sending || isLoading || isMessageTooLong;

  // Debounced function to handle typing indicators
  const handleTyping = useCallback((isUserTyping: boolean) => {
    const debouncedFn = debounce(() => {
      // Here you would typically emit a socket event to notify other users
      // For example: socket.emit('typing', { isTyping: isUserTyping });
      
      // For now, we'll just log it
      if (isUserTyping) {
        console.log('User is typing...');
      }
      
      setIsTyping(false);
    }, 1000);
    
    const cleanup = debouncedFn();
    
    return () => {
      cleanup?.();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Show typing indicator when user starts typing
    if (!isTyping) {
      setIsTyping(true);
      handleTyping(true);
    }
    
    // Reset typing indicator after delay
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit triggered, isSendDisabled:', isSendDisabled);
    if (isSendDisabled) return;
    
    const messageToSend = newMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
    console.log('Preparing to send message:', { messageToSend, otherParticipantId });
    
    try {
      setSending(true);
      console.log('Calling onSendMessage with:', {
        recipientId: otherParticipantId,
        message: messageToSend,
      });
      await onSendMessage({
        recipientId: otherParticipantId,
        message: messageToSend,
      });
      console.log('Message sent, clearing input');
      setNewMessage('');
      
      // Clear any pending typing indicators
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTyping(false);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  // Group messages by date (YYYY-MM-DD format for consistency)
  const groupedMessages = useMemo<Record<string, CaseMessage[]>>(() => {
    const groups: Record<string, CaseMessage[]> = {};
    
    // Sort all messages by timestamp (oldest first) before grouping
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    sortedMessages.forEach((message) => {
      // Format date as YYYY-MM-DD for consistent grouping
      const date = new Date(message.createdAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Grouped messages:', {
        dates: Object.keys(groups).sort(),
        totalMessages: messages.length,
        currentUserId,
        messageCounts: Object.fromEntries(
          Object.entries(groups).map(([date, msgs]) => [date, msgs.length])
        )
      });
    }
    
    return groups;
  }, [messages, currentUserId]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors relative"
      >
        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="fixed right-6 bottom-24 z-10 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-105"
            aria-label="Scroll to bottom"
            title="Go to latest messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
        {isLoading && messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span>Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium">No messages yet</h3>
              <p className="mt-1 text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatMessageDate(date)}
                  </span>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message: CaseMessage) => {
                    const senderId = message.senderId ? String(message.senderId).trim() : '';
                    const isOwnMessage = !!currentUserId && senderId === currentUserId;
                
                // Debug log - only log if there's a mismatch in production
                if (process.env.NODE_ENV === 'development' || 
                    (isOwnMessage && !senderId) || 
                    (isOwnMessage && !currentUserId)) {
                  console.log('Message ownership check:', {
                    messageId: message.id,
                    senderId,
                    currentUserId,
                    isOwnMessage,
                    messageText: message.message?.substring(0, 30) + '...'
                  });
                }
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-none hover:bg-blue-600 transition-colors'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none hover:bg-gray-200 transition-colors'
                      } shadow-sm`}
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                          {isOwnMessage ? 'You' : message.senderType || 'User'}
                        </span>
                        <span 
                          className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}
                          title={new Date(message.createdAt).toLocaleString()}
                        >
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      {!message.isRead && isOwnMessage && (
                        <div className="text-right">
                          <span className="text-xs text-blue-200">
                            Sent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ))}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
        
        {/* Loading indicator when loading more messages */}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Typing Indicator - Placeholder for future implementation with WebSockets
         When implementing, uncomment and use the following structure:
      
      {isTyping && (
        <div className="px-4 py-1 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500">
              Someone is typing...
            </span>
          </div>
        </div>
      )}
      */}
      
      {/* Fixed Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white fixed bottom-0 left-0 right-0 z-10">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 max-w-4xl mx-auto w-full px-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newMessage.trim() && !sending && !isLoading) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
              disabled={sending || isLoading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              {newMessage.length > 0 && (
                <span className={`text-xs ${isMessageTooLong ? 'text-red-500' : 'text-gray-500'}`}>
                  {Math.max(0, remainingChars)}
                </span>
              )}
              <button
                type="button"
                className={`p-1 rounded-full ${sending || isLoading ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                title="Attach file"
                disabled={sending || isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSendDisabled}
            className={`h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full ${isSendDisabled ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            aria-label="Send message"
            title={isMessageTooLong ? 'Message is too long' : 'Send message'}
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
