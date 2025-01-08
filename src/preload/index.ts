import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const WINDOW_API = {
  runModule: (moduleName: string) => ipcRenderer.send("runModule", moduleName),
  onModuleOutput: (callback) => ipcRenderer.on('moduleData', (_, data) => callback(data)),
  // onModuleError: (callback) => ipcRenderer.on('ModuleError', (_, error) => callback(error)),
  // onModuleClose: (callback) => ipcRenderer.on('ModuleClose', (_, message) => callback(message)),
  userInfo: () => ipcRenderer.invoke("getUserInfo"),
  getModules: () => ipcRenderer.invoke("getModules"),
  runAllModules: () => ipcRenderer.invoke("runAllModules"),
}

const AGENT_MODULES_API = {
    getModules: () => ipcRenderer.invoke("getModules"),
    runAllModules: () => ipcRenderer.invoke("runAllModules"),
    getRunAllModulesProgress: (callback) => ipcRenderer.on('runAllModulesProgress', (_, ranModules: number, totalModules: number) => callback(ranModules, totalModules))
}

const AGENT_API = {
    getSystemPrograms: () => ipcRenderer.invoke("getSystemPrograms"),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", WINDOW_API);
    contextBridge.exposeInMainWorld("agentModules", AGENT_MODULES_API);
    contextBridge.exposeInMainWorld("agent", AGENT_API);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = WINDOW_API;
  // @ts-ignore (define in dts)
  window.agentModules = AGENT_MODULES_API;
  // @ts-ignore (define in dts)
  window.agent = AGENT_API;
}
