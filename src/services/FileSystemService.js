/**
 * File System Service
 * 
 * This service provides file system access for the application.
 * It uses different approaches based on the environment:
 * 1. Electron: Uses Node.js fs module
 * 2. Web Browser with File System Access API: Uses modern browser APIs
 * 3. Fallback: Uses localStorage
 */

// Check if running in Electron
const isElectron = () => {
  return window && window.process && window.process.type;
};

// Check if File System Access API is supported
const isFileSystemAccessSupported = () => {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
};

// Check if running on iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Default directory handle for our app
let appDirectoryHandle = null;

// For Electron: Get the app data path
const getAppDataPath = () => {
  if (isElectron()) {
    const { app } = window.require('@electron/remote');
    return app.getPath('userData');
  }
  return null;
};

/**
 * Initialize the file system service
 */
const initializeFileSystem = async () => {
  // If running in Electron, we're already set up
  if (isElectron()) {
    console.log('Running in Electron - using Node.js file system');
    return true;
  }
  
  // Always use localStorage on iOS
  if (isIOS()) {
    console.warn('Running on iOS - using localStorage for data storage.');
    return false;
  }

  if (!isFileSystemAccessSupported()) {
    console.warn('File System Access API is not supported in this browser. Using localStorage fallback.');
    return false;
  }

  try {
    // Request a directory from the user
    appDirectoryHandle = await window.showDirectoryPicker({
      id: 'carrot-top-data',
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    // Store the directory permission
    localStorage.setItem('hasFileSystemPermission', 'true');
    return true;
  } catch (error) {
    console.error('Error initializing file system:', error);
    return false;
  }
};

/**
 * Save data to a file
 */
const saveToFile = async (filename, data) => {
  // If running in Electron, use Node.js fs
  if (isElectron()) {
    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const appDataPath = getAppDataPath();
      const filePath = path.join(appDataPath, `${filename}.json`);
      
      // Create directory if it doesn't exist
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true, method: 'electron' };
    } catch (error) {
      console.error(`Error saving to file ${filename} in Electron:`, error);
      
      // Fallback to localStorage
      localStorage.setItem(filename, JSON.stringify(data));
      return { success: true, method: 'localStorage' };
    }
  }
  
  // Always use localStorage on iOS
  if (isIOS()) {
    localStorage.setItem(filename, JSON.stringify(data));
    return { success: true, method: 'localStorage' };
  }

  if (!isFileSystemAccessSupported()) {
    // Fallback to localStorage
    localStorage.setItem(filename, JSON.stringify(data));
    return { success: true, method: 'localStorage' };
  }

  // Ensure we have a directory handle
  if (!appDirectoryHandle) {
    const initialized = await initializeFileSystem();
    if (!initialized) {
      // Fallback to localStorage if initialization fails
      localStorage.setItem(filename, JSON.stringify(data));
      return { success: true, method: 'localStorage' };
    }
  }

  try {
    // Create or get the file
    const fileHandle = await appDirectoryHandle.getFileHandle(`${filename}.json`, { create: true });
    
    // Create a writable stream
    const writable = await fileHandle.createWritable();
    
    // Write the data as JSON
    await writable.write(JSON.stringify(data, null, 2));
    
    // Close the file
    await writable.close();
    
    return { success: true, method: 'fileSystem' };
  } catch (error) {
    console.error(`Error saving to file ${filename}:`, error);
    
    // Fallback to localStorage
    localStorage.setItem(filename, JSON.stringify(data));
    return { success: true, method: 'localStorage' };
  }
};

/**
 * Load data from a file
 */
const loadFromFile = async (filename, defaultValue = null) => {
  // If running in Electron, use Node.js fs
  if (isElectron()) {
    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const appDataPath = getAppDataPath();
      const filePath = path.join(appDataPath, `${filename}.json`);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
      } else {
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error loading file ${filename} in Electron:`, error);
      
      // Fallback to localStorage
      const data = localStorage.getItem(filename);
      return data ? JSON.parse(data) : defaultValue;
    }
  }
  
  // Always use localStorage on iOS
  if (isIOS()) {
    const data = localStorage.getItem(filename);
    return data ? JSON.parse(data) : defaultValue;
  }

  if (!isFileSystemAccessSupported()) {
    // Fallback to localStorage
    const data = localStorage.getItem(filename);
    return data ? JSON.parse(data) : defaultValue;
  }

  // Ensure we have a directory handle
  if (!appDirectoryHandle) {
    const hasPermission = localStorage.getItem('hasFileSystemPermission') === 'true';
    
    if (hasPermission) {
      try {
        await initializeFileSystem();
      } catch (error) {
        // Fallback to localStorage if initialization fails
        const data = localStorage.getItem(filename);
        return data ? JSON.parse(data) : defaultValue;
      }
    } else {
      // Fallback to localStorage if no permission
      const data = localStorage.getItem(filename);
      return data ? JSON.parse(data) : defaultValue;
    }
  }

  try {
    // Try to get the file
    const fileHandle = await appDirectoryHandle.getFileHandle(`${filename}.json`);
    
    // Get the file contents
    const file = await fileHandle.getFile();
    
    // Read the file as text
    const contents = await file.text();
    
    // Parse and return the data
    return JSON.parse(contents);
  } catch (error) {
    // If file doesn't exist or other error
    console.warn(`File ${filename}.json not found or error reading:`, error);
    
    // Fallback to localStorage
    const data = localStorage.getItem(filename);
    return data ? JSON.parse(data) : defaultValue;
  }
};

/**
 * Export a backup of all data
 */
const exportBackup = async () => {
  // If running in Electron, use Node.js dialog
  if (isElectron()) {
    try {
      const { dialog } = window.require('@electron/remote');
      const fs = window.require('fs');
      
      // Collect all data
      const inventory = await loadFromFile('inventory', []);
      const sales = await loadFromFile('sales', { dailySales: [], nextId: 1 });
      const salesHistory = await loadFromFile('sales_history', []);
      const inventoryHistory = await loadFromFile('inventory_history', []);
      
      // Create backup object
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          inventory,
          sales,
          salesHistory,
          inventoryHistory
        }
      };
      
      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Backup',
        defaultPath: `carrot-top-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });
      
      if (filePath) {
        // Write the file
        fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error exporting backup in Electron:', error);
      return false;
    }
  }
  
  if (!isFileSystemAccessSupported()) {
    alert('File System Access API is not supported in this browser. Cannot export backup.');
    return false;
  }

  try {
    // Collect all data
    const inventory = await loadFromFile('inventory', []);
    const sales = await loadFromFile('sales', { dailySales: [], nextId: 1 });
    const salesHistory = await loadFromFile('sales_history', []);
    const inventoryHistory = await loadFromFile('inventory_history', []);
    
    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        inventory,
        sales,
        salesHistory,
        inventoryHistory
      }
    };
    
    // Ask user where to save the backup
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `carrot-top-backup-${new Date().toISOString().split('T')[0]}.json`,
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    // Create a writable stream
    const writable = await fileHandle.createWritable();
    
    // Write the data
    await writable.write(JSON.stringify(backup, null, 2));
    
    // Close the file
    await writable.close();
    
    return true;
  } catch (error) {
    console.error('Error exporting backup:', error);
    return false;
  }
};

/**
 * Import a backup
 */
const importBackup = async () => {
  // If running in Electron, use Node.js dialog
  if (isElectron()) {
    try {
      const { dialog } = window.require('@electron/remote');
      const fs = window.require('fs');
      
      // Show open dialog
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Backup',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });
      
      if (filePaths && filePaths.length > 0) {
        // Read the file
        const contents = fs.readFileSync(filePaths[0], 'utf8');
        
        // Parse the backup
        const backup = JSON.parse(contents);
        
        // Validate backup format
        if (!backup.timestamp || !backup.data) {
          alert('Invalid backup file format.');
          return false;
        }
        
        // Restore data
        if (backup.data.inventory) {
          await saveToFile('inventory', backup.data.inventory);
        }
        
        if (backup.data.sales) {
          await saveToFile('sales', backup.data.sales);
        }
        
        if (backup.data.salesHistory) {
          await saveToFile('sales_history', backup.data.salesHistory);
        }
        
        if (backup.data.inventoryHistory) {
          await saveToFile('inventory_history', backup.data.inventoryHistory);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing backup in Electron:', error);
      return false;
    }
  }
  
  if (!isFileSystemAccessSupported()) {
    alert('File System Access API is not supported in this browser. Cannot import backup.');
    return false;
  }

  try {
    // Ask user to select a backup file
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });
    
    // Get the file
    const file = await fileHandle.getFile();
    
    // Read the file
    const contents = await file.text();
    
    // Parse the backup
    const backup = JSON.parse(contents);
    
    // Validate backup format
    if (!backup.timestamp || !backup.data) {
      alert('Invalid backup file format.');
      return false;
    }
    
    // Restore data
    if (backup.data.inventory) {
      await saveToFile('inventory', backup.data.inventory);
    }
    
    if (backup.data.sales) {
      await saveToFile('sales', backup.data.sales);
    }
    
    if (backup.data.salesHistory) {
      await saveToFile('sales_history', backup.data.salesHistory);
    }
    
    if (backup.data.inventoryHistory) {
      await saveToFile('inventory_history', backup.data.inventoryHistory);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing backup:', error);
    return false;
  }
};

const FileSystemService = {
  isSupported: isFileSystemAccessSupported,
  initialize: initializeFileSystem,
  saveToFile,
  loadFromFile,
  exportBackup,
  importBackup
};

export default FileSystemService; 