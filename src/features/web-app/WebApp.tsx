import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Conversations, Bubble, Sender, Welcome, Prompts } from '@ant-design/x';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

export function WebApp() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Chat with AI' },
    { id: '2', title: 'Code Assistant' },
    { id: '3', title: 'Document Helper' },
  ]);

  const menuItems: MenuProps['items'] = [
    { key: '/desktop', label: 'Desktop Sandbox' },
    { key: '/playground', label: 'Code Playground' },
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
    { key: '/thinking-demo', label: 'Thinking Demo' },
  ];

  const handlePromptClick = (info: { data: { key?: string } }) => {
    console.log('Prompt clicked:', info.data.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite</div>
        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Header>
      <Layout>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg" collapsedWidth={80}
          style={{ background: colorBgContainer, overflow: 'auto', height: 'calc(100vh - 64px)', position: 'sticky', top: 0 }}>
          <div style={{ padding: '12px' }}>
            {conversations.map((conv) => (
              <div key={conv.id} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', marginBottom: '4px', background: '#f5f5f5' }}>
                {conv.title}
              </div>
            ))}
          </div>
        </Sider>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)', background: colorBgContainer }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Welcome title="Welcome to Ant Design X" description="Build AI-driven interfaces with React" style={{ maxWidth: 600, margin: '0 auto' }} />
            <div style={{ marginTop: 32 }}>
              <Prompts items={[
                { key: '1', label: 'Explain Ant Design X features', description: 'Learn about the component library' },
                { key: '2', label: 'Create a simple chat interface', description: 'Build your first AI chat' },
                { key: '3', label: 'Explore documentation', description: 'Read the full documentation' },
              ]} onItemClick={handlePromptClick} />
            </div>
            <div style={{ marginTop: 32 }}>
              <Bubble role="assistant" content="Hello! I'm your AI assistant. How can I help you today?" style={{ maxWidth: 600, margin: '0 auto' }} />
            </div>
            <div style={{ marginTop: 32, maxWidth: 600, margin: '0 auto' }}>
              <Sender placeholder="Type your message..." />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default WebApp;