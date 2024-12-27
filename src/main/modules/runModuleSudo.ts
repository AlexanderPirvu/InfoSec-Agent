import path from 'path';
import { Module } from './interfaces/Module';
import axios from 'axios';

const sudoAPI = axios.create({
    baseURL: 'http://127.0.0.1:5879',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INFOSEC_AGENT_KEY}`
    },
});

/**
 * Runs a module with sudo privileges.
 *
 * @param {Module} module The module to run.
 * @returns {Promise<any>} The result of the module execution
 * 
 * @throws {Error} If there is an error running the module.
 * 
 * @remarks
 * This function sends a POST request to the sudo API with the command to run the module.
 * The response is returned as the result of the module execution
 * 
 * @author Created by Alexander Pirvu on 27-Dec-2024
 * 
 */
export async function runModuleSudo(module: Module): Promise<any> {

    let cmd = path.join(module.path, module.config.exec);

    try {
        const response = await sudoAPI.post('/run-command', {
            command: cmd,
            // args: module.config.args,
        });
        console.log('Response from sudo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error running module with sudo:', error);
        throw error;
    }
}