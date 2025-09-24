import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}

enableMocking()
  .then(() => {
    const root = ReactDOM.createRoot(
      document.getElementById('root')
    );
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize MSW:', error);
    // Still render the app even if MSW fails
    const root = ReactDOM.createRoot(
      document.getElementById('root')
    );
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });