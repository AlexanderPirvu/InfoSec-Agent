import path from "path";
import { getModuleInfo } from "./getModuleInfo";
import { getModulesDir, getModulesPath } from "./getModulesDir";
import { Module } from "./interfaces/Module";
import { debugLog } from "../helpers";

/**
 * Retrieves the list of modules from the modules directory.
 *
 * @returns {Module[]} An array of module objects.
 *
 * @author Created by @AlexanderPirvu on 19-Dec-2024
 */
export function getModules(): Module[] {
    const modulesDir = getModulesDir()
    const modules = modulesDir.map((module) => {
        const moduleInfo = getModuleInfo(module)
        if (moduleInfo) {
            return {
                name: moduleInfo.name,
                path: path.join(getModulesPath(), module),
                config: moduleInfo,
                result: null,
            } as Module
        }
        return undefined
    // Filtering out any undefined modules
    }).filter((module): module is Module => module !== undefined)
    debugLog(`Found modules: ${modules.map((module) => module.name).join(', ')}`)
    return modules
}