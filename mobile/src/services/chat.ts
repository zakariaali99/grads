import api from '../lib/api';
import { withOfflineFallback } from './offline';
import { mockConversations, mockMessages } from '../data/mockData';

export interface Conversation {
  id: string;
  participants: string[];
  participant_names?: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: string;
  sender_name?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  getConversations: () =>
    withOfflineFallback(
      () => api.get<Conversation[]>('/chat/conversations/'),
      mockConversations,
    ),
  createConversation: (data: { participant_usernames?: string[]; subject?: string }) =>
    api.post<Conversation>('/chat/conversations/', data),
  getMessages: (conversationId: string) =>
    withOfflineFallback(
      () => api.get<Message[]>(`/chat/conversations/${conversationId}/messages/`),
      mockMessages[conversationId] || [],
    ),
  sendMessage: (data: { conversation: string; content: string }) =>
    api.post<Message>('/chat/messages/', data),
};
