import React, { useState } from 'react';
import { Button, Input, Select, Space, Typography, Alert } from 'antd';
import { ThinkingMessage } from './ThinkingMessage';
import { generateWithThinking, countLettersInWord } from '../services/ollama';

const { TextArea } = Input;
const { Title, Text } = Typography;

export const ThinkingChatExample: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('deepseek-r1');
  const [messages, setMessages] = useState<Array<{
    thinking?: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
  }>>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Example 1: Basic thinking
      const result = await generateWithThinking(input, model);
      
      const assistantMessage = {
        role: 'assistant' as const,
        thinking: result.thinking,
        content: result.content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountLetters = async (word: string, letter: string) => {
    setIsLoading(true);
    try {
      const result = await countLettersInWord(word, letter, model);
      
      const assistantMessage = {
        role: 'assistant' as const,
        thinking: result.thinking,
        content: `${result.content}\n\n**Answer: ${result.answer}**`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Ollama Chat with Thinking Display</Title>
      
      <Alert
        message="Thinking Models"
        description="This demo uses models like deepseek-r1 that provide thinking processes. The thinking will be displayed in a collapsible panel above the response."
        type="info"
        style={{ marginBottom: 24 }}
      />

      {/* Quick examples */}
      <Space style={{ marginBottom: 24 }}>
        <Button 
          onClick={() => handleCountLetters('strawberry', 'r')}
          disabled={isLoading}
        >
          Count 'r' in "strawberry"
        </Button>
        <Button 
          onClick={() => setInput('What is 17 × 23?')}
          disabled={isLoading}
        >
          Math example
        </Button>
        <Button 
          onClick={() => setInput('Explain quantum computing in simple terms')}
          disabled={isLoading}
        >
          Science example
        </Button>
        <Button danger onClick={clearChat} disabled={isLoading}>
          Clear Chat
        </Button>
      </Space>

      {/* Model selection */}
      <Space style={{ marginBottom: 24 }}>
        <Text strong>Model:</Text>
        <Select
          value={model}
          onChange={setModel}
          style={{ width: 200 }}
          disabled={isLoading}
        >
          <Select.Option value="deepseek-r1">DeepSeek R1 (Thinking)</Select.Option>
          <Select.Option value="qwen3">Qwen 3</Select.Option>
          <Select.Option value="llama2">Llama 2</Select.Option>
        </Select>
      </Space>

      {/* Chat input */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything (try models that support thinking like deepseek-r1)..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          type="primary" 
          onClick={handleSend} 
          loading={isLoading}
          disabled={!input.trim()}
        >
          Send
        </Button>
      </Space>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <ThinkingMessage
            key={index}
            role={message.role}
            content={message.content}
            thinking={message.thinking}
            timestamp={message.timestamp}
            showThinking={true}
          />
        ))}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="secondary">AI is thinking...</Text>
        </div>
      )}
    </div>
  );
};

export default ThinkingChatExample;