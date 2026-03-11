/**
 * main.tsx
 * Ponto de entrada React. Monta a aplicação no elemento #root do index.html.
 * Em modo Strict, o React renderiza os componentes duas vezes em dev
 * para detectar efeitos colaterais não intencionais.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css'; // Tailwind CSS global

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
