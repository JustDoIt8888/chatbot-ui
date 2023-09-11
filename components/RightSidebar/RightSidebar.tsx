import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { savePrompts } from '@/utils/app/prompts';

import { OpenAIModels } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import { PromptFolders } from './components/PromptFolders';
import { Prompts } from './components/Prompts';
import { RightSidebarSettings } from './components/RightSidebarSettings';

import Sidebar from '../Sidebar';
import RightSidebarContext from './RightSiderbar.context';
import { RightSidebarInitialState, initialState } from './RightSiderbar.state';

import { v4 as uuidv4 } from 'uuid';

const RightSidebar = () => {
  const { t } = useTranslation('promptbar');

  const rightSidebarContextValue = useCreateReducer<RightSidebarInitialState>({
    initialState,
  });

  const {
    state: { prompts, defaultModelId, showRightSidebar },
    dispatch: homeDispatch,
    handleCreateFolder,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredPrompts },
    dispatch: promptDispatch,
  } = rightSidebarContextValue;

  const handleToggleRightSidebar = () => {
    homeDispatch({ field: 'showRightSidebar', value: !showRightSidebar });
    localStorage.setItem('showRightSidebar', JSON.stringify(!showRightSidebar));
  };

  const handleCreatePrompt = () => {
    if (defaultModelId) {
      const newPrompt: Prompt = {
        id: uuidv4(),
        name: `Prompt ${prompts.length + 1}`,
        description: '',
        content: '',
        model: OpenAIModels[defaultModelId],
        folderId: null,
      };

      const updatedPrompts = [...prompts, newPrompt];

      homeDispatch({ field: 'prompts', value: updatedPrompts });

      savePrompts(updatedPrompts);
    }
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);

    homeDispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdatePrompt = (prompt: Prompt) => {
    const updatedPrompts = prompts.map((p) => {
      if (p.id === prompt.id) {
        return prompt;
      }

      return p;
    });
    homeDispatch({ field: 'prompts', value: updatedPrompts });

    savePrompts(updatedPrompts);
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: e.target.dataset.folderId,
      };

      handleUpdatePrompt(updatedPrompt);

      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      promptDispatch({
        field: 'filteredPrompts',
        value: prompts.filter((prompt) => {
          const searchable =
            prompt.name.toLowerCase() +
            ' ' +
            prompt.description.toLowerCase() +
            ' ' +
            prompt.content.toLowerCase();
          return searchable.includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      promptDispatch({ field: 'filteredPrompts', value: prompts });
    }
  }, [searchTerm, prompts]);

  // ToDo: remove component and feature that not going to be used
  // ToDo: bring in Sidebar code and remove those not going to use

  return (
    <RightSidebarContext.Provider
      value={{
        ...rightSidebarContextValue,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
      }}
    >
      {/* <>
        Cited Sources for Answer #1
      </> */}
      <Sidebar<Prompt>
        side={'right'}
        isOpen={showRightSidebar}
        addItemButtonTitle={t('New prompt')}
        itemComponent={
          <Prompts
            prompts={filteredPrompts.filter((prompt) => !prompt.folderId)}
          />
        }
        folderComponent={<PromptFolders />}
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          promptDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleRightSidebar}
        handleCreateItem={handleCreatePrompt}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'prompt')}
        handleDrop={handleDrop}
      />
    </RightSidebarContext.Provider>
  );
};

export default RightSidebar;
