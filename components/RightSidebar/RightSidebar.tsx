import { useContext, useEffect, useState } from 'react';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import HomeContext from '@/pages/api/home/home.context';

import {
  CloseSidebarButton,
  OpenSidebarButton,
} from './components/OpenCloseButton';

import RightSidebarContext from './RightSiderbar.context';
import { RightSidebarInitialState, initialState } from './RightSiderbar.state';

import { Spoiler, Text } from '@mantine/core';

interface MockConversation {
  metadata: string;
  role: 'Human' | 'AI';
}
interface MockChunk {
  metadata: {
    document_id: string;
    title: string;
    c_parent_id?: string;
    c_content_type?: string;
  };
  page_content: string;
}
interface MockChatResponse {
  message: string;
  session_id: string;
  conversation_history: Array<MockConversation>;
  time_taken: number;
  prompt_tokens: number;
  completion_tokens: number;
  chunks_used: Array<MockChunk>;
}

const mockChatResponse: MockChatResponse = {
  message: '',
  session_id: '123-123-123',
  conversation_history: [],
  time_taken: 20,
  prompt_tokens: 786,
  completion_tokens: 386,
  chunks_used: [
    {
      metadata: {
        document_id: '400001',
        title:
          'title 1 Lorem ipsum dolor sit amet. Non placeat fuga in illum quis et quae eaque? 33 quidem ',
        c_parent_id: '',
        c_content_type: '',
      },
      page_content:
        'Chunk 1. Lorem ipsum dolor sit amet. Non placeat fuga in illum quis et quae eaque? 33 quidem repudiandae quo earum nostrum est rerum doloremque. Ex officia laborum est consequatur sapiente in officiis sunt eum neque velit non consectetur harum. Non galisum alias et aliquid expedita et culpa amet qui dignissimos nihil in sint ducimus sed quas laudantium est architecto eaque.',
    },
    {
      metadata: {
        document_id: '400002',
        title: 'title 2',
        c_parent_id: '',
        c_content_type: '',
      },
      page_content:
        'Chunk 2. Et voluptatibus molestias qui minima enim ut omnis asperiores non voluptatem vero eos autem cumque. Qui odit molestiae et deserunt minima ab maxime consequuntur est autem possimus est doloremque labore. Ut repudiandae quia et incidunt possimus in maiores facilis eum tempora beatae in sunt temporibus ut reiciendis dolor? At nesciunt quasi ut impedit internos et itaque velit in beatae voluptate aut enim obcaecati id unde odio.',
    },
    {
      metadata: {
        document_id: '400003',
        title: 'title 3',
        c_parent_id: '',
        c_content_type: '',
      },
      page_content:
        'Chunk 3. Underneath the starry night sky, the soft whispers of the wind filled the air, carrying the fragrance of blooming flowers. The moon cast a gentle glow on the tranquil scene, as if painting the world in delicate shades of silver. In this moment of serenity, all worries faded away, replaced by a sense of awe and wonder. It was as if nature itself was inviting you to pause, to appreciate the beauty that surrounded you. And as you stood there, breathing in the crisp night air, you couldnt help but feel a deep connection to the vastness of the universe, a reminder of both your own insignificance and the limitless possibilities that lay ahead.',
    },
    {
      metadata: {
        document_id: '400002',
        title: 'title 2',
        c_parent_id: '',
        c_content_type: '',
      },
      page_content:
        'Chunk 4. As the sun began to rise, its warm rays painted the sky in vibrant hues of orange and pink. The city slowly awakened from its slumber, with the distant sounds of traffic and the bustling energy of people filling the streets below. Each building stood tall, a testament to human endeavor and architectural marvel. The aroma of freshly brewed coffee wafted through the air, mingling with the tantalizing scents of a nearby bakery. In this urban symphony, diversity thrived, as people from different walks of life embarked on their daily journeys. Amidst the organized chaos, there was a sense of shared purpose, a collective pursuit of dreams and ambitions. It was a vibrant tapestry of life, where stories intertwined and possibilities seemed infinite.',
    },
    {
      metadata: {
        document_id: '400004',
        title: 'title 4',
        c_parent_id: '',
        c_content_type: '',
      },
      page_content:
        'Chunk 5. The old library stood stoically in the heart of the town, its walls brimming with knowledge and wisdom accumulated over centuries. The scent of aged pages and polished wood greeted every visitor, creating an ambiance of intellectual curiosity and quiet contemplation. Shelves upon shelves of books lined the aisles, inviting exploration into countless realms of imagination and discovery. Sunlight streamed through stained glass windows, casting colorful patterns on worn carpets. The hushed whispers of readers filled the air, as they lost themselves in the pages of novels, poetry, and historical accounts. It was a sanctuary for the mind, where the past danced with the present, allowing knowledge to transcend generations and inspire the seekers of truth.',
    },
  ],
};

const RightSidebar = () => {
  const side = 'right';

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

  // ToDo: remove component and feature that not going to be used
  // ToDo: bring in Sidebar code and remove those not going to use

  return (
    <RightSidebarContext.Provider
      value={{
        ...rightSidebarContextValue,
      }}
    >
      {showRightSidebar ? (
        <div>
          <div
            className={`fixed top-0 ${side}-0 z-40 flex h-full w-[350px] flex-none flex-col space-y-2 p-2 text-[14px] transition-all sm:relative sm:top-0 text-sm bg-white`}
          >
            <div className="flex items-center">
              <div className="sticky top-0 z-10 justify-center text-sm text-neutral-800">
                <Text fz="lg" fw={500} className="text-black">
                  Cited Sources for Answer #X
                </Text>
              </div>
            </div>
            <div className="flex-grow overflow-auto">
              <div className="flex pb-2">
                <div className="flex w-full flex-col pt-2">
                  {mockChatResponse.chunks_used.map((chatResponse, index) => (
                    <div key={index} className="border-b border-black py-1">
                      <Text c="gray.7">Reference #{index}</Text>
                      <Spoiler
                        maxHeight={120}
                        showLabel="Show more"
                        hideLabel="Hide"
                        className="text-black"
                      >
                        {chatResponse.page_content}
                      </Spoiler>
                      <Text c="gray.7">Date?</Text>
                      <Text
                        c="gray.7"
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {chatResponse.metadata.title}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <CloseSidebarButton onClick={handleToggleRightSidebar} side={side} />
        </div>
      ) : (
        <OpenSidebarButton onClick={handleToggleRightSidebar} side={side} />
      )}
    </RightSidebarContext.Provider>
  );
};

export default RightSidebar;
