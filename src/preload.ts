// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  selectFile: () => ipcRenderer.send("select-file"),
  onSelectedFile: (callback: (filepath: string) => void) =>
    ipcRenderer.on("selected-file", (_event, value) => callback(value)),
  selectFolder: () => ipcRenderer.send("select-folder"),
  onSelectedFolder: (callback: (folder_path: string) => void) =>
    ipcRenderer.on("selected-folder", (_event, value) => callback(value)),
});
