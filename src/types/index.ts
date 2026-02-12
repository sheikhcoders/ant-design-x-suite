export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    thinking?: string;
    sources?: string[];
    code?: string;
    model?: string;
  };
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'assistant';
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

export interface AppConfig {
  theme: 'light' | 'dark';
  language: string;
  apiKey?: string;
  model?: string;
}

export interface ComponentMetadata {
  name: string;
  description: string;
  category: string;
  props?: Record<string, unknown>;
  examples?: string[];
}

export interface DocumentationPage {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
}

export interface AIResponse {
  content: string;
  thinking?: string;
  sources?: string[];
  code?: string;
  metadata?: Record<string, unknown>;
}

// OpenCode API Types
export interface OpenCodeModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface OpenCodeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: OpenCodeMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenCodeMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const OPENCODE_MODELS: OpenCodeModel[] = [
  {
    id: 'glm-4.7-free',
    name: 'GLM 4.7 Free',
    description: 'Free model with strong reasoning and coding capabilities',
    provider: 'opencode'
  },
  {
    id: 'kimi-k2.5-free',
    name: 'Kimi K2.5 Free',
    description: 'Free model optimized for long context and reasoning',
    provider: 'opencode'
  },
  {
    id: 'minimax-m2.1-free',
    name: 'MiniMax M2.1 Free',
    description: 'Free model with excellent multilingual support',
    provider: 'opencode'
  },
  {
    id: 'big-pickle',
    name: 'Big Pickle',
    description: 'Stealth model - experimental features',
    provider: 'opencode'
  }
];

// Ollama API Types
export interface OllamaModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  system?: string;
  template?: string;
  context?: number[];
  raw?: boolean;
  format?: string;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
  temperature?: number;
  repeat_penalty?: number;
  seed?: number;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage & {
    thinking?: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaThinkingMessage extends OllamaMessage {
  thinking?: string;
  content: string;
}

export interface OllamaStreamChunk {
  type: 'thinking' | 'content';
  content: string;
}

export const OLLAMA_MODELS: OllamaModel[] = [
  {
    id: 'gpt-oss:120b',
    name: 'GPT OSS 120B',
    description: 'Open source model with 120B parameters',
    provider: 'ollama'
  },
  {
    id: 'llama2',
    name: 'Llama 2',
    description: 'Meta\'s Llama 2 model',
    provider: 'ollama'
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    description: 'Specialized code generation model',
    provider: 'ollama'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Efficient and capable model',
    provider: 'ollama'
  }
];
