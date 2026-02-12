import React, { useState } from 'react';
import { Layout, Menu, theme, Typography } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { XMarkdown } from '@ant-design/x-markdown';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

const documentationContent = `
# Ant Design X Documentation

## Introduction

Ant Design X is a comprehensive toolkit for AI applications, integrating a UI component library, streaming Markdown rendering engine, and AI SDK.

## Features

### 🌈 Rich Components
- **Bubble**: Message bubbles for conversations
- **Conversations**: Multi-agent conversation management
- **Think**: AI thinking process visualization

### 🚀 High Performance
- Built on Vite for fast development
- Streaming-friendly Markdown rendering
- Optimized for large-scale applications

### 🔧 Extensible
- Plugin system for custom functionality
- Theme customization support
- Modular architecture

## Getting Started

\`\`\`bash
npm install @ant-design/x @ant-design/x-markdown @ant-design/x-sdk
\`\`\`

## Example

\`\`\`tsx
import { Bubble, Sender, XProvider } from '@ant-design/x';

const App = () => (
  <XProvider>
    <Bubble content="Hello World!" />
    <Sender placeholder="Type a message..." />
  </XProvider>
);
\`\`\`
`;

export function DocsSite() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: 'Home',
    },
    {
      key: '/docs',
      label: 'Documentation',
    },
    {
      key: '/ai',
      label: 'AI Chat',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite - Docs</div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Header>
      <Layout>
        <Sider
          width={250}
          style={{ background: colorBgContainer, overflow: 'auto', height: 'calc(100vh - 64px)', position: 'sticky', top: 0 }}
        >
          <div style={{ padding: '16px' }}>
            <Title level={5}>Documentation</Title>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Introduction', 'Getting Started', 'Components', 'API Reference', 'Examples', 'FAQ'].map((item, index) => (
                <li key={index} style={{ padding: '8px 0', cursor: 'pointer', color: '#1677ff' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Sider>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <XMarkdown content={documentationContent} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DocsSite;