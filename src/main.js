const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const { screen } = require('electron');
const fs = require('fs').promises;
const path = require('path'); 

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const win = new BrowserWindow({
    width: 1280,  //16:9
    height: 720,
    minWidth: 854, 
    minHeight: 480,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.setAspectRatio(16 / 9);
  win.setMinimumSize(640, 360);
  win.removeMenu(); 
  win.loadFile('src/index.html');

  // Register the Ctrl+Shift+I shortcut to toggle DevTools
  globalShortcut.register('Control+Shift+I', () => {
    win.webContents.toggleDevTools();
  });
}

// Ajouter ces handlers IPC
ipcMain.handle('rename-item', async (event, oldPath, newPath) => {
  await fs.rename(oldPath, newPath);
});

ipcMain.handle('create-file', async (event, filePath, content = '') => {
  await fs.writeFile(filePath, content);
});

ipcMain.handle('delete-item', async (event, itemPath) => {
  await fs.rm(itemPath, { recursive: true });
});

ipcMain.handle('save-file', async (event, filePath, content) => {
  await fs.writeFile(filePath, content, 'utf-8');
});

app.whenReady().then(createWindow);