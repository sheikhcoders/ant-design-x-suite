export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
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