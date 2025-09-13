'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { CaseMessages } from './CaseMessages';
import { useAuth } from '@/contexts/AuthContext';
import { 
  type CaseMessage, 
  type CreateMessageInput, 
  getCaseMessages, 
  sendMessage, 
  markMessageAsRead, 
} from '@/lib/messages';
import { Socket } from 'socket.io-client';

interface CaseMessagesContainerProps {
  caseId: number;
  userRole: 'citizen' | 'lawyer' | 'admin';
}

export function CaseMessagesContainer({ caseId }: CaseMessagesContainerProps) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket: authSocket } = useAuth();

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for case:', caseId);
      const data = await getCaseMessages(caseId);
      console.log('Fetched messages:', data);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // Set up WebSocket listeners when component mounts
  useEffect(() => {
    console.group('Setting up WebSocket listeners');
    
    if (!authSocket) {
      console.error('WebSocket not initialized in AuthContext');
      console.groupEnd();
      return;
    }
    
    if (!caseId) {
      console.error('Case ID not provided to CaseMessagesContainer');
      console.groupEnd();
      return;
    }
    
    // Log initial WebSocket state
    // Type assertion for socket with additional properties
    type ExtendedSocket = Socket & { active?: boolean };
    
    console.log('Initial WebSocket state:', {
      connected: authSocket.connected,
      id: authSocket.id,
      active: (authSocket as ExtendedSocket).active,
      hasListeners: {
        connect: authSocket.hasListeners('connect'),
        disconnect: authSocket.hasListeners('disconnect'),
        'message:new': authSocket.hasListeners('message:new'),
        'message:read': authSocket.hasListeners('message:read')
      }
    });
    
    // Log WebSocket connection status
    console.log('WebSocket connection status:', {
      connected: authSocket.connected,
      id: authSocket.id,
      active: authSocket.active
    });

    console.log('Setting up WebSocket handlers for case:', caseId);
    
    const handleNewMessage = (newMessage: CaseMessage) => {
      console.log('Received new message via WebSocket:', {
        messageId: newMessage.id,
        sender: newMessage.senderId,
        preview: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : '')
      });
      
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          console.log('Duplicate message received, ignoring:', newMessage.id);
          return prev;
        }
        return [...prev, newMessage];
      });
    };

    const handleMessageRead = (messageData: { id: number }) => {
      console.log('Message marked as read:', messageData.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageData.id ? { ...msg, isRead: true } : msg
        )
      );
    };

    // Set up event listeners with error handling
    const setupListeners = () => {
      console.group('Setting up WebSocket event listeners');
      
      try {
        // Log before adding listeners
        console.log('Current WebSocket state before adding listeners:', {
          connected: authSocket.connected,
          id: authSocket.id
        });
        
        // Add new message handler
        console.log('Adding message:new listener');
        const newMessageHandler = (message: CaseMessage) => {
          console.group('Received message:new event');
          console.log('New message received:', {
            id: message.id,
            sender: message.senderId,
            preview: message.message?.substring(0, 50) + (message.message?.length > 50 ? '...' : ''),
            timestamp: new Date().toISOString()
          });
          handleNewMessage(message);
          console.groupEnd();
        };
        
        authSocket.on('message:new', newMessageHandler);
        
        // Add message read handler
        console.log('Adding message:read listener');
        const messageReadHandler = (data: { id: number }) => {
          console.log('Message read event:', data);
          handleMessageRead(data);
        };
        authSocket.on('message:read', messageReadHandler);
        
        // Handle socket errors
        console.log('Adding error listener');
        const handleError = (error: Error) => {
          console.error('WebSocket error in CaseMessagesContainer:', error);
        };
        authSocket.on('error', handleError);
        
        // Add debug event listener
        authSocket.on('debug:message', (data: { type: string; room: string; messageId: number; timestamp: string }) => {
          console.log('Debug WebSocket message:', data);
        });
        
        // Log after adding listeners
        console.log('Successfully added WebSocket listeners');
        console.log('Current WebSocket state after adding listeners:', {
          connected: authSocket.connected,
          id: authSocket.id,
          hasListeners: {
            'message:new': authSocket.hasListeners('message:new'),
            'message:read': authSocket.hasListeners('message:read'),
            'error': authSocket.hasListeners('error'),
            'debug:message': authSocket.hasListeners('debug:message')
          }
        });
        
        // Return cleanup function
        return () => {
          console.group('Cleaning up WebSocket listeners');
          console.log('Removing WebSocket event listeners');
          authSocket.off('message:new', newMessageHandler);
          authSocket.off('message:read', messageReadHandler);
          authSocket.off('error', handleError);
          console.log('WebSocket listeners cleaned up');
          console.groupEnd();
        };
      } catch (error) {
        console.error('Error setting up WebSocket listeners:', error);
        return () => {};
      }
    };

    // Join the case room
    const joinRoom = () => {
      console.group('Joining WebSocket room');
      console.log('Emitting join:case for caseId:', caseId);
      console.log('Current authSocket state:', {
        connected: authSocket.connected,
        id: authSocket.id,
        hasListeners: {
          'message:new': authSocket.hasListeners('message:new'),
          'message:read': authSocket.hasListeners('message:read')
        }
      });
      
      try {
        // Add a timeout for the join:case acknowledgment
        const joinTimeout = setTimeout(() => {
          console.warn('join:case acknowledgment timeout - no response from server');
        }, 5000);
        
        authSocket.emit('join:case', { caseId }, (response: { error?: string; room?: string; roomSize?: number } | undefined) => {
          clearTimeout(joinTimeout);
          console.groupCollapsed('join:case acknowledgment received');
          if (response?.error) {
            console.error('❌ Failed to join room:', response.error);
            console.groupEnd(); // End join:case group
            return;
          }
          
          console.log('✅ Successfully joined room:', {
            room: response?.room,
            roomSize: response?.roomSize,
            caseId
          });
          
          // Log all active listeners after joining
          console.log('Active WebSocket event listeners:', {
            'message:new': authSocket.hasListeners('message:new'),
            'message:read': authSocket.hasListeners('message:read'),
            'connect': authSocket.hasListeners('connect'),
            'disconnect': authSocket.hasListeners('disconnect')
          });
          
          console.groupEnd(); // End join:case group
        });
      } catch (error) {
        console.error('Error joining room:', error);
      }
    };

    // Initial setup
    const cleanupListeners = setupListeners();
    joinRoom();
    
    // Initial fetch of messages
    console.log('Performing initial fetch of messages');
    fetchMessages().catch(error => {
      console.error('Error during initial message fetch:', error);
    });

    // Clean up
    return () => {
      console.log('Cleaning up WebSocket handlers for case:', caseId);
      cleanupListeners();
      
      if (caseId) {
        try {
          authSocket.emit('leave:case', { caseId });
          console.log('Left WebSocket room for case:', caseId);
        } catch (error) {
          console.error('Error leaving room:', error);
        }
      }
    };
  }, [authSocket, caseId, fetchMessages]);

  const handleSendMessage = async (data: CreateMessageInput) => {
    console.log('Sending message:', { caseId, data });
    try {
      const sentMessage = await sendMessage(caseId, data);
      console.log('Message sent successfully:', sentMessage);
      
      // Optimistically update the UI with the new message
      // The WebSocket event will also update the list when it arrives
      setMessages(prev => [...prev, sentMessage]);
      
      // Still fetch to ensure we have the latest state
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Re-fetch messages to ensure consistency
      await fetchMessages();
      throw error;
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    await markMessageAsRead(messageId);
    // Optimistically update local state
    setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isRead: true } : m)));
  };

  const { user, isLoading: isAuthLoading } = useAuth();
  const currentUserId = user?.id || '';

  // Get the other participant's ID by finding a message not from the current user
  const otherParticipantId = useMemo(() => {
    if (!messages.length) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No messages available to determine other participant');
      }
      return '';
    }
    
    // Try to find a message from another participant
    const otherMessage = messages.find(m => m.senderId !== currentUserId);
    
    // If no other participant found, try to find any recipient that's not the current user
    if (!otherMessage) {
      const recipientMessage = messages.find(m => m.recipientId !== currentUserId);
      if (recipientMessage) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using recipient ID as other participant:', recipientMessage.recipientId);
        }
        return recipientMessage.recipientId;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not determine other participant ID from messages:', {
          messages,
          currentUserId
        });
      }
      return '';
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Found other participant:', otherMessage.senderId);
    }
    return otherMessage.senderId;
  }, [messages, currentUserId]);

  // Debug log the current state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CaseMessagesContainer state:', {
        messagesCount: messages.length,
        currentUserId,
        otherParticipantId,
        isAuthLoading,
        loading
      });
    }
  }, [messages.length, currentUserId, otherParticipantId, isAuthLoading, loading]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
