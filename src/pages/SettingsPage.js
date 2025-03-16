import React, { useState } from 'react';
import './PageStyles.css';
import { Database, Download, Upload, RefreshCw, AlertTriangle, Settings as SettingsIcon, Trash2, HardDrive, FolderPlus } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import ApiService from '../services/ApiService';

// Add this function to check if running on iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

function SettingsPage() {
  const { isLoading, reloadData, exportBackup, importBackup, resetInventoryOnly } = useInventory();
  const [message, setMessage] = useState(null);
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(ApiService.isFileSystemSupported());
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);

  // Initialize file system
  const handleInitialize = async () => {
    try {
      const result = await ApiService.initialize();
      if (result) {
        setMessage({ type: 'success', text: 'File system initialized successfully!' });
        setIsFileSystemSupported(true);
      } else {
        setMessage({ type: 'warning', text: 'File system initialization failed. Using localStorage fallback.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error initializing file system: ' + error.message });
    }
  };

  // Export backup
  const handleExport = async () => {
    try {
      const result = await exportBackup();
      if (result) {
        setMessage({ type: 'success', text: 'Backup exported successfully!' });
      } else {
        setMessage({ type: 'warning', text: 'Export failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error exporting backup: ' + error.message });
    }
  };

  // Import backup
  const handleImport = async () => {
    try {
      const result = await importBackup();
      if (result) {
        setMessage({ type: 'success', text: 'Backup imported successfully!' });
      } else {
        setMessage({ type: 'warning', text: 'Import failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error importing backup: ' + error.message });
    }
  };
  
  // Reset inventory only
  const handleResetInventory = async () => {
    if (window.confirm('Are you sure you want to reset the inventory? This will delete all current inventory items and reset the day status. Sales history will be preserved.')) {
      try {
        const success = await resetInventoryOnly();
        if (success) {
          setMessage({ type: 'success', text: 'Inventory has been reset successfully. Sales history is preserved.' });
        } else {
          setMessage({ type: 'warning', text: 'Reset failed. Please try again.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error resetting inventory: ' + error.message });
      }
    }
  };
  
  // Show full reset confirmation
  const showFullResetConfirmation = () => {
    setShowFullResetConfirm(true);
  };
  
  // Cancel full reset
  const cancelFullReset = () => {
    setShowFullResetConfirm(false);
  };
  
  // Reset all data
  const handleResetAllData = async () => {
    try {
      const result = await ApiService.resetAllData();
      if (result.success) {
        await reloadData();
        setMessage({ type: 'success', text: 'All data has been reset successfully.' });
        setShowFullResetConfirm(false);
      } else {
        setMessage({ type: 'warning', text: 'Reset failed. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error resetting data: ' + error.message });
      setShowFullResetConfirm(false);
    }
  };

  // Clear message
  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h2><SettingsIcon size={24} style={{ marginRight: '10px' }} /> Application Settings</h2>
      </div>
      
      <div className="settings-container">
        <div className="settings-section">
          <h3 className="settings-section-title">Data Management</h3>
          
          {isIOS() ? (
            <div className="settings-warning">
              <AlertTriangle size={18} style={{ marginRight: '10px', color: '#856404' }} />
              <div>
                <p><strong>iOS Device Detected</strong></p>
                <p>On iOS devices, this app automatically uses your device's local storage to save data. 
                   This means your data stays on your device and is not sent to any server.</p>
                <p>To prevent data loss, please use the backup options below regularly.</p>
              </div>
            </div>
          ) : !isFileSystemSupported ? (
            <div className="settings-warning">
              <AlertTriangle size={18} style={{ marginRight: '10px', color: '#856404' }} />
              <div>
                <p>File System API is not supported in this browser. The app will use localStorage instead.</p>
                <p>This means your data is stored in your browser and may be lost if you clear your browser data.</p>
              </div>
            </div>
          ) : null}
          
          <div className="settings-card">
            <div className="settings-card-header">
              <h4><Database size={18} style={{ marginRight: '8px' }} /> File System Storage</h4>
            </div>
            <div className="settings-card-content">
              {isIOS() ? (
                <p>Your data is automatically saved to your device's local storage. No setup is required.</p>
              ) : (
                <>
                  <p>Initialize file system storage to save your data directly to your computer.</p>
                  <button 
                    className="settings-btn initialize-btn"
                    onClick={handleInitialize}
                    disabled={isLoading}
                  >
                    <Database size={16} style={{ marginRight: '8px' }} />
                    Initialize File System
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="settings-card">
            <div className="settings-card-header">
              <h4><Download size={18} style={{ marginRight: '8px' }} /> Backup Data</h4>
            </div>
            <div className="settings-card-content">
              <p>Save a backup of all your data to a file.</p>
              <button 
                className="settings-btn export-btn"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download size={16} style={{ marginRight: '8px' }} />
                Export Backup
              </button>
            </div>
          </div>
          
          <div className="settings-card">
            <div className="settings-card-header">
              <h4><Upload size={18} style={{ marginRight: '8px' }} /> Restore Data</h4>
            </div>
            <div className="settings-card-content">
              <p>Restore data from a previously exported backup file.</p>
              <button 
                className="settings-btn import-btn"
                onClick={handleImport}
                disabled={isLoading}
              >
                <Upload size={16} style={{ marginRight: '8px' }} />
                Import Backup
              </button>
            </div>
          </div>
          
          <div className="settings-card">
            <div className="settings-card-header">
              <h4><Trash2 size={18} style={{ marginRight: '8px' }} /> Reset Inventory</h4>
            </div>
            <div className="settings-card-content">
              <p>Delete all current inventory items and reset the day status. Sales history will be preserved.</p>
              <button 
                className="settings-btn reset-inventory-btn"
                onClick={handleResetInventory}
                disabled={isLoading}
              >
                <Trash2 size={16} style={{ marginRight: '8px' }} />
                Reset Inventory Only
              </button>
            </div>
          </div>
          
          <div className="settings-card danger-zone">
            <div className="settings-card-header">
              <h4><RefreshCw size={18} style={{ marginRight: '8px' }} /> Full Reset</h4>
            </div>
            <div className="settings-card-content">
              <p>Delete all inventory, sales, and history data. This action cannot be undone.</p>
              
              {!showFullResetConfirm ? (
                <button 
                  className="settings-btn reset-btn"
                  onClick={showFullResetConfirmation}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} style={{ marginRight: '8px' }} />
                  Full Reset (Delete All Data)
                </button>
              ) : (
                <div className="reset-confirmation">
                  <div className="reset-confirmation-message">
                    <AlertTriangle size={20} style={{ marginRight: '8px', color: 'var(--danger)' }} />
                    <p>WARNING: This will permanently delete ALL data including sales history. This action CANNOT be undone.</p>
                  </div>
                  <div className="reset-confirmation-buttons">
                    <button 
                      className="settings-btn cancel-btn"
                      onClick={cancelFullReset}
                    >
                      Cancel
                    </button>
                    <button 
                      className="settings-btn confirm-reset-btn"
                      onClick={handleResetAllData}
                      disabled={isLoading}
                    >
                      Yes, Delete All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {message && (
            <div className={`settings-message ${message.type}`}>
              <p>{message.text}</p>
              <button className="close-message-btn" onClick={clearMessage}>×</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage; 