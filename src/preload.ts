// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron/renderer");

const electronAPI = {
  onSelectedFile: (callback: (file_os_pathname: string) => void) =>
    ipcRenderer.on("selected-file", (_event, value) => callback(value)),
  selectFolder: () => ipcRenderer.send("select-folder"),
  onSelectedFolder: (callback: (folder_path: string) => void) =>
    ipcRenderer.on("selected-folder", (_event, value) => callback(value)),
  selectRandomImage: (folder_path: string) =>
    ipcRenderer.send("select-random-image", folder_path),
  onStopSession: (callback: () => void) =>
    ipcRenderer.on("stop-session", (_event, value) => callback()),
  onError: (callback: (errorObj: any) => void) => {
    ipcRenderer.on("error", (_event, value) => callback(value));
  },
  onNextImage: (callback: () => void) =>
    ipcRenderer.on("next-image", (_event, value) => callback()),
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
