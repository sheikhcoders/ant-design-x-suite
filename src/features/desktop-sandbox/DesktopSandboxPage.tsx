import React, { useState, useRef } from 'react';
import { Layout, Menu, Typography, Card, Button, Select, Space, Input, message, Alert, Row, Col, Switch, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DesktopOutlined, 
  PlayCircleOutlined, 
  StopOutlined, 
  VideoCameraOutlined,
  CameraOutlined,
  AppstoreOutlined,
  CodeOutlined,
  FileOutlined,
  AimOutlined
} from '@ant-design/icons';
import { desktopSandboxManager, quickStartDesktop, DesktopSandboxInfo } from '../../services/desktopSandbox';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AVAILABLE_APPS = [
  { value: 'google-chrome', label: 'Google Chrome' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'vscode', label: 'VS Code' },
  { value: 'gimp', label: 'GIMP' },
  { value: 'libreoffice', label: 'LibreOffice' },
  { value: 'vlc', label: 'VLC Media Player' },
];

export function DesktopSandboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedApp, setSelectedApp] = useState('google-chrome');
  const [sandboxInfo, setSandboxInfo] = useState<DesktopSandboxInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const [textToType, setTextToType] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [viewOnly, setViewOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'control' | 'files'>('stream');
  const screenshotRef = useRef<HTMLImageElement>(null);

  const menuItems: MenuProps['items'] = [
    { key: '/', label: 'Home' },
    { key: '/docs', label: 'Documentation' },
    { key: '/ai', label: 'AI Chat' },
    { key: '/playground', label: 'Code Playground' },
    { key: '/desktop', label: 'Desktop Sandbox' },
  ];

  const handleCreateSandbox = async () => {
    setIsLoading(true);
    try {
      const info = await quickStartDesktop(selectedApp, true, viewOnly);
      setSandboxInfo(info);
      message.success(`Desktop sandbox created with ${selectedApp}!`);
    } catch (error) {
      message.error('Failed to create desktop sandbox');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKillSandbox = async () => {
    if (sandboxInfo) {
      try {
        await desktopSandboxManager.killSandbox(sandboxInfo.id);
        setSandboxInfo(null);
        message.success('Desktop sandbox terminated');
      } catch (error) {
        message.error('Failed to terminate sandbox');
      }
    }
  };

  const handleExecuteCommand = async () => {
    if (!sandboxInfo || !customCommand.trim()) return;
    
    try {
      const result = await desktopSandboxManager.executeCommand(sandboxInfo.id, customCommand);
      message.success('Command executed');
      console.log('Command result:', result);
    } catch (error) {
      message.error('Failed to execute command');
    }
  };

  const handleScreenshot = async () => {
    if (!sandboxInfo) return;
    
    try {
      const imageBuffer = await desktopSandboxManager.screenshot(sandboxInfo.id);
      // Convert Uint8Array to blob and create URL
      const blob = new Blob([imageBuffer as unknown as BlobPart], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Screenshot captured and downloaded');
    } catch (error) {
      message.error('Failed to capture screenshot');
    }
  };

  const handleTypeText = async () => {
    if (!sandboxInfo || !textToType.trim()) return;
    
    try {
      await desktopSandboxManager.write(sandboxInfo.id, textToType, {
        chunkSize: 50,
        delayInMs: 25
      });
      message.success('Text typed successfully');
      setTextToType('');
    } catch (error) {
      message.error('Failed to type text');
    }
  };

  const handlePressKey = async (key: string | string[]) => {
    if (!sandboxInfo) return;
    
    try {
      await desktopSandboxManager.press(sandboxInfo.id, key);
      message.success(`Pressed ${Array.isArray(key) ? key.join('+') : key}`);
    } catch (error) {
      message.error('Failed to press key');
    }
  };

  const handleMouseClick = async (type: 'left' | 'right' | 'middle' | 'double') => {
    if (!sandboxInfo) return;
    
    try {
      if (type === 'double') {
        await desktopSandboxManager.doubleClick(sandboxInfo.id);
      } else {
        await desktopSandboxManager.leftClick(sandboxInfo.id);
      }
      message.success(`${type} click performed`);
    } catch (error) {
      message.error('Failed to perform mouse click');
    }
  };

  const handleWriteFile = async () => {
    if (!sandboxInfo || !filePath.trim() || !fileContent.trim()) return;
    
    try {
      await desktopSandboxManager.writeFile(sandboxInfo.id, filePath, fileContent);
      message.success(`File written to ${filePath}`);
      setFilePath('');
      setFileContent('');
    } catch (error) {
      message.error('Failed to write file');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Ant Design X Suite - Desktop Sandbox</div>
        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Header>
      
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={3} style={{ marginBottom: 24 }}>
            <DesktopOutlined style={{ marginRight: 12 }} />
            E2B Desktop Sandbox
          </Title>
          
          <Alert
            message="Desktop Sandbox"
            description="Run GUI applications like Chrome, VS Code, Firefox in isolated cloud environments with full mouse, keyboard, and file control."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card title="Create Desktop Environment" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text strong>Select Application:</Text>
                <Select
                  value={selectedApp}
                  onChange={setSelectedApp}
                  style={{ width: 200 }}
                >
                  {AVAILABLE_APPS.map(app => (
                    <Option key={app.value} value={app.value}>{app.label}</Option>
                  ))}
                </Select>

                <Space>
                  <Text>View Only:</Text>
                  <Switch checked={viewOnly} onChange={setViewOnly} />
                </Space>
                
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleCreateSandbox}
                  loading={isLoading}
                  disabled={sandboxInfo !== null}
                >
                  Launch Desktop
                </Button>
                
                {sandboxInfo && (
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={handleKillSandbox}
                  >
                    Terminate
                  </Button>
                )}

                {sandboxInfo && (
                  <Button
                    icon={<CameraOutlined />}
                    onClick={handleScreenshot}
                  >
                    Screenshot
                  </Button>
                )}
              </Space>

              {sandboxInfo && (
                <div style={{ marginTop: 16 }}>
                  <Alert
                    message="Sandbox Active"
                    description={
                      <Space direction="vertical">
                        <Text>Sandbox ID: <code>{sandboxInfo.id}</code></Text>
                        {sandboxInfo.streamUrl && (
                          <Text>
                            Stream URL: <a href={sandboxInfo.streamUrl} target="_blank" rel="noopener noreferrer">Open in new tab</a>
                          </Text>
                        )}
                        <Text>Status: {sandboxInfo.isStreaming ? 'Streaming' : 'Not streaming'}</Text>
                        <Text>Type: {viewOnly ? 'View Only' : 'Interactive'}</Text>
                      </Space>
                    }
                    type="success"
                    showIcon
                  />
                </div>
              )}
            </Space>
          </Card>

          {sandboxInfo && (
            <Row gutter={24}>
              <Col span={16}>
                <Card 
                  title="Live Stream" 
                  style={{ marginBottom: 24 }}
                  extra={
                    <Space>
                      <Button 
                        type={activeTab === 'stream' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('stream')}
                      >
                        Stream
                      </Button>
                      <Button 
                        type={activeTab === 'control' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('control')}
                      >
                        Controls
                      </Button>
                      <Button 
                        type={activeTab === 'files' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('files')}
                      >
                        Files
                      </Button>
                    </Space>
                  }
                >
                  {activeTab === 'stream' && (
                    <div style={{ 
                      width: '100%', 
                      height: 600, 
                      background: '#000',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}>
                      {sandboxInfo.streamUrl ? (
                        <iframe
                          src={sandboxInfo.streamUrl}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          title="Desktop Stream"
                          allow="fullscreen"
                        />
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: '100%',
                          color: '#fff'
                        }}>
                          <Text style={{ color: '#fff' }}>Stream not available</Text>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'control' && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                       {/* Mouse Controls */}
                      <Card size="small" title={<><AimOutlined /> Mouse Controls</>}>
                        <Space>
                          <Button onClick={() => handleMouseClick('left')}>Left Click</Button>
                          <Button onClick={() => handleMouseClick('right')}>Right Click</Button>
                          <Button onClick={() => handleMouseClick('middle')}>Middle Click</Button>
                          <Button onClick={() => handleMouseClick('double')}>Double Click</Button>
                        </Space>
                      </Card>

                       {/* Keyboard Controls */}
                      <Card size="small" title={<><CodeOutlined /> Keyboard Controls</>}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space>
                            <Input
                              placeholder="Text to type..."
                              value={textToType}
                              onChange={(e) => setTextToType(e.target.value)}
                              onPressEnter={handleTypeText}
                              style={{ width: 300 }}
                            />
                            <Button onClick={handleTypeText}>Type Text</Button>
                          </Space>
                          <Space>
                            <Text>Quick Keys:</Text>
                            <Button size="small" onClick={() => handlePressKey('enter')}>Enter</Button>
                            <Button size="small" onClick={() => handlePressKey('space')}>Space</Button>
                            <Button size="small" onClick={() => handlePressKey('backspace')}>Backspace</Button>
                            <Button size="small" onClick={() => sandboxInfo && desktopSandboxManager.press(sandboxInfo.id, ['ctrl', 'c'])}>Ctrl+C</Button>
                            <Button size="small" onClick={() => sandboxInfo && desktopSandboxManager.press(sandboxInfo.id, ['ctrl', 'v'])}>Ctrl+V</Button>
                          </Space>
                        </Space>
                      </Card>

                       {/* Command Execution */}
                      <Card size="small" title={<><CodeOutlined /> Command Execution</>}>
                        <Space>
                          <Input
                            placeholder="Enter command..."
                            value={customCommand}
                            onChange={(e) => setCustomCommand(e.target.value)}
                            onPressEnter={handleExecuteCommand}
                            style={{ width: 300 }}
                          />
                          <Button type="primary" onClick={handleExecuteCommand}>Execute</Button>
                        </Space>
                      </Card>
                    </Space>
                  )}

                  {activeTab === 'files' && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Card size="small" title={<><FileOutlined /> File Operations</>}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Input
                            placeholder="File path (e.g., /home/user/document.txt)"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                          />
                          <TextArea
                            placeholder="File content..."
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            rows={6}
                          />
                          <Button type="primary" onClick={handleWriteFile}>Write File</Button>
                        </Space>
                      </Card>
                    </Space>
                  )}
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Quick Actions" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<AppstoreOutlined />} onClick={() => handlePressKey(['command'])}>
                      Open App Menu
                    </Button>
                    <Button block icon={<CameraOutlined />} onClick={handleScreenshot}>
                      Take Screenshot
                    </Button>
                    <Button block onClick={() => sandboxInfo && desktopSandboxManager.press(sandboxInfo.id, ['ctrl', 'alt', 't'])}>
                      Open Terminal
                    </Button>
                    <Button block onClick={() => sandboxInfo && desktopSandboxManager.press(sandboxInfo.id, ['alt', 'f4'])}>
                      Close Window
                    </Button>
                  </Space>
                </Card>

                <Card title="Info" size="small" style={{ marginTop: 16 }}>
                  <Space direction="vertical">
                    <Text type="secondary">Environment: Linux + Xfce</Text>
                    <Text type="secondary">Resolution: 1920x1080</Text>
                    <Text type="secondary">Available: GUI apps, file system, terminal</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default DesktopSandboxPage;
