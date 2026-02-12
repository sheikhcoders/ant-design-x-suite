import { AbstractChatProvider } from '@ant-design/x-sdk/es/chat-providers/AbstractChatProvider';
import type { 
  XModelMessage, 
  XModelParams, 
  XModelResponse 
} from '@ant-design/x-sdk/es/chat-providers/types/model';
import type { 
  SimpleType, 
  MessageStatus 
} from '@ant-design/x-sdk/es/x-chat';
import type { 
  TransformMessage 
} from '@ant-design/x-sdk/es/chat-providers/AbstractChatProvider';

import type { OllamaMessage } from '../../types';

// Extended message interface for Ollama with thinking support
export interface OllamaXMessage extends XModelMessage {
  thinking?: string;
  model?: string;
  provider: 'ollama';
  timestamp?: number;
  id?: string;
}

// Provider configuration
export interface OllamaProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  enableThinking?: boolean;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Ollama Chat Provider for X-SDK
 * Fully compatible with Ant Design X-SDK patterns
 */
export class OllamaXSDKChatProvider extends AbstractChatProvider<OllamaXMessage, XModelParams, XModelResponse> {
  private readonly config: Required<OllamaProviderConfig>;
  private readonly apiUrl: string;

  constructor(config: OllamaProviderConfig = {}) {
    super({
      request: async () => ({}) as any, // Placeholder - we'll handle requests manually
    });

    this.config = {
      apiKey: config.apiKey || import.meta.env.VITE_OLLAMA_API_KEY || '',
      baseUrl: config.baseUrl || import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api',
      enableThinking: config.enableThinking ?? true,
      defaultModel: config.defaultModel || 'deepseek-r1',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2000,
    };

    this.apiUrl = `${this.config.baseUrl}/chat`;
  }

  /**
   * Transform request parameters to Ollama format
   */
  transformParams(requestParams: Partial<XModelParams>): XModelParams {
    const model = requestParams.model || this.config.defaultModel;
    const messages = requestParams.messages || [];
    const temperature = requestParams.temperature ?? this.config.temperature;
    const max_tokens = requestParams.max_completion_tokens ?? this.config.maxTokens;

    // Detect if this is a thinking model
    const isThinkingModel = this.isThinkingEnabled(model);

    return {
      ...requestParams,
      model,
      messages,
      temperature,
      max_completion_tokens: max_tokens,
      stream: requestParams.stream ?? true,
      ...(isThinkingModel && this.config.enableThinking && { think: true }),
    };
  }

  /**
   * Transform request parameters to local message format
   */
  transformLocalMessage(requestParams: Partial<XModelParams>): OllamaXMessage | OllamaXMessage[] {
    const messages: OllamaXMessage[] = (requestParams.messages || []).map((msg, index) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : msg.content?.text || '',
      thinking: undefined,
      model: requestParams.model,
      provider: 'ollama',
      timestamp: Date.now() + index,
      id: `ollama_${Date.now()}_${index}`,
    }));

    return messages;
  }

  /**
   * Transform streaming response to local message format
   */
  transformMessage(info: TransformMessage<OllamaXMessage, XModelResponse>): OllamaXMessage {
    const choice = info.chunk.choices[0];
    const content = typeof choice.message.content === 'string' 
      ? choice.message.content 
      : choice.message.content?.text || '';

    const reasoning = choice.message.reasoning_content;

    return {
      role: choice.message.role as 'user' | 'assistant' | 'system',
      content,
      ...(reasoning && { thinking: reasoning }),
      model: info.chunk.model,
      provider: 'ollama',
      timestamp: Date.now(),
      id: info.chunk.id,
    };
  }

  /**
   * Check if model supports thinking
   */
  private isThinkingEnabled(model?: string): boolean {
    if (!model) return false;
    
    const thinkingModels = [
      'deepseek-r1', 'deepseek-r1:32b', 'deepseek-r1:70b',
      'qwen3', 'qwen2.5-coder', 'qwen2.5-coder:32b',
      'gemma3', 'gemma2:27b',
      'codestral', 'codestral:latest'
    ];

    return thinkingModels.some(thinkingModel => 
      model.toLowerCase().includes(thinkingModel.toLowerCase())
    );
  }

  /**
   * Make direct Ollama API call (used by custom request handler)
   */
  async chat(params: XModelParams): Promise<XModelResponse> {
    const { default: ollama } = await import('ollama');
    
    const ollamaMessages: OllamaMessage[] = params.messages?.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : msg.content?.text || ''
    })) || [];

    const response = await ollama.chat({
      model: params.model || this.config.defaultModel,
      messages: ollamaMessages,
      stream: false,
      think: params.think || this.config.enableThinking,
      temperature: params.temperature,
      max_tokens: params.max_completion_tokens,
    });

    return this.formatOllamaResponse(response, params.model || this.config.defaultModel);
  }

  /**
   * Streaming chat with Ollama
   */
  async* streamChat(params: XModelParams): AsyncGenerator<XModelResponse, void, unknown> {
    const { default: ollama } = await import('ollama');
    
    const ollamaMessages: OllamaMessage[] = params.messages?.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content : msg.content?.text || ''
    })) || [];

    const stream = await ollama.chat({
      model: params.model || this.config.defaultModel,
      messages: ollamaMessages,
      stream: true,
      think: params.think || this.config.enableThinking,
      temperature: params.temperature,
      max_tokens: params.max_completion_tokens,
    });

    let chunkIndex = 0;
    for await (const chunk of stream) {
      chunkIndex++;
      yield this.formatOllamaChunk(chunk, params.model || this.config.defaultModel, chunkIndex);
      
      if (chunk.done) break;
    }
  }

  /**
   * Format Ollama response to X-SDK format
   */
  private formatOllamaResponse(ollamaResponse: any, model: string): XModelResponse {
    return {
      id: `ollama_${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: ollamaResponse.message.role,
          content: ollamaResponse.message.content,
          reasoning_content: ollamaResponse.message.thinking || null,
          refusal: null,
          annotations: [],
        },
        logprobs: null,
        finish_reason: 'stop',
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
  }

  /**
   * Format Ollama streaming chunk to X-SDK format
   */
  private formatOllamaChunk(chunk: any, model: string, index: number): XModelResponse {
    return {
      id: `ollama_stream_${Date.now()}_${index}`,
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
      // Fallback to default models
      return [
        'deepseek-r1',
        'qwen3',
        'llama2',
        'codellama',
        'mistral',
        'phi3',
        'gemma2:27b',
        'codestral:latest'
      ];
    }
  }

  /**
   * Health check
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
}

// Factory function for easy provider creation
export function createOllamaProvider(config: OllamaProviderConfig = {}): OllamaXSDKChatProvider {
  return new OllamaXSDKChatProvider(config);
}

// Pre-configured providers
export const OllamaProviders = {
  basic: createOllamaProvider({
    enableThinking: false,
    defaultModel: 'llama2',
  }),
  
  thinking: createOllamaProvider({
    enableThinking: true,
    defaultModel: 'deepseek-r1',
  }),
  
  coder: createOllamaProvider({
    enableThinking: true,
    defaultModel: 'qwen2.5-coder',
    temperature: 0.1,
  }),
  
  creative: createOllamaProvider({
    enableThinking: true,
    defaultModel: 'qwen3',
    temperature: 0.9,
  }),
};

// Export types
export type { XModelMessage, XModelParams, XModelResponse, OllamaXMessage };