import { Conversation } from './../../types/chat';
import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import {
  AZURE_DEPLOYMENT_ID,
  OPENAI_API_HOST,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  key: string,
  messages: Message[],
) => {
  let url = `${OPENAI_API_HOST}/v1/chat/completions`;
  if (OPENAI_API_TYPE === 'azure') {
    url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  }
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'azure' && {
        'api-key': `${key ? key : process.env.OPENAI_API_KEY}`,
      }),
      ...(OPENAI_API_TYPE === 'openai' &&
        OPENAI_ORGANIZATION && {
          'OpenAI-Organization': OPENAI_ORGANIZATION,
        }),
    },
    method: 'POST',
    body: JSON.stringify({
      ...(OPENAI_API_TYPE === 'openai' && { model: model.id }),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: temperature,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);
            if (json.choices[0].finish_reason != null) {
              controller.close();
              return;
            }
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

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

export interface MockChatResponse {
  message: string;
  session_id: string;
  conversation_history: Array<MockConversation>;
  time_taken: number;
  prompt_tokens: number;
  completion_tokens: number;
  chunks_used: Array<MockChunk>;
}

export const mockChatResponse = (): MockChatResponse => {
  return {
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
          title: 'title 1',
          c_parent_id: '',
          c_content_type: '',
        },
        page_content: 'The is a page content of chunk 1',
      },
      {
        metadata: {
          document_id: '400002',
          title: 'title 2',
          c_parent_id: '',
          c_content_type: '',
        },
        page_content: 'The is a page content of chunk 2',
      },
      {
        metadata: {
          document_id: '400003',
          title: 'title 3',
          c_parent_id: '',
          c_content_type: '',
        },
        page_content: 'The is a page content of chunk 3',
      },
      {
        metadata: {
          document_id: '400002',
          title: 'title 2',
          c_parent_id: '',
          c_content_type: '',
        },
        page_content: 'The is a page content of chunk 4',
      },
      {
        metadata: {
          document_id: '400004',
          title: 'title 4',
          c_parent_id: '',
          c_content_type: '',
        },
        page_content: 'The is a page content of chunk 5',
      },
    ],
  };
};
