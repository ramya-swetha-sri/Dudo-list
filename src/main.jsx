import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

console.log('🚀 Starting Dudo List app...');

// Store any errors globally
let appError = null;

// Catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  appError = event.error;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
  appError = event.reason;
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: monospace; background: #fee;">ERROR: Root element #root not found in index.html</div>';
  throw new Error('Root element #root not found in index.html');
}

console.log('✓ Root element found');

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
  console.log('✓ App mounted successfully');
} catch (error) {
  console.error('❌ Critical error mounting app:', error);
  const errorMsg = error?.message || 'Unknown error';
  const errorStack = error?.stack || '';
  rootElement.innerHTML = `<div style="padding: 30px; color: #c00; font-family: monospace; font-size: 13px; white-space: pre-wrap; background: #fee; border: 2px solid #c00; border-radius: 8px;">
    <strong>🚨 Application Error</strong>
    =====================
    ${errorMsg}
    
    ${errorStack}
  </div>`;
  throw error;
}
