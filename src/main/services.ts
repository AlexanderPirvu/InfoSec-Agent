import { app, utilityProcess } from "electron";
import * as fs from "fs";
import path from "path";
import YAML from "yaml";
import { agentModule } from "./interfaces/moduleInterface";
import { spawn } from "child_process";


const os = require('os')

const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

export function getModuleFolders(): string[] {
    try {
        
        const modulesDirectory = path.join(app.getAppPath(), 'resources', 'modules')

        const moduleFolders = fs.readdirSync(modulesDirectory).filter((item) => {
            const itemPath = path.join(modulesDirectory, item)
            return fs.statSync(itemPath).isDirectory()
        })

        return moduleFolders
    } catch (error) {
        console.error(`Error occurred while reading modules: ${error.message}`)
        return []
    }
}

export function getModuleInfo(modulePath: string) : agentModule {
    try {
        const configPath = path.join(modulePath, "config.yml")

        const fileContents = fs.readFileSync(configPath, 'utf-8')

        const configData = YAML.parse(fileContents)

        return configData
    } catch (error) {
        console.error(`Error reading ${modulePath}'s config.yml file. Are you sure it exists?`)
    }
}

export function runModules() {
    try {
        const modulesDirectory = path.join(app.getAppPath(), 'resources',  'modules')

        console.log(modulesDirectory)

        const modules = getModuleFolders()

        console.log("HERE")
        console.log(modules)

        // Basic checking of modules folder
        // TODO: If modules do not exist, download them from a repo
        if (modules.length === 0) {
            throw new Error('No modules found!')
        }

        modules.forEach(module => {
            const moduleInfo = getModuleInfo(path.join(modulesDirectory, module))

            console.log(module)

            console.log(moduleInfo)
            
            if (moduleInfo.isSudo) {
                // TODO: Communicate with Priviledged Service to execute module with elevated permissions
                console.error(`Cannot run module ${moduleInfo.name}: Priviledge escalation required, but not implemented.`)
            } else {
                // const process = spawn(modulesDirectory, module.toString(), moduleInfo.exec)
                console.log(`Running module: ${module}`)

                // const process = spawn(path.join(app.getAppPath(), 'resources', 'modules', module, moduleInfo.exec))
            }
        });
    } catch (error) {
        console.error(`Error running all modules: ${error}`)
    }
}