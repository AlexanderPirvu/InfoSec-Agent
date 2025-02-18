/* 
 * Helper Functions
 */

/**
 * Logs a debug message to the console if the INFOSEC_AGENT_DEBUG environment variable is set to 'true'.
 * Functionally equivalent to console.debug().
 *
 * @param message - The message to log.
 * @param optionalParams - Additional optional parameters to log.
 */
export function debugLog(message: any, ...optionalParams: any[]): void {
    if (process.env.INFOSEC_AGENT_DEBUG === 'true') {
        console.debug(`[INFOSEC_AGENT_DEBUG] ${message}`, ...optionalParams);
    }
}

/**
 * Parses the operating system type to a more user-friendly format.
 *
 * @param osName - The (raw) name of the operating system. This is typically obtained from the os.type() function.
 * @returns A string representing the operating system type in a more user-friendly format.
 * 
 * @example parseOSType('Darwin') // Returns 'mac'
 * @example parseOSType('Windows_NT') // Returns 'windows'
 * @example parseOSType('Linux') // Returns 'linux'
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function parseOSType(osName: string): string {
    if (osName === 'Darwin') {
        return 'mac'
    } else if (osName === 'Windows_NT') {
        return 'windows'
    } else if (osName === 'Linux') {
        return 'linux'
    }
    return osName
}

/**
 * Checks if the current operating system is Windows.
 *
 * @returns A boolean indicating whether the current OS is Windows.
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function isWindows(): boolean {
    const os = require('os')
    return os.type() === 'Windows_NT'
}

/**
 * Checks if the current operating system is macOS.
 *
 * @returns A boolean indicating whether the current OS is macOS.
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function isMac(): boolean {
    const os = require('os')
    return os.type() === 'Darwin'
}

/**
 * Checks if the current operating system is Linux.
 *
 * @returns A boolean indicating whether the current OS is Linux.
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function isLinux(): boolean {
    const os = require('os')
    return os.type() === 'Linux'
}

/**
 * Checks if the current operating system is compatible with the provided list of OS types.
 *
 * @param input - An array of strings representing the OS types to check against.
 * @returns A boolean indicating whether the current OS is compatible.
 * 
 * @example isOSCompatible(['mac', 'windows']) // Returns true if the OS is either macOS or Windows
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function isOSCompatible(input: string[]): boolean {
    const os = require('os')
    const osType = os.type()
    return input.includes(parseOSType(osType))
}

/**
 * Parses a string input to extract JSON objects.
 *
 * @param input - The input string to parse.
 * @returns An array of JSON objects extracted from the input string.
 * 
 * @example getJsonFilter('{"name": "John"}') // Returns [{name: 'John'}]
 * 
 * @throws Will return an empty array if no JSON objects are found in the input string.
 * 
 * @author Created by Alexander Pirvu on 20-Dec-2024
 */
export function getJsonFilter(input: string): JSON[] {
    // const jsonRegex = /{.*}/s
    const jsonRegex = /\{\s*"[^"]*":\s*"[^"]*"(?:,\s*"[^"]*":\s*"[^"]*")*\s*\}/
    const matches = input.match(jsonRegex)
    console.log(`Matches: ${matches}`)
    if (matches) {
        return matches.map(match => JSON.parse(match))
    }
    return []
}

export function getAllPrograms(): { name: string, version: string }[] {
    const os = require('os')
    const fs = require('fs')
    const path = require('path')
    const execSync = require('child_process').execSync

    const programs: { name: string, version: string }[] = []

    if (os.type() === 'Windows_NT') {
        const programFiles = process.env.ProgramFiles
        const programList = fs.readdirSync(programFiles)

        programList.forEach(program => {
            let version = 'unknown'
            try {
                const output = execSync(`wmic datafile where name="${path.join(programFiles, program).replace(/\\/g, '\\\\')}" get Version /value`).toString()
                const match = output.match(/Version=(.*)/)
                if (match) {
                    version = match[1].trim()
                }
            } catch (error) {
                // Ignore errors and keep version as 'unknown'
            }
            programs.push({ name: program, version })
        })
    } else if (os.type() === 'Linux') {
        try {
            const output = execSync('dpkg-query -W -f=\'${binary:Package} ${Version}\n\'').toString()
            const lines = output.split('\n')
            lines.forEach(line => {
                const [name, version] = line.split(' ')
                if (name && version) {
                    programs.push({ name, version })
                }
            })
        } catch (error) {
            // Ignore errors and keep programs list empty
        }
    } else {
        const programFiles = '/usr/bin'
        const programList = fs.readdirSync(programFiles)

        programList.forEach(program => {
            let version = 'unknown'
            try {
                const output = execSync(`${path.join(programFiles, program)} --version`).toString()
                version = output.split('\n')[0].trim()
            } catch (error) {
                // Ignore errors and keep version as 'unknown'
            }
            programs.push({ name: program, version })
        })
    }

    return programs
}