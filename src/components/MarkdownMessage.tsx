import React from 'react';
import { XMarkdown } from '@ant-design/x-markdown';
import { ExecutableCodeBlock } from './ExecutableCodeBlock';
import { Card, Tag, Space } from 'antd';

interface ExtendedCodeBlockProps {
  language: string;
  children: string;
  className?: string;
  project?: string;
  file?: string;
  type?: string;
  title?: string;
}

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

// Parse extended code block metadata
const parseCodeBlockMeta = (meta: string): Record<string, string> => {
  const metaObj: Record<string, string> = {};
  const matches = meta.match(/(\w+)="([^"]+)"/g);
  if (matches) {
    matches.forEach(match => {
      const [key, value] = match.split('=');
      metaObj[key] = value.replace(/"/g, '');
    });
  }
  return metaObj;
};

// Get type from language and meta
const getCodeType = (language: string, meta: string): { type: string; project?: string; file?: string; title?: string } => {
  const metaObj = parseCodeBlockMeta(meta);
  
  if (metaObj.type) {
    return {
      type: metaObj.type,
      project: metaObj.project,
      file: metaObj.file,
      title: metaObj.title,
    };
  }
  
  // Default types based on language
  switch (language) {
    case 'tsx':
    case 'jsx':
      return { type: 'react', ...metaObj };
    case 'js':
    case 'javascript':
      return { type: 'nodejs', ...metaObj };
    case 'html':
      return { type: 'html', ...metaObj };
    case 'md':
    case 'markdown':
      return { type: 'markdown', ...metaObj };
    case 'mermaid':
      return { type: 'diagram', ...metaObj };
    default:
      return { type: 'code', ...metaObj };
  }
};

// Get color for type tag
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'react': return 'blue';
    case 'nodejs': return 'green';
    case 'html': return 'orange';
    case 'markdown': return 'purple';
    case 'diagram': return 'cyan';
    default: return 'default';
  }
};

// Extended code block with metadata display
const ExtendedCodeBlock: React.FC<ExtendedCodeBlockProps> = ({
  language,
  children,
  className,
  project,
  file,
  type,
  title,
}) => {
  const typeColor = getTypeColor(type || 'code');
  
  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <Space>
          {type && <Tag color={typeColor}>{type}</Tag>}
          {project && <Tag>{project}</Tag>}
          {file && <code style={{ fontSize: '0.9em' }}>{file}</code>}
          {title && <span>{title}</span>}
        </Space>
      }
    >
      <ExecutableCodeBlock language={language} className={className}>
        {children}
      </ExecutableCodeBlock>
    </Card>
  );
};

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
    return token.displayMode 
      ? `<div style="text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 16px 0; overflow-x: auto;"><code style="font-size: 1.1em;">${token.text}</code></div>`
      : `<span style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${token.text}</span>`;
  },
};

// Custom code block component that supports execution and metadata
const CodeBlock = ({ className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  
  // Extract metadata from the code block info
  const metaMatch = className?.match(/language-\w+\s+(.+)/);
  const meta = metaMatch ? metaMatch[1] : '';
  
  const { type, project, file, title } = getCodeType(language, meta);
  
  // Check if this is an executable language
  const executableLanguages = ['javascript', 'js', 'typescript', 'ts', 'python', 'py'];
  const isExecutable = executableLanguages.includes(language);
  const hasMetadata = project || file || type || title;
  
  // If has metadata, use extended code block
  if (hasMetadata) {
    return (
      <ExtendedCodeBlock 
        language={language} 
        className={className}
        project={project}
        file={file}
        type={type}
        title={title}
      >
        {children}
      </ExtendedCodeBlock>
    );
  }
  
  // If executable but no metadata, use executable code block
  if (isExecutable) {
    return (
      <ExecutableCodeBlock language={language} className={className}>
        {children}
      </ExecutableCodeBlock>
    );
  }
  
  // For non-executable languages without metadata, just use the standard pre/code
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
