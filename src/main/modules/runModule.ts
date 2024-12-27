import { spawnSync } from "child_process"
import { Module } from "./interfaces/Module"
import { ModuleResult } from "./interfaces/ModuleResult"
import { debugLog, getJsonFilter, isOSCompatible } from "../helpers"
import path from "path"
import { runModuleSudo } from "./runModuleSudo"


/**
 * Runs a given module and returns the results.
 * 
 * @param {Module} module - The module to run.
 * @returns {Promise<ModuleResult[]>} - A promise that resolves to an array of ModuleResult objects.
 * 
 * @throws {Error} - If the module is not compatible with the OS or if there is an error running the module.
 * 
 * @remarks
 * This function checks if the module is compatible with the OS and whether it requires sudo permissions.
 * If sudo is required, it runs the module with elevated permissions using `runModuleSudo`.
 * Otherwise, it runs the module using `spawnSync`.
 * The output is parsed using `getJsonFilter` and returned as an array of ModuleResult objects.
 * 
 * @author Created by Alexander Pirvu on 24-Dec-2024
 */
export async function runModule(module: Module): Promise<ModuleResult[]> {
    let modulesOutput: ModuleResult[] = []

    debugLog(`Running module: ${module.name}`)
    debugLog(`Module path: ${module.path}`)
    debugLog(`Module config: ${module.config}`)

    if (!isOSCompatible(module.config.os)) { 
        console.warn(`Module ${module.name} is not compatible with this OS`)
        return new Promise((_resolve, reject) => {
            reject(`Module ${module.name} is not compatible with this OS`)
        })
    }

    if (module.config.isSudo) {
        const sudoRun = await runModuleSudo(module)
        return new Promise((resolve, reject) => {
            if (sudoRun.error) {
                reject(sudoRun.error)
            }
            
            getJsonFilter(sudoRun.output.toString()).forEach((element: any) => {
                const output: ModuleResult = {
                    status: element.status,
                    message: element.message,
                    fix: element.fix,
                    moduleName: module.name
                }
                modulesOutput.push(output)
            })
            resolve(modulesOutput)
        })
    } else {
        const process = spawnSync(path.join(module.path, module.config.exec))
        return new Promise((resolve, reject) => {
            if (process.error) {
                reject(process.error.message)
            }

            getJsonFilter(process.output.toString()).forEach((element: any) => {
                const output: ModuleResult = {
                    status: element.status,
                    message: element.message,
                    fix: element.fix,
                    moduleName: module.name
                }
                modulesOutput.push(output)
            })
            resolve(modulesOutput)
        })
    }
}

// export async function runModule2(module: Module): Promise<ModuleResult[]> {
//     let modulesOutput: ModuleResult[] = []
//     let moduleRawOutput: string = ""

//     if (module.config.isSudo) {
//         // const sudo = require('sudo-prompt')
//         // sudo.exec(module.config.exec, { name: 'Electron' }, (error: any, stdout: any, stderr: any) => {
//         //     if (error) {
//         //         modulesOutput.push({ status: "fail", message: error, moduleName: module.name })
//         //         return
//         //     }
//         //     modulesOutput.push({ status: "success", message: stdout, moduleName: module.name })
//         // })
//         console.warn("Sudo is not supported in this version")
//     } else {
//         let exec = module.config.exec

//         if (isWindows()) { exec = exec + '.exe' }

//         if (!module.config.args) { module.config.args = [] }

//         const process = spawn(path.join(module.path, exec), module.config.args, { cwd: module.path })

//         process.stdout.on('data', (data) => {
//             // modulesOutput.push({ status: "success", message: data.toString(), moduleName: module.name })
//             console.log(`${module.name} : ${data.toString()}`)
//             moduleRawOutput += data.toString()
//         })

//         process.stderr.on('data', (data) => {
//             // modulesOutput.push({ status: "fail", message: data.toString(), moduleName: module.name })
//             console.error(data.toString())
//         })

//         process.on('error', (error) => {
//             // modulesOutput.push({ status: "fail", message: error, moduleName: module.name })
//             console.error(error)
//         })

//         process.on('close', (code) => {
//             if (code === 0) {
//                 // modulesOutput.push({ status: "success", message: "Module ran successfully", moduleName: module.name })
//                 console.log("Module ran successfully")
//                 getJsonFilter(moduleRawOutput).forEach((element: any) => {
//                     // const json = JSON.parse(element)
//                     const output: ModuleResult = {
//                         status: element.status,
//                         message: element.message,
//                         fix: element.fix,
//                         moduleName: module.name
//                     }
//                     modulesOutput.push(output)
//                 })

//             } else {
//                 // modulesOutput.push({ status: "fail", message: `Module failed with code ${code}`, moduleName: module.name })
//                 console.error(`Module failed with code ${code}`)
//             }
//         })

//     }

//     return modulesOutput
// }
