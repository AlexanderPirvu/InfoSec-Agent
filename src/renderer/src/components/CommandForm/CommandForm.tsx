//@ts-nocheck
import { FormEvent, useState } from 'react'
import * as Form from "@radix-ui/react-form"
import { Badge, Button, Spinner, Text, TextField } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { runCommand } from '../../services/CommandService'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'

const CommandForm = () => {

    const [command, setCommand] = useState<string>('ls')

    const send = useMutation({
        mutationKey: ['command'],
        mutationFn: runCommand
    })

    function submitForm(e: FormEvent) {
        e.preventDefault()
        send.mutate(command)
        
    }

    return (
    <>
        <Form.Root className='FormRoot' onSubmit={(e) => submitForm(e)}>
            <Form.Field className="FormField" name="command">
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                    }}
                >
                    <Form.Label className="FormLabel"><Text m='2'>Command</Text></Form.Label>
                    <Form.Message className="FormMessage" match="valueMissing">
                        Please enter your command
                    </Form.Message>
                    <Form.Message className="FormMessage" match="typeMismatch">
                        Please provide a valid command
                    </Form.Message>
                </div>
                <Form.Control asChild>
                    <TextField.Root m='2' variant="surface" placeholder="Enter a command here..." onChange={(e) => setCommand(e.target.value)} />
                </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
                <Button m='2'>Send</Button>
		    </Form.Submit>
        </Form.Root>
        {send.isPending && <Badge m='2' color='orange'><Spinner size='1'/> Running command... </Badge>}
        {send.isSuccess && <Badge m='2' color='green'><CheckCircledIcon /> Success! {send.data?.data.output}</Badge>}
        {send.isError && <Badge m='2' color='red'><CrossCircledIcon /> FAILED: {send.error?.message}</Badge>}

    </>
  )
}

export default CommandForm