const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database/db');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Gestion Scolarité - Groupe Scolaire Bilingue La Grâce De Dieu',
    show: false
  });

  // Mode développement
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Mode production - AVEC DEBUG
    const prodPath = path.join(__dirname, '../../dist/index.html');
    console.log('📁 Production path:', prodPath);
    console.log('✅ File exists:', fs.existsSync(prodPath));
    
    if (fs.existsSync(prodPath)) {
      const content = fs.readFileSync(prodPath, 'utf8');
      console.log('📄 File content (first 500 chars):', content.substring(0, 500));
      mainWindow.loadFile(prodPath);
    } else {
      console.log('❌ ERROR: index.html not found!');
      mainWindow.loadURL('data:text/html,<h1>ERROR: index.html not found at ' + prodPath + '</h1>');
    }
    
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ========== IPC & DB ==========
const db = new Database();

ipcMain.handle('database-query', async (event, { method, params }) => {
  try {
    const result = await db[method](...params);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});  
ipcMain.handle('close-window', () => mainWindow?.close());
