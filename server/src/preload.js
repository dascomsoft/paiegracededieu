const { contextBridge, ipcRenderer } = require('electron');

// Expose les méthodes IPC sécurisées au contexte de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Méthodes pour la base de données
  database: {
    invoke: (method, ...params) => ipcRenderer.invoke('database-query', { method, params })
  },
  
  // Méthodes pour l'application
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    minimize: () => ipcRenderer.invoke('minimize-window'),
    maximize: () => ipcRenderer.invoke('maximize-window'),
    close: () => ipcRenderer.invoke('close-window')
  },
  
  // Méthodes pour le système de fichiers (pour les sauvegardes)
  fs: {
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options)
  }
});