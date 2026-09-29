const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
    platform: process.platform,
    isMac: process.platform === 'darwin',
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
    getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
