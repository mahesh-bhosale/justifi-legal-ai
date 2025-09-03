'use client';

import { useState, useEffect, useRef } from 'react';
import { CaseMessage, CreateMessageInput } from '@/lib/messages';
import Button from './Button';
import Card from './Card';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

export function CaseMessages({
  messages,
  onSendMessage,
  onMarkAsRead,
  currentUserId,
  otherParticipantId,
  isLoading = false,
}: CaseMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read when component mounts
    messages.forEach((message) => {
      if (!message.isRead && message.recipientId === currentUserId) {
        onMarkAsRead(message.id);
      }
    });
  }, [messages, currentUserId, onMarkAsRead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage({
        recipientId: otherParticipantId,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, CaseMessage[]>);

  if (messages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-96">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex justify-center mb-4">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {dateMessages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {!message.isRead && !isOwnMessage && (
                          <span className="ml-2">• Unread</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending || isLoading}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending || isLoading}
            className="px-4 py-2"
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
