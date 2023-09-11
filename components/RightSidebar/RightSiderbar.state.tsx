import { Prompt } from '@/types/prompt';

export interface RightSidebarInitialState {
  searchTerm: string;
  filteredPrompts: Prompt[];
}

export const initialState: RightSidebarInitialState = {
  searchTerm: '',
  filteredPrompts: [],
};
