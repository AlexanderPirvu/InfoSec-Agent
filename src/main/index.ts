import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { runModules } from "./services";
import * as os from "os";
// import { spawn } from "node:child_process";
// import { getModuleFolders, getModuleInfo, runModules } from "./services";
// import { platform } from "node:os";
// import icon from "../assets/icon.png";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === "linux" ? { icon } : {}),
    icon: join(__dirname, "../assets/icon.png"),
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
    mainWindow.show();
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

  ipcMain.handle("getUserInfo", (event) => { 
    try {
      const userInfo = os.userInfo()
      const username = userInfo.username
      return username
    } catch (error) {
      console.error(`Error fetching user information: ${error}`)
    }
  })

  // IPC Handlers
  ipcMain.on("runModule", async (event, moduleName) => {
    // console.log(`Running module ${moduleName}`)
    try {

      console.log("fa")
      console.log(moduleName)

      const modulesOutput = runModules()
      console.log(modulesOutput)
      console.log(JSON.parse(modulesOutput))
      event.sender.send('moduleData', modulesOutput)

      // TODO: fix regex
      // if (!/^[a-zA-Z0-9-_]+$/.test(moduleName)) {
      //   throw new Error('Invalid module executable name!')
      // }

      // TODO: Go through and find each module folder
      // Construct the path to modules

      // ##
      // let lastEntry = platform() == "win32" ? "password_scanner.exe" : "password_scanner"
      
      
      
      // try {
      //   const appDataPath = app.getPath("appData")
      //   lastEntry += 'password_scanner.exe'
      // } catch {
      //   lastEntry += 'password_scanner'
      // }

      // ##
      // const modulePath = path.join(process.resourcesPath, 'modules', 'pwd', lastEntry)
      // console.log(`Going to: ${modulePath}!`)


      // const moduleFolderPath = path.join(app.getAppPath(), 'modules')
      // console.log(getModuleFolders().forEach(element => {
      //   console.log(getModuleInfo(path.join(moduleFolderPath, element)))
      // }))

      // runModules()

      // const moduleName = "NotModule"

      // const process = utilityProcess.fork("ls", [], {})

      // process.on('spawn', () => {
      //   console.log(`Started: ${process.pid}`)
      // })

      // //@ts-ignore
      // process.stdout.on('data', (msg) => {
      //   console.log(`Data: ${msg}`)
      // })

      // process.on('exit', () => {
      //   console.log(`Exited: ${process.pid}`)
      // })

      // NODEJS NATIVE SPAWN

      // const spawnedProcess = spawn(modulePath)
      // // const process = spawn(path.join(moduleFolderPath, 'pwd', 'password_scanner'))
      // // const process = spawn('dir')
      // // const process = spawn('dir', [], { shell: true })

      // // console.log(process)
      // // console.log(`Running module ${moduleName} from ${modulePath}`)

      // spawnedProcess.stdout.on('data', (data) => {
      //   console.log(`Module ${moduleName} data: ${data.toString()}`)
      //   event.sender.send('moduleData', data.toString())
      // })

      // // console.log("HERE")

      // spawnedProcess.stderr.on('data', (data) => {
      //   console.error(`${data}`)
      // })

      // spawnedProcess.stderr.on('end', (end) => console.log(end))

      // spawnedProcess.stderr.on('error', (end) => console.log(end))

      // spawnedProcess.stderr.on('close', (data) => {
      //   console.log(`Module ${moduleName} error: ${data}`)
      //   event.sender.send('moduleError', data.toString())
      // })

      // spawnedProcess.on('close', (code) => {
      //   console.log(`Module ${moduleName} exit code: ${code}`)
      //   event.sender.send('moduleClose', `Process ${moduleName} exited with code ${code}`)
      // })


//       import { spawn } from 'node:child_process';
// const ls = spawn('ls', ['-lh', '/usr']);

// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// ls.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// });

// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

    } catch (error) {
      event.sender.send('moduleError', error)
    }
  });

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
