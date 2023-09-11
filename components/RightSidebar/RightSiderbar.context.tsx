import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Prompt } from '@/types/prompt';

import { RightSidebarInitialState } from './RightSiderbar.state';

export interface RightSidebarContextProps {
  state: RightSidebarInitialState;
  dispatch: Dispatch<ActionType<RightSidebarInitialState>>;
  handleCreatePrompt: () => void;
  handleDeletePrompt: (prompt: Prompt) => void;
  handleUpdatePrompt: (prompt: Prompt) => void;
}

const RightSidebarContext = createContext<RightSidebarContextProps>(undefined!);

export default RightSidebarContext;
