import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead: boolean;
}

interface MessagingContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  unreadCount: number;
  fetchMessages: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      return;
    }

    try {
      const response: any = await apiService.getMessages();
      const mappedMessages: Message[] = (response.messages || []).map((msg: any) => ({
  id: msg.id?.toString() ?? '',
  text: msg.text ?? '',
  sender: msg.sender ?? 'user',
  timestamp: msg.timestamp ? new Date(msg.timestamp) : null,
  isRead: Boolean(msg.isRead),
}));
      setMessages(mappedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response: any = await apiService.getUnreadCount();
      setUnreadCount(response.unreadCount ?? 0);
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, fetchMessages, fetchUnreadCount]);

  const sendMessage = async (text: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour envoyer un message.');
      return;
    }

    try {
      await apiService.sendMessage(text);
      await Promise.all([fetchMessages(), fetchUnreadCount()]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await apiService.markMessageAsRead(messageId);
      await Promise.all([fetchMessages(), fetchUnreadCount()]);
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  const value: MessagingContextType = {
    messages,
    sendMessage,
    markAsRead,
    unreadCount,
    fetchMessages,
    fetchUnreadCount,
  };

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};