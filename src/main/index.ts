import { app, shell, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import * as os from "os";
import { getModules } from "./modules/getModules";
import { runAllModules } from "./modules/runAllModules";
import { getAllPrograms, isWindows } from "./helpers";
import { Module } from "./modules/interfaces/Module";
// import { spawn } from "node:child_process";
// import { getModuleFolders, getModuleInfo, runModules } from "./services";
// import { platform } from "node:os";
// import icon from "../assets/icon.png";

let agentModules: Module[] = []

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    // titleBarStyle: "hidden",
    resizable: true,
    // ...(process.platform === "linux" ? { icon } : {}),
    icon: isWindows() ? join(app.getAppPath(), "resources/icon.ico") : join(app.getAppPath(), "resources/icon512.png"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
    },
  });

  // Circumvent CORS
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({
        requestHeaders: {
          origin: '*', ...details.requestHeaders
        }
      })
    }
  )
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*'],
          ...details.responseHeaders
        }
      })
    }
  )

  

  mainWindow.on("ready-to-show", () => {
    mainWindow.setIcon(isWindows() ? join(app.getAppPath(), "resources/icon.ico") : join(app.getAppPath(), "resources/icon512.png"))
    mainWindow.show();
    if (process.env.INFOSEC_AGENT_DEBUG === 'true') {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("nl.fontysict");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle("getUserInfo", () => { 
    try {
      const userInfo = os.userInfo()
      const username = userInfo.username
      return username
    } catch (error) {
      console.error(`Error fetching user information: ${error}`)
      return null
    }
  })

  // ipcMain.handle("sendNotification", (_, notification) => {

  // const modtest = runModule({
  //   name: "pwd-test",
  //   config: {
  //     name: "test",
  //     os: ["linux", "windows"],
  //     isSudo: false,
  //     exec: "password_scanner",
  //     args: []
  //   },
  //   path: "/home/apirvu/InfoSec-Agent/InfoSec-Agent/resources/modules/password_module",
  //   result: []
  // })

  
  // IPC Handlers
  ipcMain.handle("getModules", async () => {
    agentModules = getModules()
    return agentModules
  })

  ipcMain.handle("runAllModules", async () => {
    return await runAllModules(ipcRenderer)
  })

  ipcMain.handle("getSystemPrograms", async () => {
    return await getAllPrograms()
  })

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
