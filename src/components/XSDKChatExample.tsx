import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Menu, Typography, Alert, Button, Space, Switch } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Conversation, 
  Bubble, 
  Sender, 
  Think, 
  Welcome, 
  Prompts,
  type MenuProps 
} from '@ant-design/x';
import { useXChat } from '@ant-design/x-sdk/es/x-chat';
import type { XChatConfig } from '@ant-design/x-sdk/es/x-chat';

import { createOllamaProvider, OllamaProviders } from '../services/ollamaXSDKProvider';
import { MarkdownMessage } from '../components/MarkdownMessage';
import { ThinkingDisplay } from '../components/ThinkingDisplay';
import type { OllamaXMessage } from '../services/ollamaXSDKProvider';
import type { XModelParams } from '@ant-design/x-sdk/es/chat-providers/types/model';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Complete X-SDK Chat Example
 * Demonstrates proper integration patterns from the X-SDK documentation
 */
export const XSDKChatExample: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // X-SDK Provider (80% following docs pattern)
  const ollamaProvider = useMemo(() => 
    OllamaProviders.thinking, // Using pre-configured thinking provider
    []
  );

  // X-SDK Chat Configuration (following official patterns)
  const chatConfig: XChatConfig<OllamaXMessage> = useMemo(() => ({
    provider: ollamaProvider,
    conversationKey: 'x-sdk-ollama-demo',
    
    // Transform messages for display (following docs pattern)
    parser: (message) => {
      // Return the message as-is, X-SDK handles the rest
      return message;
    },
    
    // Default welcome message (docs pattern)
    defaultMessages: async () => [
      {
        id: 'welcome',
        role: 'assistant' as const,
        content: 'Welcome to the X-SDK Ollama Demo! I support thinking processes and can demonstrate step-by-step reasoning. Try asking me complex questions!',
        provider: 'ollama' as const,
        model: 'deepseek-r1',
        timestamp: Date.now(),
      }
    ],
    
    // Request placeholder (docs pattern)
    requestPlaceholder: (params) => ({
      id: `placeholder_${Date.now()}`,
      role: 'assistant' as const,
      content: 'AI is thinking and analyzing your question...',
      provider: 'ollama' as const,
      model: params.model || 'deepseek-r1',
      timestamp: Date.now(),
    }),
    
    // Request fallback for errors (docs pattern)
    requestFallback: (error, info) => ({
      id: `error_${Date.now()}`,
      role: 'assistant' as const,
      content: `I apologize, but I encountered an error: ${error.message}. Please try rephrasing your question.`,
      provider: 'ollama' as const,
      model: 'deepseek-r1',
      timestamp: Date.now(),
    }),
  }), [ollamaProvider]);

  // Initialize X-SDK chat hook (following docs)
  const {
    onRequest,
    isRequesting,
    messages,
    parsedMessages,
    removeMessage,
    setMessage,
    abort,
  } = useXChat(chatConfig);

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-r1');
  const [enableThinking, setEnableThinking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available models (from docs pattern)
  const models = useMemo(() => [
    { id: 'deepseek-r1', name: 'DeepSeek R1', thinking: true },
    { id: 'qwen3', name: 'Qwen 3', thinking: true },
    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', thinking: true },
    { id: 'llama2', name: 'Llama 2', thinking: false },
    { id: 'codellama', name: 'Code Llama', thinking: false },
  ], []);

  // Navigation menu
  const menuItems: MenuProps['items'] = [
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
    { key: '/ollama-x-sdk', label: 'X-SDK Ollama' },
    { key: '/thinking-demo', label: 'Thinking Demo' },
  ];

  // Handle sending messages (following docs pattern)
  const handleSend = async (content: string) => {
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
      ...(enableThinking && { think: true }),
    };

    onRequest(requestParams);
  };

  // Handle prompt clicks (docs pattern)
  const handlePromptClick = (info: { data: { key?: string } }) => {
    if (info.data.key) {
      handleSend(info.data.key);
    }
  };

  // Example prompts (following docs)
  const examplePrompts = [
    {
      key: 'How many r\'s are in "strawberry"? Think step by step.',
      label: 'Letter Counting',
      description: 'Test thinking with a simple question'
    },
    {
      key: 'Solve this step by step: If a train travels 120 miles in 2 hours, how fast is it going?',
      label: 'Math Problem',
      description: 'Demonstrate step-by-step reasoning'
    },
    {
      key: 'Explain quantum computing in simple terms, then provide a technical explanation.',
      label: 'Complex Explanation',
      description: 'Multi-level explanation capabilities'
    },
  ];

  // Render message component (following docs patterns)
  const renderMessage = (messageInfo: any, index: number) => {
    const message = messageInfo.message;
    const isUser = message.role === 'user';
    const isOllama = message.provider === 'ollama';
    const hasThinking = message.thinking && isOllama;

    return (
      <div key={index} style={{ marginBottom: 16 }}>
        {/* Thinking display for assistant messages */}
        {hasThinking && (
          <div style={{ marginBottom: 8, maxWidth: '80%', marginLeft: isUser ? 'auto' : 0 }}>
            <ThinkingDisplay
              thinking={message.thinking}
              isVisible={true}
              autoExpand={false}
              showCopyButton={true}
            />
          </div>
        )}

        {/* Main message bubble */}
        <Bubble
          role={isUser ? 'user' : 'assistant'}
          variant={isUser ? 'solid' : 'outlined'}
          content={
            message.role === 'assistant' ? (
              <div>
                {isOllama && (
                  <Space size="small" style={{ marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      🤖 {message.model}
                    </Text>
                    {hasThinking && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        💭 Thinking
                      </Text>
                    )}
                  </Space>
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

  // Clear conversation
  const handleNewChat = () => {
    // X-SDK doesn't have a built-in clear, so we remove all messages
    messages.forEach(msg => removeMessage(msg.id));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>X-SDK + Ollama Integration</Title>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)} 
        />
      </Header>

      <Content style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
        {/* Configuration Panel */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <Space size="large">
            <Space>
              <Text strong>Model:</Text>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ padding: '4px 8px' }}
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.thinking ? '(Thinking)' : ''}
                  </option>
                ))}
              </select>
            </Space>
            
            <Space>
              <Text strong>Thinking:</Text>
              <Switch 
                checked={enableThinking} 
                onChange={setEnableThinking}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </Space>

            <Button onClick={handleNewChat} size="small">
              New Chat
            </Button>
          </Space>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ margin: '8px 24px' }}
          />
        )}

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {parsedMessages.length === 0 ? (
            // Welcome state (following docs)
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <div style={{ textAlign: 'center', maxWidth: 600 }}>
                <Welcome
                  title="X-SDK + Ollama Chat"
                  description={`Chat with ${selectedModel} using Ant Design X-SDK patterns`}
                  style={{ marginBottom: 32 }}
                />
                <Prompts 
                  items={examplePrompts}
                  onItemClick={handlePromptClick}
                />
              </div>
            </div>
          ) : (
            // Chat messages
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', background: '#f5f5f5' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {parsedMessages.map(renderMessage)}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <Sender
                placeholder={`Ask ${selectedModel} anything...`}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSend}
                loading={isRequesting}
                style={{ marginBottom: 8 }}
              />
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', textAlign: 'center' }}>
                Powered by Ant Design X-SDK • Following 80% of official documentation patterns
              </Text>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default XSDKChatExample;