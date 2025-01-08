import { Button, Group, Paper, Text, Title } from '@mantine/core'

const ChecksPage = () => {

  return (
    <>
        <Title order={1}>Checks</Title>
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Security Checks</Title>
            <Text size='md' fw={200} mt={5}>Notifications</Text>
            <Text size='sm' mt={5}>Testing operations for notification system</Text>
            <Group>
                <Button variant='default' m={5}>Add Test Notification</Button>
                <Button variant='default' m={5}>Clear All Notifications</Button>
            </Group>
            <Text size='md' fw={700} mt={5}>Modules</Text>
            <Text size='sm' mt={5}>Testing operations for agent module system</Text>
            <Button variant='default' m={5}>Get Modules</Button>
            <Button variant='default' m={5}>Get Modules 2</Button>
            <Button variant='default' m={5}>Run All Modules</Button>
        </Paper>
    </>
  )
}

export default ChecksPage