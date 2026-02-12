import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag, Collapse } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface ThinkingDisplayProps {
  thinking: string;
  isVisible?: boolean;
  className?: string;
  showCopyButton?: boolean;
  autoExpand?: boolean;
}

export const ThinkingDisplay: React.FC<ThinkingDisplayProps> = ({
  thinking,
  isVisible = true,
  className = '',
  showCopyButton = true,
  autoExpand = false,
}) => {
  const [expanded, setExpanded] = useState(autoExpand);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoExpand) {
      setExpanded(true);
    }
  }, [autoExpand]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(thinking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy thinking:', err);
    }
  };

  const toggleVisibility = () => {
    setExpanded(!expanded);
  };

  if (!thinking || !isVisible) {
    return null;
  }

  return (
    <Card
      size="small"
      className={`thinking-display ${className}`}
      style={{
        marginBottom: 16,
        backgroundColor: '#f0f2f5',
        borderColor: '#d9d9d9',
      }}
      title={
        <Space>
          <Tag color="purple">Thinking Process</Tag>
          <Button
            size="small"
            icon={expanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={toggleVisibility}
            type="text"
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
          {showCopyButton && (
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              type="text"
              loading={copied}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </Space>
      }
    >
      <Collapse
        activeKey={expanded ? ['thinking'] : []}
        onChange={() => setExpanded(!expanded)}
        ghost
        size="small"
      >
        <Panel
          key="thinking"
          header=""
          style={{ border: 'none', padding: 0 }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 6,
              padding: 16,
              fontFamily: 'monospace',
              fontSize: '0.9em',
              lineHeight: 1.6,
              maxHeight: expanded ? 'none' : '100px',
              overflow: expanded ? 'visible' : 'hidden',
              position: 'relative',
            }}
          >
            <Paragraph
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {thinking}
            </Paragraph>
            {!expanded && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30px',
                  background: 'linear-gradient(transparent, rgba(255, 255, 255, 0.9))',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ThinkingDisplay;