const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');

let mainWindow;
let overlayWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 700,
    minHeight: 600,
    title: 'Teleprompter IA — Canivete v1.0.2',
    backgroundColor: '#101827',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'teleprompter.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function openOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    overlayWindow.focus();
    return;
  }
  overlayWindow = new BrowserWindow({
    width: 780,
    height: 260,
    minWidth: 380,
    minHeight: 130,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.loadFile(path.join(__dirname, 'teleprompter.html'), { query: { overlay: '1' } });
  overlayWindow.on('closed', () => { overlayWindow = null; });
}

ipcMain.handle('teleprompter:open-overlay', () => openOverlay());
ipcMain.handle('teleprompter:close-overlay', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.close();
});
ipcMain.handle('teleprompter:minimize-main', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});
ipcMain.handle('teleprompter:open-external', (_event, url) => {
  if (typeof url === 'string' && /^https:\/\//i.test(url)) return shell.openExternal(url);
});

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});