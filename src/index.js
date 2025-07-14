import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This line imports all the Tailwind styles
import AppRouter from './Router'; // Import the new router
import { register } from './lib/serviceWorker';
import './lib/debugUtils';

// Debugging is automatically initialized by import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

// Register service worker for offline capabilities
register({
  onSuccess: (registration) => {
    console.log('TuiTrade is ready for offline use!');
  },
  onUpdate: (registration) => {
    console.log('New version available! Please refresh to update.');
    // You could show a notification to the user here
  }
});
