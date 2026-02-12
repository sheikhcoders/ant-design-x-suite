import React, { useState, useCallback } from 'react';
import { Layout, Menu, theme, Button, Typography, Select, Alert, Space } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Bubble, Sender, Think, Welcome, Prompts } from '@ant-design/x';
import type { MenuProps } from 'antd';
import { 
  streamChatCompletion, 
  convertMessagesToOpenCode, 
  isApiConfigured,
  OpenCodeAPIError 
} from '../../services/opencode';
import { MarkdownMessage } from '../../components/MarkdownMessage';
import { OPENCODE_MODELS } from '../../types';
import type { Message } from '../../types';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL || 'glm-4.7-free';

export function AiApp() {
  const { token: { colorBgContainer } } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState([
    { id: '1', title: 'General Assistant', timestamp: Date.now() },
    { id: '2', title: 'Code Helper', timestamp: Date.now() - 86400000 },
    { id: '3', title: 'Documentation', timestamp: Date.now() - 172800000 },
  ]);

  const menuItems: MenuProps['items'] = [
    { key: '/playground', label: 'Code Playground' },
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
  ];

  const handleSend = useCallback(async (value: string) => {
    if (!value.trim()) return;
    
    if (!isApiConfigured()) {
      setError('OpenCode API key not configured. Please set VITE_OPENCODE_API_KEY in your .env file');
      return;
    }

    // Clear any previous error
    setError(null);
    
    // Add user message
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: value, 
      timestamp: Date.now() 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    setStreamingContent('');

    try {
      const apiMessages = convertMessagesToOpenCode([
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: value }
      ]);

      const stream = streamChatCompletion({
        model: selectedModel,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      let fullContent = '';
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
        metadata: {
          model: selectedModel,
        }
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
      
    } catch (err) {
      console.error('Chat error:', err);
      if (err instanceof OpenCodeAPIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsThinking(false);
    }
  }, [messages, selectedModel]);

  const handlePromptClick = (info: { data: { key?: string } }) => {
    if (info.data.key) {
      handleSend(`Tell me about: ${info.data.key}`);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
  };

  const currentModel = OPENCODE_MODELS.find(m => m.id === selectedModel);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite - AI Chat</div>
        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Header>
      
      {error && (
        <Alert
          message="API Error"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ margin: '0 24px', marginTop: 16 }}
        />
      )}
      
      <Layout>
        <Sider 
          width={300} 
          style={{ 
            background: colorBgContainer, 
            overflow: 'auto', 
            height: 'calc(100vh - 64px)', 
            position: 'sticky', 
            top: 0,
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <div style={{ padding: '16px' }}>
            <Button 
              type="primary" 
              block 
              style={{ marginBottom: 16 }}
              onClick={handleNewChat}
            >
              New Chat
            </Button>
            
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                Model
              </Text>
              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                style={{ width: '100%' }}
                placeholder="Select model"
              >
                {OPENCODE_MODELS.map((model) => (
                  <Option key={model.id} value={model.id}>
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Text strong>{model.name}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {model.description}
                      </Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  style={{ 
                    padding: '12px', 
                    background: '#f5f5f5', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e6f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
                >
                  <div style={{ fontWeight: 500 }}>{conv.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sider>
        
        <Content 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '24px', 
            minHeight: 'calc(100vh - 64px)', 
            background: colorBgContainer 
          }}
        >
          <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
            {messages.length === 0 && !streamingContent ? (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%' 
                }}
              >
                <Welcome 
                  title="AI Assistant" 
                  description={`Chat with ${currentModel?.name || 'AI'} via OpenCode`}
                  style={{ maxWidth: 600, margin: '0 auto 32px' }} 
                />
                <Prompts 
                  items={[
                    { key: '1', label: 'Explain components', description: 'Learn about Bubble, Sender, Think' },
                    { key: '2', label: 'Show code examples', description: 'See how to build AI interfaces' },
                    { key: '3', label: 'Best practices', description: 'Discover design patterns' },
                  ]} 
                  onItemClick={handlePromptClick} 
                />
              </div>
            ) : (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {messages.map((message) => (
                  <div key={message.id} style={{ marginBottom: 16 }}>
                    <Bubble 
                      role={message.role === 'user' ? 'user' : 'assistant'} 
                      content={
                        message.role === 'assistant' 
                          ? <MarkdownMessage content={message.content} />
                          : message.content
                      }
                      style={{ 
                        maxWidth: '80%', 
                        background: message.role === 'user' ? '#1677ff' : undefined, 
                        color: message.role === 'user' ? '#fff' : undefined, 
                        marginLeft: message.role === 'user' ? 'auto' : 0 
                      }} 
                    />
                  </div>
                ))}
                
                {streamingContent && (
                  <div style={{ marginBottom: 16 }}>
                    <Bubble 
                      role="assistant" 
                      content={<MarkdownMessage content={streamingContent} />}
                      style={{ maxWidth: '80%' }}
                    />
                  </div>
                )}
                
                {isThinking && !streamingContent && (
                  <div style={{ marginBottom: 16 }}>
                    <Think loading />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <Sender 
              placeholder="Type your message..." 
              value={inputValue} 
              onChange={setInputValue} 
              onSubmit={handleSend}
              loading={isThinking}
              style={{ background: colorBgContainer }} 
            />
            <Text type="secondary" style={{ fontSize: '11px', marginTop: 8, display: 'block', textAlign: 'center' }}>
              Using {currentModel?.name || selectedModel} via OpenCode API
            </Text>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AiApp;
