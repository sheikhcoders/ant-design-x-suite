import React from 'react';
import { XMarkdown } from '@ant-design/x-markdown';
import { ExecutableCodeBlock } from './ExecutableCodeBlock';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

// LaTeX extension for marked
const latexExtension = {
  name: 'latex',
  level: 'inline' as const,
  start(src: string) {
    return src.match(/\$\$?/)?.index;
  },
  tokenizer(src: string) {
    // Match block math $$...$$
    const blockRule = /^\$\$([^$]+)\$\$/;
    const blockMatch = blockRule.exec(src);
    if (blockMatch) {
      return {
        type: 'latex',
        raw: blockMatch[0],
        text: blockMatch[1].trim(),
        displayMode: true,
      };
    }
    
    // Match inline math $...$
    const inlineRule = /^\$([^$]+)\$/;
    const inlineMatch = inlineRule.exec(src);
    if (inlineMatch) {
      return {
        type: 'latex',
        raw: inlineMatch[0],
        text: inlineMatch[1].trim(),
        displayMode: false,
      };
    }
    return undefined;
  },
  renderer(token: any) {
    // For now, just return the math in a styled span
    // In production, you might want to use a library like KaTeX or MathJax
    return token.displayMode 
      ? `<div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 16px 0;"><code>${token.text}</code></div>`
      : `<span style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${token.text}</span>`;
  },
};

// Custom code block component that supports execution
const CodeBlock = ({ className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  
  // Check if this is an executable language
  const executableLanguages = ['javascript', 'js', 'typescript', 'ts', 'python', 'py'];
  
  if (executableLanguages.includes(language)) {
    return (
      <ExecutableCodeBlock language={language} className={className}>
        {children}
      </ExecutableCodeBlock>
    );
  }
  
  // For non-executable languages, just use the standard pre/code
  return (
    <pre className={className} {...props}>
      <code>{children}</code>
    </pre>
  );
};

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className }) => {
  return (
    <div className={`markdown-content ${className || ''}`}>
      <XMarkdown
        content={content}
        components={{
          code: CodeBlock,
          pre: ({ children }: any) => <>{children}</>,
        }}
        config={{
          extensions: [latexExtension],
          gfm: true,
          breaks: true,
        }}
      />
    </div>
  );
};

export default MarkdownMessage;
