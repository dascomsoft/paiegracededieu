const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
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
      webSecurity: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Gestion Scolarité - Groupe Scolaire Bilingue La Grâce De Dieu',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    // Mode développement
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Mode PRODUCTION – CHEMIN 100% CORRECT
    const indexPath = path.join(process.resourcesPath, 'dist/index.html');
    mainWindow.loadFile(indexPath);
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

// Requêtes base de données
ipcMain.handle('database-query', async (event, { method, params }) => {
  try {
    const result = await db[method](...params);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Application
ipcMain.handle('get-app-version', () => app.getVersion());

// Contrôles fenêtre
ipcMain.handle('minimize-window', () => mainWindow?.minimize());

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => mainWindow?.close());

// ========== DIALOGUES SYSTÈME ==========
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});
