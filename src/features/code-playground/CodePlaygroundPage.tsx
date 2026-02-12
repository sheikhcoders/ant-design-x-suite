import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { CodePlayground } from '../../components/CodePlayground';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

export function CodePlaygroundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
    { key: '/playground', label: 'Code Playground' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite - Code Playground</div>
        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Header>
      
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={3} style={{ marginBottom: 24 }}>Vercel Sandbox Code Playground</Title>
          <p style={{ marginBottom: 24, color: '#666' }}>
            Execute code safely in isolated sandboxes. Supports JavaScript, TypeScript, and Python with full runtime environments.
          </p>
          <CodePlayground height="600px" />
        </div>
      </Content>
    </Layout>
  );
}

export default CodePlaygroundPage;
