// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import { AppRoot } from '@vkontakte/vkui';
import { App } from './App';

// Инициализация VK Mini App
bridge.send('VKWebAppInit');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoot>
      <App />
    </AppRoot>
  </React.StrictMode>,
);