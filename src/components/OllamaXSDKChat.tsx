import React, { useMemo } from 'react';
import { Button, Select, Space, Typography, Alert } from 'antd';
import { Bubble, Sender, Think, Welcome, Prompts, Conversation } from '@ant-design/x';
import { useXChat } from '@ant-design/x-sdk/es/x-chat';
import type { XChatConfig } from '@ant-design/x-sdk/es/x-chat';

import { OllamaXSDKChatProvider, OllamaProviders, createOllamaProvider } from '../services/ollamaXSDKProvider';
import { MarkdownMessage } from '../components/MarkdownMessage';
import { ThinkingDisplay } from '../components/ThinkingDisplay';
import type { OllamaXMessage } from '../services/ollamaXSDKProvider';
import type { XModelParams } from '@ant-design/x-sdk/es/chat-providers/types/model';

const { Text } = Typography;
const { Option } = Select;

/**
 * Ollama Chat Interface using X-SDK
 * This component demonstrates proper integration with Ant Design X-SDK patterns
 */
export const OllamaXSDKChat: React.FC = () => {
  // Create Ollama provider instance
  const ollamaProvider = useMemo(() => 
    createOllamaProvider({
      apiKey: import.meta.env.VITE_OLLAMA_API_KEY || '',
      baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api',
      enableThinking: true,
      defaultModel: 'deepseek-r1',
      temperature: 0.7,
      maxTokens: 2000,
    }),
    []
  );

  // X-SDK Chat Configuration
  const chatConfig: XChatConfig<OllamaXMessage> = useMemo(() => ({
    provider: ollamaProvider,
    conversationKey: 'ollama-chat',
    
    // Transform agent messages to bubble-compatible format
    parser: (message) => {
      if (message.provider === 'ollama') {
        return {
          role: message.role,
          content: message.content,
          thinking: message.thinking,
          model: message.model,
        };
      }
      return message;
    },
    
    // Default welcome message
    defaultMessages: [
      {
        id: 'welcome',
        message: {
          role: 'assistant',
          content: 'Hello! I\'m your Ollama-powered AI assistant. I can think through problems step by step. Ask me anything!',
          provider: 'ollama',
          model: 'deepseek-r1',
          timestamp: Date.now(),
        } as OllamaXMessage,
        status: 'success',
      },
    ],
    
    // Placeholder message during requests
    requestPlaceholder: {
      role: 'assistant',
      content: 'AI is thinking...',
      provider: 'ollama',
      timestamp: Date.now(),
    } as OllamaXMessage,
    
    // Fallback for errors
    requestFallback: (error, info) => {
      return {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        provider: 'ollama',
        timestamp: Date.now(),
      } as OllamaXMessage;
    },
  }), [ollamaProvider]);

  // Initialize X-SDK chat
  const {
    onRequest,
    isRequesting,
    messages,
    parsedMessages,
    removeMessage,
    setMessage,
  } = useXChat(chatConfig);

  // Local state for UI
  const [selectedModel, setSelectedModel] = React.useState('deepseek-r1');
  const [error, setError] = React.useState<string | null>(null);

  // Available models
  const availableModels = React.useMemo(() => [
    'deepseek-r1',
    'qwen3', 
    'qwen2.5-coder',
    'llama2',
    'codellama',
    'mistral',
    'gemma2:27b',
    'codestral:latest',
  ], []);

  // Handle sending messages
  const handleSend = (content: string) => {
    if (!content.trim()) return;

    setError(null);
    
    const requestParams: XModelParams = {
      model: selectedModel,
      messages: [
        ...messages.map(msg => ({
          role: msg.message.role as 'user' | 'assistant' | 'system',
          content: msg.message.content,
        })),
        {
          role: 'user',
          content: content.trim(),
        }
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
      stream: true,
    };

    onRequest(requestParams);
  };

  // Render message with thinking support
  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    const isOllama = message.provider === 'ollama';
    const hasThinking = message.thinking && isOllama;

    return (
      <div key={index} style={{ marginBottom: 16 }}>
        {/* Thinking process for Ollama assistant messages */}
        {hasThinking && (
          <div style={{ marginBottom: 8, maxWidth: '80%', marginLeft: isUser ? 'auto' : 0 }}>
            <ThinkingDisplay
              thinking={message.thinking}
              isVisible={true}
              autoExpand={false}
              className="ollama-thinking"
            />
          </div>
        )}

        {/* Main message bubble */}
        <Bubble
          role={isUser ? 'user' : 'assistant'}
          content={
            message.role === 'assistant' ? (
              <div>
                {isOllama && (
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 8 }}>
                    🤖 {message.model} via Ollama
                    {hasThinking && ' • with thinking'}
                  </Text>
                )}
                <MarkdownMessage content={message.content} />
              </div>
            ) : (
              message.content
            )
          }
          style={{
            maxWidth: '80%',
            background: isUser ? '#1677ff' : undefined,
            color: isUser ? '#fff' : undefined,
            marginLeft: isUser ? 'auto' : 0,
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header with model selection */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <Space>
          <Text strong>Ollama Model:</Text>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 200 }}
            size="small"
          >
            {availableModels.map(model => (
              <Option key={model} value={model}>
                {model}
              </Option>
            ))}
          </Select>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {selectedModel.includes('r1') || selectedModel.includes('qwen3') ? 'Supports thinking' : 'Standard mode'}
          </Text>
        </Space>
      </div>

      {/* Error display */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ margin: '8px 16px' }}
        />
      )}

      {/* Chat messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#f5f5f5' }}>
        {parsedMessages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Welcome
              title="Ollama Chat"
              description={`Chat with ${selectedModel} via X-SDK integration`}
              style={{ maxWidth: 400, textAlign: 'center' }}
            />
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {parsedMessages.map((msg, index) => renderMessage(msg.message, index))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Sender
            placeholder={`Ask ${selectedModel} anything...`}
            onSubmit={handleSend}
            loading={isRequesting}
            style={{ marginBottom: 8 }}
          />
          <Text type="secondary" style={{ fontSize: '11px', display: 'block', textAlign: 'center' }}>
            Powered by Ant Design X-SDK + Ollama • {selectedModel}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default OllamaXSDKChat;