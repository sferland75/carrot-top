const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { initialize, enable } = require('@electron/remote/main');

// Initialize remote module
initialize();

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || 
              !app.isPackaged ||
              !path.resolve(__dirname).includes('app.asar');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'logo192.png')
  });

  // Enable remote module for this window
  enable(mainWindow.webContents);

  // Determine the correct path to index.html
  let indexPath;
  if (isDev) {
    indexPath = 'http://localhost:3000';
  } else {
    // In production, the index.html is in the build folder
    if (fs.existsSync(path.join(__dirname, '../build/index.html'))) {
      indexPath = `file://${path.join(__dirname, '../build/index.html')}`;
    } else if (fs.existsSync(path.join(__dirname, './index.html'))) {
      indexPath = `file://${path.join(__dirname, './index.html')}`;
    } else if (fs.existsSync(path.join(app.getAppPath(), 'build/index.html'))) {
      indexPath = `file://${path.join(app.getAppPath(), 'build/index.html')}`;
    } else {
      // Last resort - try to find index.html in the current directory
      indexPath = `file://${path.join(__dirname, 'index.html')}`;
    }
  }
  
  console.log('Loading URL:', indexPath);
  console.log('App path:', app.getAppPath());
  console.log('Current directory:', __dirname);
  
  // Open DevTools in production to debug
  mainWindow.webContents.openDevTools();
  
  // Load the app
  mainWindow.loadURL(indexPath);

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Backup',
          click() {
            mainWindow.webContents.executeJavaScript('window.exportBackup && window.exportBackup()');
          }
        },
        {
          label: 'Import Backup',
          click() {
            mainWindow.webContents.executeJavaScript('window.importBackup && window.importBackup()');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Carrot Top Bakery',
          click() {
            mainWindow.webContents.executeJavaScript(
              `alert("Carrot Top Bakery Management Application\\nVersion 1.0.0\\n\\nA simple bakery management system for inventory and sales tracking.")`
            );
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 