import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WebApp } from './features/web-app/WebApp';
import { DocsSite } from './features/docs-site/DocsSite';
import { AiApp } from './features/ai-app/AiApp';
import { CodePlaygroundPage } from './features/code-playground/CodePlaygroundPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<WebApp />} />
      <Route path="/docs" element={<DocsSite />} />
      <Route path="/ai" element={<AiApp />} />
      <Route path="/playground" element={<CodePlaygroundPage />} />
    </Routes>
  );
}

export default App;
