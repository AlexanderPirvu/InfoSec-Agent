import path from "path"
import fs from "fs"
import YAML from "yaml"
import { debugLog } from "../helpers"
import { ModuleConfig } from "./interfaces/ModuleConfig"
import { app } from "electron"

/**
 * Retrieves the module info from the module's config file.
 *
 * @param {string} modulePath - The path to the module.
 * @returns {ModuleConfig | null} The module's configuration information.
 *
 * @author Created by Alexander Pirvu on 19-Dec-2024
 */
export function getModuleInfo(modulePath: string): ModuleConfig | null {
    try {
        const configPath = path.join(app.getAppPath(), 'resources', 'modules', modulePath, 'config.yml')
        let configRawContents
        let configContents = null

        try {
            configRawContents = fs.readFileSync(configPath, 'utf-8')
        } catch (error) {
            debugLog(`Error reading module config: ${error}`)
            debugLog('It is possible that the module does not have a config file.')
            console.error(`Error reading module config: ${error}`)
            return null
        }

        try {
            configContents = YAML.parse(configRawContents)
            debugLog(`Module config: ${configContents}`)
        } catch (parseError) {
            debugLog(`Error parsing module config: ${parseError}`)
            console.error(`Error parsing module config: ${parseError}`)
            throw new Error(`Error parsing ${modulePath} config: ${parseError}`)
        }
        debugLog(`Module config: ${configContents}`)

        return configContents
    } catch (error) {
        console.error(`Error getting module info: ${error}`)        
    }
    return null
}