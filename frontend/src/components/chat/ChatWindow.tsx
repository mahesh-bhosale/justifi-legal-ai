'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Message {
  id: number;
  caseId: number;
  senderId: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatWindowProps {
  caseId: number;
  recipientId: string;
  recipientName?: string;
}

export default function ChatWindow({ 
  caseId, 
  recipientId, 
  recipientName = 'User' 
}: ChatWindowProps) {
  const { user } = useAuth();
  const currentUserId = user?.id || '';
  console.log('ChatWindow props:', { caseId, currentUserId, recipientId, recipientName });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [derivedRecipientId, setDerivedRecipientId] = useState<string>('');
  const [hasValidRecipient, setHasValidRecipient] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, error, onNewMessage, onMessageRead } = useSocket({ 
    caseId, 
    autoConnect: true 
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = Cookies.get('token');
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}/messages`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Failed to load messages', {
            url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}/messages`,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('Failed to load messages', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [caseId]);

  // Always derive recipientId from case details to ensure we have the correct one
  useEffect(() => {
    const computeRecipient = async () => {
      try {
        console.log('Starting recipient computation:', { 
          caseId, 
          currentUserId, 
          recipientIdProp: recipientId,
          hasValidRecipient 
        });
        
        const token = Cookies.get('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}`;
        console.log('Fetching case data from:', url);
        
        const response = await axios.get(url, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        });
        
        if (response.data?.success) {
          const c = response.data.data as { citizenId: string; lawyerId: string | null };
          console.log('Case data received:', { 
            caseId,
            citizenId: c.citizenId, 
            lawyerId: c.lawyerId, 
            currentUserId,
            isCitizen: c.citizenId === currentUserId,
            isLawyer: c.lawyerId === currentUserId
          });
          
          // Determine the other participant
          const fallback = c.citizenId === currentUserId 
            ? (c.lawyerId || '') 
            : c.citizenId;
            
          const finalRecipient = (fallback || '').trim();
          
          console.log('Setting derived recipient:', { 
            fallback, 
            finalRecipient,
            currentRecipientId: recipientId,
            hasRecipient: !!finalRecipient
          });
          
          setDerivedRecipientId(finalRecipient);
          
          // Also update the recipientId if it's empty or different
          if ((!recipientId || recipientId !== finalRecipient) && finalRecipient) {
            console.log('Updating recipientId from derived value:', finalRecipient);
            // This assumes recipientId is from props and there's a way to update it
            // If recipientId is a prop, you might need to call an onRecipientIdChange callback
          }
        } else {
          console.error('Failed to get case data:', response.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Failed to derive recipient from case', {
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('Failed to derive recipient from case', error);
        }
      }
    };

    if (caseId && currentUserId) {
      computeRecipient();
    }
  }, [caseId, currentUserId]);

  // Validate recipientId (must be UUID) whenever inputs change
  useEffect(() => {
    const effective = (recipientId?.trim() || derivedRecipientId)?.trim();
    const isValidUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
    const valid = !!effective && isValidUUID(effective);
    setHasValidRecipient(valid);
    console.log('Recipient validation:', { 
      recipientIdProp: recipientId, 
      derivedRecipientId, 
      effective, 
      valid 
    });
  }, [recipientId, derivedRecipientId]);

  // Set up WebSocket listeners
  useEffect(() => {
    const unsubscribeNewMessage = onNewMessage((message: Message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    const unsubscribeMessageRead = onMessageRead((message: Message) => {
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, isRead: true } : m)
      );
    });

    return () => {
      unsubscribeNewMessage?.();
      unsubscribeMessageRead?.();
    };
  }, [onNewMessage, onMessageRead]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const markUnreadMessages = async () => {
      const unreadMessages = messages.filter(
        m => !m.isRead && m.recipientId === currentUserId
      );

      for (const message of unreadMessages) {
        try {
          const token = Cookies.get('token');
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/${message.id}/read`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }
    };

    if (messages.length > 0) {
      markUnreadMessages();
    }
  }, [messages, currentUserId]);

  // Function to get the recipient ID based on the current user and case data
  const getRecipientId = async (): Promise<string | null> => {
    // First check if we already have a valid derived recipient ID
    if (derivedRecipientId && derivedRecipientId.trim() !== '') {
      return derivedRecipientId;
    }
    
    // Then check the prop
    if (recipientId && recipientId.trim() !== '') {
      return recipientId;
    }
    
    // If we still don't have an ID, fetch case details to determine the recipient
    try {
      const token = Cookies.get('token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}`;
      const response = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data?.success) {
        const c = response.data.data;
        // If current user is the citizen, send to lawyer, otherwise send to citizen
        const derivedId = c.citizenId === currentUserId 
          ? (c.lawyerId || '')
          : c.citizenId;
          
        console.log('Derived recipient ID from case data:', derivedId);
        
        // Update the derived recipient ID for future messages
        if (derivedId) {
          setDerivedRecipientId(derivedId);
          return derivedId;
        }
      }
    } catch (error) {
      console.error('Failed to fetch case details:', error);
    }
    
    return null;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    // Get the recipient ID
    const effectiveRecipientId = await getRecipientId();
    
    // Validate recipientId format (must be UUID)
    const isValidUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
    const isValidRecipient = effectiveRecipientId && isValidUUID(effectiveRecipientId);
    
    if (!isValidRecipient) {
      console.error('Cannot send message: recipientId is invalid or missing', { 
        caseId,
        currentUserId,
        recipientId,
        derivedRecipientId,
        effectiveRecipientId,
        isValidRecipient,
        hasValidRecipient,
        error: 'Invalid or missing recipient ID',
        timestamp: new Date().toISOString()
      });
      
      alert('Cannot send message: Could not determine recipient. Please refresh the page and try again.');
      return;
    }
    
    // Log the final state before sending
    console.log('Sending message with:', {
      caseId,
      currentUserId,
      recipientId: effectiveRecipientId,
      message: newMessage.trim()
    });

    setSending(true);
    try {
      const token = Cookies.get('token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}/messages`;
      const payload = { recipientId: effectiveRecipientId, message: newMessage.trim() };
      console.log('Sending to recipient:', payload.recipientId, 'Message:', payload.message);
      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNewMessage('');
        // Message will be added via WebSocket event
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to send message', {
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cases/${caseId}/messages`,
          status: error.response?.status,
          data: error.response?.data,
          payload: { recipientId: effectiveRecipientId, message: newMessage.trim().slice(0, 50) }
        });
        if (error.response?.status === 400) {
          const validationErrors = (error.response.data as any)?.errors;
          const baseMessage = (error.response.data as any)?.message || 'Bad request while sending message. Please verify recipient and content.';
          alert(baseMessage + (validationErrors ? `\nDetails: ${JSON.stringify(validationErrors)}` : ''));
        }
      } else {
        console.error('Failed to send message', error);
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div>
          <h3 className="font-semibold text-gray-900">Chat with {recipientName}</h3>
          <p className="text-sm text-gray-500">
            Case #{caseId} • {isConnected ? (
              <span className="text-green-600">● Connected</span>
            ) : (
              <span className="text-red-600">● Disconnected</span>
            )}
            {!hasValidRecipient && (
              <span className="text-red-600 ml-2">● No valid recipient</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">Connection error: {error}</p>
          </div>
        )}
        
        {!hasValidRecipient && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-600">
              Cannot send messages: No valid recipient found. Please refresh the page.
            </p>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const senderId = String(message.senderId).trim();
              const currentId = String(currentUserId).trim();
              const isOwnMessage = senderId === currentId;
              
              // Debug log - can be removed in production
              if (process.env.NODE_ENV === 'development') {
                console.log('Message debug:', {
                  messageId: message.id,
                  senderId,
                  currentUserId: currentId,
                  isOwnMessage,
                  message
                });
              }
              const showDate = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 my-4">
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span className="text-xs">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={hasValidRecipient ? "Type your message..." : "Cannot send messages - no valid recipient"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending || !isConnected || !hasValidRecipient}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !isConnected || !hasValidRecipient}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
