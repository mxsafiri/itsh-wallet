import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add debugging logs
console.log('Main.jsx is executing');
console.log('Root element:', document.getElementById('root'));

// Wrap in try-catch to catch any rendering errors
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
  // Display error on page for debugging
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Error rendering NEDApay app</h1>
      <pre>${error.message}</pre>
      <pre>${error.stack}</pre>
    </div>
  `;
}
