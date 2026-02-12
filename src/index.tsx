import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { App } from './app';
import { XProvider } from '@ant-design/x';
import './styles/global.css';
import './styles/markdown.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <XProvider>
          <App />
        </XProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
);