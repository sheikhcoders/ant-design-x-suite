import { AbstractChatProvider } from '@ant-design/x-sdk/es/chat-providers/AbstractChatProvider';
import type { ChatProviderConfig } from '@ant-design/x-sdk/es/chat-providers/AbstractChatProvider';
import type { XModelMessage, XModelParams, XModelResponse } from '@ant-design/x-sdk/es/chat-providers/types/model';
import type { SimpleType, MessageStatus } from '@ant-design/x-sdk/es/chat-providers/x-chat';

import type { OllamaMessage, ChatCompletionRequest, ChatCompletionChunk } from '../../types';
import type { OllamaThinkingMessage } from '../../types';

// Extend the base chat provider configuration
export interface OllamaProviderConfig extends ChatProviderConfig<XModelParams, XModelResponse, OllamaThinkingMessage> {
  apiKey?: string;
  baseUrl?: string;
  enableThinking?: boolean;
}

// Internal streaming chunk interface matching X-SDK patterns
interface OllamaStreamChunk {
  role: string;
  content?: string;
  thinking?: string;
}

// Transform message for local display
export interface OllamaLocalMessage extends SimpleType {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  timestamp: number;
  model?: string;
  provider: 'ollama';
}

/**
 * Enhanced Ollama Chat Provider following X-SDK patterns
 * Provides thinking support, streaming, and robust error handling
 */
export class OllamaChatProvider extends AbstractChatProvider<OllamaThinkingMessage, XModelParams, XModelResponse> {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly enableThinking: boolean;

  constructor(config: OllamaProviderConfig) {
    // Initialize with the X-SDK abstract provider
    super(config);
    
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ollama.com/api';
    this.enableThinking = config.enableThinking ?? true;
  }

  /**
   * Transform request parameters for Ollama API
   */
  transformParams(requestParams: Partial<XModelParams>, options?: any): XModelParams {
    const model = requestParams.model || options?.model || 'deepseek-r1';
    const messages = requestParams.messages || [];
    const temperature = requestParams.temperature ?? 0.7;
    const max_tokens = requestParams.max_completion_tokens ?? 2000;

    // Convert XModel messages to Ollama format
    const ollamaMessages: OllamaMessage[] = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : msg.content?.text || ''
    }));

    return {
      model,
      messages: ollamaMessages,
      stream: requestParams.stream ?? true,
      temperature,
      max_completion_tokens: max_tokens,
      ...(this.enableThinking && { think: true }),
      ...options,
    };
  }

  /**
   * Transform parameters to local message format for UI display
   */
  transformLocalMessage(requestParams: Partial<XModelParams>): OllamaLocalMessage {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lastMessage = requestParams.messages?.[requestParams.messages.length - 1];
    
    return {
      id,
      role: (lastMessage?.role as 'user' | 'assistant' | 'system') || 'user',
      content: typeof lastMessage?.content === 'string' 
        ? lastMessage.content 
        : lastMessage?.content?.text || '',
      timestamp: Date.now(),
      model: requestParams.model,
      provider: 'ollama'
    };
  }

  /**
   * Transform streaming response to local message format
   */
  transformMessage(info: {
    originMessage?: OllamaThinkingMessage;
    chunk: XModelResponse;
    chunks: XModelResponse[];
    status: MessageStatus;
    responseHeaders: Headers;
  }): OllamaThinkingMessage {
    const choice = info.chunk.choices[0];
    const content = typeof choice.message.content === 'string' 
      ? choice.message.content 
      : choice.message.content?.text || '';

    const thinking = choice.message.reasoning_content || choice.message.thinking;

    return {
      role: choice.message.role as 'user' | 'assistant' | 'system',
      content,
      ...(thinking && { thinking }),
      ...(info.originMessage && { ...info.originMessage }),
    };
  }

  /**
   * Enhanced chat completion with thinking support
   */
  async chat(model: string, messages: OllamaMessage[], options?: any): Promise<XModelResponse> {
    // Dynamic import of ollama package
    const { default: ollama } = await import('ollama');
    
    const response = await ollama.chat({
      model,
      messages,
      stream: false,
      think: this.enableThinking,
      ...options,
    });

    return {
      id: `ollama_${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: response.message.role,
          content: response.message.content,
          reasoning_content: response.message.thinking || null,
          refusal: null,
          annotations: [],
        },
        logprobs: null,
        finish_reason: 'stop',
      }],
      service_tier: null,
      system_fingerprint: null,
      usage: {
        prompt_tokens: 0, // Ollama doesn't provide these details
        completion_tokens: 0,
        total_tokens: 0,
        completion_tokens_details: {
          reasoning_tokens: 0,
          audio_tokens: 0,
          accepted_prediction_tokens: 0,
          rejected_prediction_tokens: 0,
        },
        prompt_tokens_details: {
          cached_tokens: 0,
          audio_tokens: 0,
        },
      },
    };
  }

  /**
   * Streaming chat with thinking support
   */
  async* streamChat(model: string, messages: OllamaMessage[], options?: any): AsyncGenerator<XModelResponse, void, unknown> {
    const { default: ollama } = await import('ollama');
    
    const stream = await ollama.chat({
      model,
      messages,
      stream: true,
      think: this.enableThinking,
      ...options,
    });

    let chunkCount = 0;
    for await (const chunk of stream) {
      chunkCount++;
      
      const response: XModelResponse = {
        id: `ollama_stream_${Date.now()}_${chunkCount}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
          index: 0,
          message: {
            role: chunk.message.role,
            content: chunk.message.content || '',
            reasoning_content: chunk.message.thinking || null,
            refusal: null,
            annotations: [],
          },
          logprobs: null,
          finish_reason: chunk.done ? 'stop' : undefined,
        }],
        service_tier: null,
        system_fingerprint: null,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          completion_tokens_details: {
            reasoning_tokens: 0,
            audio_tokens: 0,
            accepted_prediction_tokens: 0,
            rejected_prediction_tokens: 0,
          },
          prompt_tokens_details: {
            cached_tokens: 0,
            audio_tokens: 0,
          },
        },
      };

      yield response;
      
      if (chunk.done) {
        break;
      }
    }
  }

  /**
   * Health check for Ollama service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { default: ollama } = await import('ollama');
      await ollama.list();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const { default: ollama } = await import('ollama');
      const response = await ollama.list();
      return response.models.map(model => model.name);
    } catch {
      // Return default models if API unavailable
      return ['deepseek-r1', 'qwen3', 'llama2', 'codellama'];
    }
  }
}

// Factory function for easy provider creation
export function createOllamaProvider(config: Partial<OllamaProviderConfig> = {}): OllamaChatProvider {
  const defaultConfig: OllamaProviderConfig = {
    request: async () => ({}), // Placeholder - X-SDK handles this
    apiKey: import.meta.env.VITE_OLLAMA_API_KEY || '',
    baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api',
    enableThinking: true,
    ...config,
  };

  return new OllamaChatProvider(defaultConfig);
}