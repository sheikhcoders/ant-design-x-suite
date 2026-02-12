import React, { useState } from 'react';
import { Button, Space, Card, Tag, message } from 'antd';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { quickExecute, SandboxExecutionResult, Runtime } from '../services/sandbox';

interface ExecutableCodeBlockProps {
  language: string;
  children: string;
  className?: string;
}

const languageToRuntime: Record<string, Runtime> = {
  javascript: 'node24',
  js: 'node24',
  typescript: 'node24',
  ts: 'node24',
  python: 'python3.13',
  py: 'python3.13',
};

export const ExecutableCodeBlock: React.FC<ExecutableCodeBlockProps> = ({
  language,
  children,
  className,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<SandboxExecutionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const canExecute = language in languageToRuntime;
  const runtime = languageToRuntime[language];

  const handleExecute = async () => {
    if (!canExecute) {
      message.warning(`Execution not supported for ${language}`);
      return;
    }

    setIsExecuting(true);
    setResult(null);
    setShowOutput(true);

    try {
      const executionResult = await quickExecute(children, runtime);
      setResult(executionResult);
      
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
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative' }}>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          className={className}
          PreTag="div"
        >
          {children.replace(/\n$/, '')}
        </SyntaxHighlighter>
        
        {canExecute && (
          <Button
            type="primary"
            size="small"
            icon={isExecuting ? <LoadingOutlined /> : <PlayCircleOutlined />}
            onClick={handleExecute}
            loading={isExecuting}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            Run
          </Button>
        )}
      </div>

      {showOutput && result && (
        <Card
          size="small"
          style={{ marginTop: 8, background: '#1e1e1e' }}
          bodyStyle={{ padding: 12 }}
        >
          <Space style={{ marginBottom: 8 }}>
            <Tag color={result.exitCode === 0 ? 'success' : 'error'}>
              Exit: {result.exitCode}
            </Tag>
            <Tag color="blue">{result.duration}ms</Tag>
          </Space>

          {result.stdout && (
            <pre style={{
              background: '#2d2d2d',
              padding: 8,
              borderRadius: 4,
              color: '#4ade80',
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              margin: '8px 0',
            }}>
              {result.stdout}
            </pre>
          )}

          {result.stderr && (
            <pre style={{
              background: '#2d2d2d',
              padding: 8,
              borderRadius: 4,
              color: '#f87171',
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              margin: '8px 0',
            }}>
              {result.stderr}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
};

export default ExecutableCodeBlock;
