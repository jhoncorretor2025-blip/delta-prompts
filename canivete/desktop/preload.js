const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openOverlay: () => ipcRenderer.invoke('teleprompter:open-overlay'),
  closeOverlay: () => ipcRenderer.invoke('teleprompter:close-overlay'),
  minimizeMain: () => ipcRenderer.invoke('teleprompter:minimize-main')
});