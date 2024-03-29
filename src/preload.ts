// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron/renderer");

const electronAPI = {
  onSelectedFile: (callback: (file_os_pathname: string) => void) =>
    ipcRenderer.on("selected-file", (_event, value) => callback(value)),
  onSelectedFolder: (callback: (folder_path: string) => void) =>
    ipcRenderer.on("selected-folder", (_event, value) => callback(value)),
  onStopSession: (callback: () => void) =>
    ipcRenderer.on("stop-session", (_event, value) => callback()),
  onError: (callback: (errorObj: any) => void) => {
    ipcRenderer.on("error", (_event, value) => callback(value));
  },
  onPreflightStartSessionDone: (callback: () => void) =>
    ipcRenderer.on("preflight-start-session-done", (_event, value) =>
      callback()
    ),
  onNextImage: (callback: () => void) =>
    ipcRenderer.on("next-image", (_event, value) => callback()),
  selectFolder: () => ipcRenderer.send("select-folder"),
  selectRandomImage: (folder_path: string) =>
    ipcRenderer.send("select-random-image", folder_path),
  startSession: (folder_path: string) =>
    ipcRenderer.send("start-session", folder_path),
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
