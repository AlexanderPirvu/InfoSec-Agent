import axios from 'axios'

export interface CommandRequest {
    command: string
    priviledged?: boolean
}

export interface CommandResponse {
    out: string
}

export const runCommand = async (command: string) => {
    const authToken = 'token' //TODO: Change this to a unique value

    const requestBody: CommandRequest = { command }

    const response = await axios.post<CommandResponse>(
        'http://127.0.0.1:5879/run-command',
        requestBody,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }
    )

    return response
}