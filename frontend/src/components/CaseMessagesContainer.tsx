'use client';

import { useCallback, useEffect, useState } from 'react';
import { CaseMessages } from './CaseMessages';
import {
  type CaseMessage,
  type CreateMessageInput,
  getCaseMessages,
  sendMessage,
  markMessageAsRead,
} from '@/lib/messages';

interface CaseMessagesContainerProps {
  caseId: number;
  userRole: 'citizen' | 'lawyer' | 'admin';
}

export function CaseMessagesContainer({ caseId }: CaseMessagesContainerProps) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCaseMessages(caseId);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (data: CreateMessageInput) => {
    await sendMessage(caseId, data);
    await fetchMessages();
  };

  const handleMarkAsRead = async (messageId: number) => {
    await markMessageAsRead(messageId);
    // Optimistically update local state
    setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isRead: true } : m)));
  };

  // TODO: Replace with actual current user identification when auth is wired
  const currentUserId = '';
  const otherParticipantId = '';

  return (
    <CaseMessages
      messages={messages}
      onSendMessage={handleSendMessage}
      onMarkAsRead={handleMarkAsRead}
      currentUserId={currentUserId}
      otherParticipantId={otherParticipantId}
      isLoading={loading}
    />
  );
}


