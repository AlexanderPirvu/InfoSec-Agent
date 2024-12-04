import { app } from "electron";
import * as fs from "fs";
import path from "path";
import YAML from "yaml";
import { agentModule } from "./interfaces/moduleInterface";
import { debugLog } from "./helpers";

// **NOTE**: This file is a work in progress and is not yet implemented in the main process

/*
 *  This file is intended to be used to run modules in the main process of the application. 
 *  It reads the modules directory and runs each module in a separate process.
 * 
 *  The modules are expected to be in the following format:
 *  - resources/modules
 *   - module_name
 *    - config.yml
 *    - module1(.exe/.sh/.ps/.py)
 * 
 */

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
        if (error instanceof Error) {
            console.error(`Error occurred while reading modules: ${error.message}`)
        } else {
            console.error('An unknown error occurred while reading modules')
        }
        return []
    }
}
export function getModuleInfo(modulePath: string): agentModule | undefined {
    try {
        const configPath = path.join(modulePath, "config.yml")

        let fileContents

        // FS Read config.yml file
        try {
            fileContents = fs.readFileSync(configPath, 'utf-8')
        } catch (error) {
            throw new Error(`Error reading ${modulePath}'s config.yml file: ${error}`)
        }

        let configData

        // Parse YAML file
        try {
            configData = YAML.parse(fileContents)
        } catch (parseError) {
            throw new Error(`Error parsing ${modulePath}'s config.yml file: ${parseError}`)
        }

        return configData
    } catch (error) {
        console.error(`Error reading ${modulePath}'s config.yml file. Are you sure it exists?`)
    }
    return undefined
}

export function runModules() {
    try {
        const modulesDirectory = path.join(app.getAppPath(), 'resources',  'modules')

        debugLog(`Running modules from ${modulesDirectory}`)

        const modules = getModuleFolders()

        debugLog(`Found modules: ${modules}`)

        // Basic checking of modules folder
        // TODO: If modules do not exist, download them from a repo
        if (modules.length === 0) {
            throw new Error('No modules found!')
        }

        modules.forEach(module => {
            // Get module info (config.yml)
            const moduleInfo = getModuleInfo(path.join(modulesDirectory, module))


            // If moduleInfo is undefined (no config.yml present), skip the module
            if (!moduleInfo) {
                console.error(`Error reading module ${module}'s config.yml file. Skipping module.`)
                return
            }


            // Check if module supports current OS 
            if ((isMac && !moduleInfo.os.find((os) => os === 'mac')) || (isWindows && !moduleInfo.os.find((os) => os === 'windows')) || (isLinux && moduleInfo.os.find((os) => os === 'linux'))) {
                console.error(`Cannot run module ${moduleInfo.name}: OS not supported. Supported OS: ${moduleInfo.os}`)
                return
            } else {
                console.log(`Running module ${moduleInfo.name}: OS supported.`)
            }
            

            // Check if module requires elevated permissions
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