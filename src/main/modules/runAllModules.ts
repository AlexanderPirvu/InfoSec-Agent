import { getModules } from "./getModules";
import { Module } from "./interfaces/Module";
import { runModule } from "./runModule";
import { ModuleResult } from "./interfaces/ModuleResult";
import type { IpcRenderer } from "electron";

let ranModules = 0
let totalModules = 0
let isRunning = false

export async function runAllModules(progressReporter?: IpcRenderer): Promise<ModuleResult[]> {
    if (isRunning) { throw new Error('Modules are already running') }
    isRunning = true
    console.log(`Hey I am ${progressReporter}!`)
    const modules: Module[] = getModules()

    if (modules.length === 0) { throw new Error('No modules found') }
    totalModules = modules.length

    const modulesOutput = await Promise.all(modules.map(async (module) => {
        const data = await runModule(module)
        ranModules++
        if (progressReporter) {
            console.log(`Ran ${ranModules} out of ${totalModules} modules (SENDING)`)
            progressReporter.send('runAllModulesProgress', ranModules, totalModules)
            console.log(`Ran ${ranModules} out of ${totalModules} modules (SENT)`)
        }
        return data

        /*
        // debugLog(`Running module: ${module.name}`)
        // debugLog(`Module path: ${module.path}`)
        // debugLog(`Module config: ${module.config}`)

        // if (isOSCompatible(module.config.os)) {
        //     const os = require('os')
        //     debugLog(`Module is compatible with ${os.platform()}`)
        // } else {
        //     debugLog(`Module is not compatible with this OS`)
        //     return
        // }

        // if (module.config.isSudo) {
        //     debugLog(`Module requires sudo`)
        //     // const sudo = require('sudo-prompt')
        //     // sudo.exec(module.config.exec, { name: 'Electron' }, (error: any, stdout: any, stderr: any) => {
        //     //     if (error) {
        //     //         debugLog(`Error: ${error}`)
        //     //         return
        //     //     }
        //     //     debugLog(`stdout: ${stdout}`)
        //     //     debugLog(`stderr: ${stderr}`)
        //     //     module.result = stdout
        //     // })
        // } else {
        //     debugLog(`Module does not require sudo`)

        //     let exec = module.config.exec

        //     if (isWindows()) { exec = exec + '.exe' }

        //     const process = spawnSync(path.join(module.path, exec), module.config.args, { encoding: 'utf-8' })

        //     if (process.error) {
        //         debugLog(`Error: ${process.error}`)
        //         return
        //     }

        //     if (process.stderr) {
        //         debugLog(`stderr: ${process.stderr}`)
        //         return
        //     }

        //     if (process.status === 0) {
        //         debugLog(`stdout: ${process.stdout}`)
        //         module.result = getJsonFilter(process.stdout.toString())
        //         module.result.forEach(element => {
        //             modulesOutput.push(element)
        //         });
        //     } else {
        //         debugLog(`Process exited with code ${process.status}`)
        //         throw new Error(`Module ${module.name} exited with code ${process.status}`)
        //     }
        //     // const exec = require('child_process').exec
        //     // exec(module.config.exec, (error: any, stdout: any, stderr: any) => {
        //     //     if (error) {
        //     //         debugLog(`Error: ${error}`)
        //     //         return
        //     //     }
        //     //     debugLog(`stdout: ${stdout}`)
        //     //     debugLog(`stderr: ${stderr}`)
        //     //     module.result = stdout
        //     // })
        // }
        */
    }))
    console.log('Modules output:')
    console.log(modulesOutput)
    isRunning = false
    return modulesOutput.flat()
}

// export async function getRunAllModulesProgress(): Promise<{ ranModules: number, totalModules: number }> {
//     return new Promise((resolve, reject) => {
//         if (!isRunning) {
//             // copilot you are wrong
//             reject('Modules are not running')
//         } else {
//             resolve({ ranModules, totalModules })
//         }
//     })
// }