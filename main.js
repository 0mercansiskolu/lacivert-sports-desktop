const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell, session } = require('electron');
const path = require('path');

let mainWindow;
let siteWindow;
let tray;
let isQuitting = false;

const allowedExternalProtocols = new Set(['http:', 'https:']);

function sendWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('window:state', {
    maximized: mainWindow.isMaximized(),
    fullscreen: mainWindow.isFullScreen(),
    alwaysOnTop: mainWindow.isAlwaysOnTop()
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 650,
    backgroundColor: '#050816',
    title: 'Lacivert Sports',
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('maximize', sendWindowState);
  mainWindow.on('unmaximize', sendWindowState);
  mainWindow.on('enter-full-screen', sendWindowState);
  mainWindow.on('leave-full-screen', sendWindowState);
  mainWindow.on('always-on-top-changed', sendWindowState);

  mainWindow.on('close', (event) => {
    if (!isQuitting && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (allowedExternalProtocols.has(parsed.protocol)) shell.openExternal(url);
    } catch {}
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      event.preventDefault();
      mainWindow.webContents.reloadIgnoringCache();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Lacivert Sports');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Lacivert Sports\'u Aç', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { label: 'Tam Ekran', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
    { type: 'separator' },
    { label: 'Çıkış', click: () => { isQuitting = true; app.quit(); } }
  ]));
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
}

function openSiteWindow() {
  if (siteWindow && !siteWindow.isDestroyed()) {
    siteWindow.show();
    siteWindow.focus();
    return;
  }

  siteWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'Lacivert Sports - Site Yayınları',
    backgroundColor: '#050816',
    autoHideMenuBar: true,
    parent: mainWindow,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  siteWindow.loadURL('https://larcivertsports2.blogspot.com/');
  siteWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      if (allowedExternalProtocols.has(parsed.protocol)) shell.openExternal(url);
    } catch {}
    return { action: 'deny' };
  });
  siteWindow.on('closed', () => { siteWindow = null; });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(['fullscreen', 'media'].includes(permission));
  });

  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else { mainWindow.show(); mainWindow.focus(); }
  });
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('site:open', () => {
  openSiteWindow();
  return true;
});

ipcMain.handle('window:toggle-fullscreen', () => {
  if (!mainWindow) return false;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
  return mainWindow.isFullScreen();
});

ipcMain.handle('window:always-on-top', (_event, enabled) => {
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(enabled, 'floating');
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle('window:get-state', () => ({
  maximized: mainWindow?.isMaximized() ?? false,
  fullscreen: mainWindow?.isFullScreen() ?? false,
  alwaysOnTop: mainWindow?.isAlwaysOnTop() ?? false
}));
