import type { OllamaMessage, ChatCompletionRequest, ChatCompletionChunk } from '../types';
import ollama from 'ollama';

const BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api';
const API_KEY = import.meta.env.VITE_OLLAMA_API_KEY || '';

export class OllamaAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'OllamaAPIError';
  }
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export async function* streamOllamaChat(
  model: string,
  messages: OllamaMessage[],
  options?: {
    system?: string;
    template?: string;
    context?: number[];
    stream?: boolean;
    raw?: boolean;
    format?: string;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    seed?: number;
    think?: boolean;
  }
): AsyncGenerator<{ type: 'thinking' | 'content'; content: string }, void, unknown> {
  try {
    const stream = await ollama.chat({
      model,
      messages,
      stream: true,
      ...options,
    });

    for await (const chunk of stream) {
      if (chunk.message.thinking) {
        yield { type: 'thinking' as const, content: chunk.message.thinking };
      }
      if (chunk.message.content) {
        yield { type: 'content' as const, content: chunk.message.content };
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new OllamaAPIError(`Ollama API error: ${error.message}`);
    }
    throw error;
  }
}

export async function createOllamaChat(
  model: string,
  messages: OllamaMessage[],
  options?: {
    system?: string;
    template?: string;
    context?: number[];
    stream?: boolean;
    raw?: boolean;
    format?: string;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    seed?: number;
    think?: boolean;
  }
): Promise<{ thinking?: string; content: string }> {
  try {
    const response = await ollama.chat({
      model,
      messages,
      stream: false,
      ...options,
    });

    return {
      thinking: response.message.thinking,
      content: response.message.content,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new OllamaAPIError(`Ollama API error: ${error.message}`);
    }
    throw error;
  }
}

export async function getOllamaTags(): Promise<{
  models: Array<{
    name: string;
    model: string;
    modified_at: string;
    details: {
      parent_model: string;
      format: string;
      family: string;
      families: string[];
      parameter_size: string;
      quantization_level: string;
    };
    size: number;
    digest: string;
    details?: any;
  }>;
}> {
  if (!API_KEY && BASE_URL.includes('ollama.com')) {
    throw new OllamaAPIError('Ollama API key not configured. Please set VITE_OLLAMA_API_KEY in your .env file');
  }

  const response = await fetch(`${BASE_URL}/tags`, {
    method: 'GET',
    headers: {
      ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new OllamaAPIError(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      response
    );
  }

  return response.json();
}

// Convert OpenAI-style messages to Ollama format
export function convertMessagesToOllama(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): OllamaMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

// Create a chat completion request with Ollama
export function createOllamaChatRequest(
  model: string,
  messages: OllamaMessage[],
  options?: {
    system?: string;
    template?: string;
    context?: number[];
    stream?: boolean;
    raw?: boolean;
    format?: string;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    seed?: number;
    think?: boolean;
  }
): {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  think?: boolean;
} {
  return {
    model,
    messages,
    stream: true,
    ...options,
  };
}

// Wrapper for thinking-enabled models
export class OllamaThinkingChat {
  private model: string;
  private options?: any;

  constructor(model: string = 'deepseek-r1', options?: any) {
    this.model = model;
    this.options = options;
  }

  async* stream(messages: OllamaMessage[]): AsyncGenerator<{ 
    type: 'thinking' | 'content' | 'done';
    content?: string;
  }> {
    try {
      const stream = await ollama.chat({
        model: this.model,
        messages,
        stream: true,
        think: true,
        ...this.options,
      });

      let hasThinking = false;
      let hasContent = false;

      for await (const chunk of stream) {
        if (chunk.message.thinking) {
          hasThinking = true;
          yield { type: 'thinking' as const, content: chunk.message.thinking };
        }
        if (chunk.message.content) {
          hasContent = true;
          yield { type: 'content' as const, content: chunk.message.content };
        }
      }

      // If we had both thinking and content, mark as done
      if (hasThinking && hasContent) {
        yield { type: 'done' as const };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new OllamaAPIError(`Ollama API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Example usage functions
export async function generateWithOllama(
  prompt: string,
  model: string = 'gpt-oss:120b',
  options?: {
    think?: boolean;
    stream?: boolean;
    system?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<{ thinking?: string; content: string }> {
  const messages: OllamaMessage[] = [
    { role: 'user', content: prompt }
  ];

  try {
    const response = await ollama.chat({
      model,
      messages,
      stream: false,
      ...options,
    });

    return {
      thinking: response.message.thinking,
      content: response.message.content,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new OllamaAPIError(`Ollama API error: ${error.message}`);
    }
    throw error;
  }
}

export async function generateWithThinking(
  prompt: string,
  model: string = 'deepseek-r1'
): Promise<{ thinking: string; content: string }> {
  const result = await generateWithOllama(prompt, model, { think: true });
  
  if (!result.thinking) {
    throw new Error('Model did not return thinking content. Ensure the model supports thinking.');
  }
  
  return {
    thinking: result.thinking,
    content: result.content,
  };
}

// Example from user's request
export async function countLettersInWord(
  word: string,
  letter: string,
  model: string = 'deepseek-r1'
): Promise<{ thinking: string; content: string; answer: string }> {
  const prompt = `How many letter "${letter}" are in "${word}"? Show your thinking process.`;
  const result = await generateWithThinking(prompt, model);
  
  // Extract the numerical answer from content
  const answerMatch = result.content.match(/(\d+)/);
  const answer = answerMatch ? answerMatch[1] : 'Unknown';
  
  return {
    thinking: result.thinking,
    content: result.content,
    answer,
  };
}

export function getApiKey(): string {
  return API_KEY;
}

export function isApiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your-ollama-api-key-here';
}