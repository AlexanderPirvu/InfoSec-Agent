/**
 * Determines if the application is running in debug mode.
 * 
 * This function checks the environment variables `INFOSEC_AGENT_DEBUG` to see if it is set to 'true' or '1'.
 * If either condition is met, the application is considered to be in debug mode.
 * 
 * @constant
 * @type {boolean}
 *
 * @author Created by Alexander Pirvu on 03-Jan-2025
 */
export const isDebugMode = process.env.INFOSEC_AGENT_DEBUG === 'true' || process.env.INFOSEC_AGENT_DEBUG === '1'