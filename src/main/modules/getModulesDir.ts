import { app } from "electron"
import fs from "fs"
import path from "path"
import { debugLog } from "../helpers"

/**
 * Retrieves the path to the modules directory.
 *
 * @returns {string} The path to the modules directory.
 *
 * @author Created by Alexander Pirvu on 19-Dec-2024
 */
export function getModulesPath(): string {
    return path.join(app.getAppPath(), 'resources', 'modules')
}


/**
 * Retrieves the list of module directories from the application's resources directory.
 *
 * @returns {string[]} An array of directory names found in the modules directory.
 *
 * @throws Will log an error to the console and return an empty array if there is an issue accessing the modules directory.
 * 
 * @author Created by Alexander Pirvu on 19-Dec-2024
 */

export function getModulesDir(): string[] {

    try {
        const modulesDir = getModulesPath()
        debugLog(`Getting modules from: ${modulesDir}`)

        const moduleFolders = fs.readdirSync(modulesDir).filter((item) => {
            const itemPath = path.join(modulesDir, item)
            return fs.statSync(itemPath).isDirectory()
        })

        debugLog(`Found modules: ${moduleFolders}`)

        return moduleFolders
    }
    catch (error) {
        console.error(error)
        return []
    }
}
