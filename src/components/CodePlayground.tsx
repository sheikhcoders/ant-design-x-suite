import React, { useState, useCallback } from 'react';
import { Card, Select, Button, Space, Typography, Tabs, message } from 'antd';
import { PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { quickExecute, sandboxManager, Runtime, SandboxExecutionResult } from '../services/sandbox';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface CodePlaygroundProps {
  initialCode?: string;
  language?: 'javascript' | 'typescript' | 'python';
  height?: string;
  onExecute?: (result: SandboxExecutionResult) => void;
}

const defaultCode = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  typescript: `// TypeScript Example (runs as JavaScript)
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,
  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# List comprehension example
squares = [x**2 for x in range(5)]
print(f"\\nSquares: {squares}")`,
};

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode,
  language = 'javascript',
  height = '400px',
  onExecute,
}) => {
  const [code, setCode] = useState(initialCode || defaultCode[language]);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [runtime, setRuntime] = useState<Runtime>('node24');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<SandboxExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleLanguageChange = (newLang: 'javascript' | 'typescript' | 'python') => {
    setCurrentLanguage(newLang);
    setCode(defaultCode[newLang]);
    setRuntime(newLang === 'python' ? 'python3.13' : 'node24');
  };

  const handleExecute = useCallback(async () => {
    setIsExecuting(true);
    setResult(null);
    
    try {
      const executionResult = await quickExecute(code, runtime);
      setResult(executionResult);
      setActiveTab('2');
      onExecute?.(executionResult);
      
      if (executionResult.exitCode === 0) {
        message.success('Code executed successfully!');
      } else {
        message.error('Code execution failed');
      }
    } catch (error) {
      message.error('Failed to execute code');
      setResult({
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        duration: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  }, [code, runtime, onExecute]);

  const handleCreateSession = useCallback(async () => {
    try {
      const newSessionId = await sandboxManager.createSession(runtime);
      setSessionId(newSessionId);
      message.success('Sandbox session created!');
    } catch (error) {
      message.error('Failed to create sandbox session');
    }
  }, [runtime]);

  const getMonacoLanguage = () => {
    switch (currentLanguage) {
      case 'typescript':
        return 'typescript';
      case 'python':
        return 'python';
      default:
        return 'javascript';
    }
  };

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          <Title level={5} style={{ margin: 0 }}>Code Playground</Title>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={currentLanguage}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
          >
            <Option value="javascript">JavaScript</Option>
            <Option value="typescript">TypeScript</Option>
            <Option value="python">Python</Option>
          </Select>
          
          <Select
            value={runtime}
            onChange={setRuntime}
            style={{ width: 140 }}
          >
            <Option value="node24">Node.js 24</Option>
            <Option value="node22">Node.js 22</Option>
            <Option value="python3.13">Python 3.13</Option>
          </Select>
          
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleExecute}
            loading={isExecuting}
          >
            Run
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Editor" key="1">
          <Editor
            height={height}
            language={getMonacoLanguage()}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </TabPane>
        
        <TabPane tab="Output" key="2">
          <div style={{ height, overflow: 'auto', background: '#1e1e1e', padding: 16 }}>
            {result ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ 
                    color: result.exitCode === 0 ? '#4ade80' : '#f87171',
                    background: '#2d2d2d',
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginRight: 8
                  }}>
                    Exit Code: {result.exitCode}
                  </Text>
                  <Text style={{ 
                    color: '#60a5fa',
                    background: '#2d2d2d',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}>
                    Duration: {result.duration}ms
                  </Text>
                </div>
                
                {result.stdout && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ color: '#4ade80', display: 'block', marginBottom: 8 }}>
                      STDOUT:
                    </Text>
                    <pre style={{ 
                      background: '#2d2d2d', 
                      padding: 12, 
                      borderRadius: 4,
                      color: '#4ade80',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                      {result.stdout}
                    </pre>
                  </div>
                )}
                
                {result.stderr && (
                  <div>
                    <Text strong style={{ color: '#f87171', display: 'block', marginBottom: 8 }}>
                      STDERR:
                    </Text>
                    <pre style={{ 
                      background: '#2d2d2d', 
                      padding: 12, 
                      borderRadius: 4,
                      color: '#f87171',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                      {result.stderr}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <Text style={{ color: '#666' }}>
                Run code to see output...
              </Text>
            )}
          </div>
        </TabPane>
        
        <TabPane tab="Session" key="3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button onClick={handleCreateSession} icon={<ThunderboltOutlined />}>
                Create Persistent Session
              </Button>
            </Space>
            
            {sessionId && (
              <div style={{ 
                padding: 12, 
                background: '#f0f0f0', 
                borderRadius: 4,
                marginTop: 8
              }}>
                <Text type="secondary">Session ID: </Text>
                <Text code copyable>{sessionId}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Sessions persist for 30 minutes of inactivity
                </Text>
              </div>
            )}
            
            <div style={{ marginTop: 16 }}>
              <Text strong>Features:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Execute JavaScript, TypeScript, and Python code</li>
                <li>Isolated sandbox environments (Amazon Linux 2023)</li>
                <li>Real-time output streaming</li>
                <li>Exit code and timing information</li>
                <li>Persistent sessions for multi-step workflows</li>
              </ul>
            </div>
          </Space>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CodePlayground;
