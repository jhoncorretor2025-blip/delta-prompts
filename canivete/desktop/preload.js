const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openOverlay: () => ipcRenderer.invoke('teleprompter:open-overlay'),
  openUpdates: () => ipcRenderer.invoke('teleprompter:open-updates'),
  closeOverlay: () => ipcRenderer.invoke('teleprompter:close-overlay'),
  resizeOverlay: (direction) => ipcRenderer.invoke('teleprompter:resize-overlay', direction),
  minimizeMain: () => ipcRenderer.invoke('teleprompter:minimize-main')
});