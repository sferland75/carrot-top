import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ApiService from './services/ApiService';

// Initialize Electron remote if running in Electron
const isElectron = window && window.process && window.process.type;
if (isElectron) {
  // Initialize remote module
  window.require('@electron/remote/renderer').initialize();
  
  // Expose backup functions to window for Electron menu
  window.exportBackup = async () => {
    const success = await ApiService.exportBackup();
    if (success) {
      alert('Backup exported successfully!');
    } else {
      alert('Failed to export backup.');
    }
  };
  
  window.importBackup = async () => {
    const success = await ApiService.importBackup();
    if (success) {
      alert('Backup imported successfully! The application will now reload.');
      window.location.reload();
    } else {
      alert('Failed to import backup.');
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);