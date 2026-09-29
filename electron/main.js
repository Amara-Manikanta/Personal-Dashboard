const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverInstance = null;
let activePort = 3010;

// Set application name
app.setName('LifeStudio');

const fs = require('fs');
const workspaceDir = '/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard';
if (fs.existsSync(path.join(workspaceDir, 'data'))) {
    process.env.DATA_DIR = process.env.DATA_DIR || path.join(workspaceDir, 'data');
    process.env.UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(workspaceDir, 'uploads');
} else {
    const userData = app.getPath('userData');
    process.env.DATA_DIR = process.env.DATA_DIR || path.join(userData, 'data');
    process.env.UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(userData, 'uploads');
}


/**
 * Check if the dashboard server is responding on a given port.
 */
function checkServerReady(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/backups/status`, (res) => {
            resolve(res.statusCode === 200 || res.statusCode === 304);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

/**
 * Wait for server to become responsive, retrying up to maxRetries.
 */
async function waitForServer(port, maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        const ready = await checkServerReady(port);
        if (ready) return true;
        await new Promise(r => setTimeout(r, 200));
    }
    return false;
}

/**
 * Start the Express server or connect to an already-running instance.
 */
async function initializeServer() {
    const isAlreadyRunning = await checkServerReady(activePort);
    if (isAlreadyRunning) {
        console.log(`[Electron] Connecting to existing server on port ${activePort}`);
        return activePort;
    }

    try {
        const { startServer } = require('../server.js');
        const started = await startServer(activePort);
        serverInstance = started.server;
        console.log(`[Electron] Started backend server on port ${activePort}`);
    } catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.log(`[Electron] Port ${activePort} is in use; trying connection...`);
            const ready = await waitForServer(activePort, 10);
            if (!ready) {
                // Try fallback port 3011
                activePort = 3011;
                const { startServer } = require('../server.js');
                const started = await startServer(activePort);
                serverInstance = started.server;
                console.log(`[Electron] Started backend server on fallback port ${activePort}`);
            }
        } else {
            console.error('[Electron] Error starting server:', err);
        }
    }

    await waitForServer(activePort, 30);
    return activePort;
}

/**
 * Create the native macOS BrowserWindow.
 */
function createMainWindow(port) {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 1080,
        minHeight: 700,
        title: 'LifeStudio',
        backgroundColor: '#0f172a',
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 18, y: 18 },
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false
        }
    });

    mainWindow.loadURL(`http://localhost:${port}`);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open target="_blank" links in default external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Construct native macOS application menu.
 */
function setupAppMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about', label: `About ${app.name}` },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide', label: `Hide ${app.name}` },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit', label: `Quit ${app.name}` }
            ]
        }] : []),
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Data Directory',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        shell.openPath(path.join(__dirname, '..', 'data'));
                    }
                },
                {
                    label: 'Open Uploads Directory',
                    click: () => {
                        shell.openPath(path.join(__dirname, '..', 'uploads'));
                    }
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
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
                { role: 'paste' },
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload', accelerator: 'CmdOrCtrl+R' },
                { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
                { role: 'toggleDevTools', accelerator: 'Alt+Command+I' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'LifeStudio on GitHub',
                    click: async () => {
                        await shell.openExternal('https://github.com/Amara-Manikanta/Personal-Dashboard');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('open-external', async (event, url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        await shell.openExternal(url);
    }
});

ipcMain.handle('show-in-folder', async (event, filePath) => {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    shell.showItemInFolder(fullPath);
});

ipcMain.handle('get-app-version', () => app.getVersion());

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        setupAppMenu();
        const port = await initializeServer();
        createMainWindow(port);

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createMainWindow(port);
            }
        });
    });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (serverInstance && typeof serverInstance.close === 'function') {
        serverInstance.close();
    }
});
