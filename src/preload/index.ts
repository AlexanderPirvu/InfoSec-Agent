import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { userInfo } from "os";

// Custom APIs for renderer
const WINDOW_API = {
  runModule: (moduleName: string) => ipcRenderer.send("runModule", moduleName),
  onModuleOutput: (callback) => ipcRenderer.on('moduleData', (_, data) => callback(data)),
  // onModuleError: (callback) => ipcRenderer.on('ModuleError', (_, error) => callback(error)),
  // onModuleClose: (callback) => ipcRenderer.on('ModuleClose', (_, message) => callback(message)),
  userInfo: () => ipcRenderer.invoke("getUserInfo"),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", WINDOW_API);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = WINDOW_API;
}
