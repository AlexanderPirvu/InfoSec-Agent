// const process = spawn(modulePath, [], { shell: true })
    const process = spawn('ls', [], { shell: true })

    // console.log(process)
    // console.log(`Running module ${moduleName} from ${modulePath}`)

    process.stdout.on('data', (data) => {
        console.log(`Module ${moduleName} data: ${data.toString()}`)
        // event.sender.send('moduleData', data.toString())
    })

    console.log("HERE")

    process.stderr.on('close', (data) => {
        console.log(`Module ${moduleName} error: ${data}`)
        // event.sender.send('moduleError', data.toString())
    })

    process.on('close', (code) => {
        console.log(`Module ${moduleName} exit code: ${code}`)
        // event.sender.send('moduleClose', `Process ${moduleName} exited with code ${code}`)
    })

    return process