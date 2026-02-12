import React, { useState, useCallback } from 'react';
import { Layout, Menu, theme, Button, Typography } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Bubble, Sender, Think, Conversations, Welcome, Prompts, XProvider } from '@ant-design/x';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

const demoMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello! Can you help me understand Ant Design X?', timestamp: Date.now() },
  { id: '2', role: 'assistant', content: 'Of course! Ant Design X is a comprehensive toolkit for building AI-driven interfaces.', timestamp: Date.now() + 1000 },
];

export function AiApp() {
  const { token: { colorBgContainer } } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const menuItems: MenuProps['items'] = [
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
  ];

  const handleSend = useCallback((value: string) => {
    if (!value.trim()) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: value, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    setTimeout(() => {
      const assistantMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: `I understand you're asking about "${value}". Ant Design X provides a rich set of components for building AI applications.`, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 2000);
  }, []);

  const handlePromptClick = (info: { data: { key?: string } }) => {
    handleSend(`Tell me about: ${info.data.key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite - AI Chat</div>
        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Header>
      <Layout>
        <Sider width={280} style={{ background: colorBgContainer, overflow: 'auto', height: 'calc(100vh - 64px)', position: 'sticky', top: 0 }}>
          <div style={{ padding: '16px' }}>
            <Button type="primary" block style={{ marginBottom: 16 }}>New Chat</Button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['General Assistant', 'Code Helper', 'Documentation'].map((title, index) => (
                <div key={index} style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 500 }}>{title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{index === 0 ? 'Today' : index === 1 ? 'Yesterday' : '2 days ago'}</div>
                </div>
              ))}
            </div>
          </div>
        </Sider>
        <Content style={{ display: 'flex', flexDirection: 'column', padding: '24px', minHeight: 'calc(100vh - 64px)', background: colorBgContainer }}>
          <div style={{ flex: 1, overflow: 'auto', paddingBottom: 16 }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Welcome title="AI Assistant" description="Ask me anything about Ant Design X" style={{ maxWidth: 600, margin: '0 auto 32px' }} />
                <Prompts items={[
                  { key: '1', label: 'Explain components', description: 'Learn about Bubble, Sender, Think' },
                  { key: '2', label: 'Show code examples', description: 'See how to build AI interfaces' },
                  { key: '3', label: 'Best practices', description: 'Discover design patterns' },
                ]} onItemClick={handlePromptClick} />
              </div>
            ) : (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {messages.map((message) => (
                  <div key={message.id} style={{ marginBottom: 16 }}>
                    <Bubble role={message.role === 'user' ? 'user' : 'assistant'} content={message.content}
                      style={{ maxWidth: '80%', background: message.role === 'user' ? '#1677ff' : undefined, color: message.role === 'user' ? '#fff' : undefined, marginLeft: message.role === 'user' ? 'auto' : 0 }} />
                  </div>
                ))}
                {isThinking && <div style={{ marginBottom: 16 }}><Think loading /></div>}
              </div>
            )}
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <Sender placeholder="Type your message..." value={inputValue} onChange={setInputValue} onSubmit={handleSend} style={{ background: colorBgContainer }} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AiApp;