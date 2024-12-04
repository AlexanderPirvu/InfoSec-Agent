/* 
 * Helper functions
*/

// This function is used to log debug messages to the console
export function debugLog(message: string, ...optionalParams: any[]): void {
    if (process.env.INFOSEC_AGENT_DEBUG === 'true') {
        console.debug(`[INFOSEC_AGENT_DEBUG] ${message}`, ...optionalParams);
    }
}