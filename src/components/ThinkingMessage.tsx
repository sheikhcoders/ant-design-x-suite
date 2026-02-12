import React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { ThinkingDisplay } from './ThinkingDisplay';
import { MarkdownMessage } from './MarkdownMessage';

const { Text } = Typography;

interface ThinkingMessageProps {
  thinking?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: number;
  isStreaming?: boolean;
  className?: string;
  showThinking?: boolean;
}

export const ThinkingMessage: React.FC<ThinkingMessageProps> = ({
  thinking,
  content,
  role,
  timestamp,
  isStreaming = false,
  className = '',
  showThinking = true,
}) => {
  const isAssistant = role === 'assistant';
  const hasThinking = thinking && thinking.trim().length > 0;

  return (
    <div className={`thinking-message ${className}`}>
      <Card
        size="small"
        style={{
          marginBottom: 16,
          backgroundColor: isAssistant ? '#fafafa' : '#ffffff',
          borderColor: isAssistant ? '#d9d9d9' : '#e6f7ff',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Thinking process - only for assistant messages */}
          {isAssistant && hasThinking && showThinking && (
            <ThinkingDisplay
              thinking={thinking}
              isVisible={true}
              autoExpand={false}
              className="assistant-thinking"
            />
          )}

          {/* Message content */}
          <div className="message-content">
            <Space>
              <Tag color={isAssistant ? 'blue' : 'green'}>
                {role === 'assistant' ? 'Assistant' : role === 'system' ? 'System' : 'User'}
              </Tag>
              {isStreaming && <Tag color="orange" size="small">Streaming...</Tag>}
            </Space>
            <div style={{ marginTop: 12 }}>
              <MarkdownMessage content={content} />
            </div>
            {timestamp && (
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: '0.8em' }}>
                  {new Date(timestamp).toLocaleTimeString()}
                </Text>
              </div>
            )}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ThinkingMessage;