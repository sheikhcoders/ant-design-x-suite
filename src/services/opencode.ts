import type { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ChatCompletionChunk,
  OpenCodeMessage 
} from '../types';
import { generateSystemPrompt, getDefaultSystemPromptConfig, SystemPromptConfig } from './systemPrompt';

const BASE_URL = import.meta.env.VITE_OPENCODE_BASE_URL || 'https://opencode.ai/zen/v1';
const API_KEY = import.meta.env.VITE_OPENCODE_API_KEY || '';

export class OpenCodeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'OpenCodeAPIError';
  }
}

export async function* streamChatCompletion(
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) {
    throw new OpenCodeAPIError('OpenCode API key not configured. Please set VITE_OPENCODE_API_KEY in your .env file');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      ...request,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new OpenCodeAPIError(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      response
    );
  }

  if (!response.body) {
    throw new OpenCodeAPIError('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed: ChatCompletionChunk = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  if (!API_KEY) {
    throw new OpenCodeAPIError('OpenCode API key not configured. Please set VITE_OPENCODE_API_KEY in your .env file');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      ...request,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new OpenCodeAPIError(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      response
    );
  }

  return response.json();
}

export function convertMessagesToOpenCode(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): OpenCodeMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

export function getApiKey(): string {
  return API_KEY;
}

export function isApiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your-opencode-api-key-here';
}

// Create a chat completion request with system prompt
export function createChatRequestWithSystemPrompt(
  messages: OpenCodeMessage[],
  model: string,
  systemConfig?: Partial<SystemPromptConfig>
): ChatCompletionRequest {
  const config = {
    ...getDefaultSystemPromptConfig(model),
    ...systemConfig,
  };
  
  const systemPrompt = generateSystemPrompt(config);
  
  return {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 2000,
  };
}
