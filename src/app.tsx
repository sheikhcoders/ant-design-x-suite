import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WebApp } from './features/web-app/WebApp';
import { DocsSite } from './features/docs-site/DocsSite';
import { AiApp } from './features/ai-app/AiApp';
import { CodePlaygroundPage } from './features/code-playground/CodePlaygroundPage';
import { DesktopSandboxPage } from './features/desktop-sandbox/DesktopSandboxPage';
import { ThinkingChatExample } from './components/ThinkingChatExample';
import OllamaXSDKChat from './components/OllamaXSDKChat';
import XSDKChatExample from './components/XSDKChatExample';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<WebApp />} />
      <Route path="/docs" element={<DocsSite />} />
      <Route path="/ai" element={<AiApp />} />
      <Route path="/ollama-x-sdk" element={<OllamaXSDKChat />} />
      <Route path="/x-sdk-demo" element={<XSDKChatExample />} />
      <Route path="/thinking-demo" element={<ThinkingChatExample />} />
      <Route path="/playground" element={<CodePlaygroundPage />} />
      <Route path="/desktop" element={<DesktopSandboxPage />} />
    </Routes>
  );
}

export default App;
