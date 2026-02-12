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
