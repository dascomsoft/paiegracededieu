


const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database/db');

let mainWindow;

// === Création de la fenêtre principale ===
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false, // Sécurité : pas d'accès direct à Node.js depuis le renderer
      contextIsolation: true, // Sécurité : isolation du contexte
      preload: path.join(__dirname, 'preload.js'), // Script de préchargement
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Gestion Scolarité - Groupe Scolaire Bilingue La Grâce De Dieu',
  });

  // === Chargement du frontend ===
  if (process.env.NODE_ENV === 'development') {
    // Mode développement (Vite)
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Mode production (React build)
    const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// === Démarrage de l'application ===
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitter sur toutes les fenêtres fermées, sauf sur macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// === Initialisation de la base de données ===
const db = new Database();

// === Gestion des appels IPC (communication frontend ↔ backend) ===

// Requêtes vers la base de données
ipcMain.handle('database-query', async (event, { method, params }) => {
  try {
    console.log(`DB Query: ${method}`, params);
    const result = await db[method](...params);
    return { success: true, result };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  }
});

// Obtenir la version de l’application
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Contrôles de fenêtre
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});