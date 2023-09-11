import { Conversation } from '@/types/chat';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredConversations: Conversation[];
  lightMode: 'light' | 'dark';
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredConversations: [],
  lightMode: 'light',
};
