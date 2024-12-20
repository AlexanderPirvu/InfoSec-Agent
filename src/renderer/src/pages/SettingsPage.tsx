import { Alert, Button, Group, Paper, Text, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { MoonIcon, RocketIcon, SunIcon } from '@radix-ui/react-icons'
import { Module } from '@renderer/interfaces/Module'
import { NotificationContext } from '@renderer/services/NotificationService'
import { useMutation } from '@tanstack/react-query'
import { useContext, useState } from 'react'

const SettingsPage = () => {
    const isDebugMode = process.env.INFOSEC_AGENT_DEBUG === 'true' || process.env.INFOSEC_AGENT_DEBUG === '1'
    const [modules, setModules] = useState<Module[]>([])

    const appNotify = useContext(NotificationContext)

    const theme = useMantineTheme()
    const colorScheme = useMantineColorScheme()
    const isDark = colorScheme.colorScheme === 'dark'

    const addTestNotification = () => {
        appNotify?.addNotification({
            id: 1,
            title: 'Test Notification',
            desc: 'This is a test notification',
            type: 'info',
            read: false
        })

        console.log(appNotify)
    }

    const clearAllNotifications = () => {
        appNotify?.notifications.forEach((notification) => appNotify.removeNotification(notification.id))
        console.log(appNotify)
    }

    const getModules = useMutation({
        mutationKey: ['agentModules.getModules'],
        mutationFn: async () => {
            //@ts-ignore
            return await window.api.getModules()
        },
        onSuccess: (data) => {
            console.log(data)
            setModules(data)
        },
        onError: (error) => {
            console.error(error)
        }
      })

    const runAllModules = useMutation({
        mutationKey: ['agentModules.runAll'],
        mutationFn: async () => {
            //@ts-ignore
            return await window.api.runAllModules()
        },
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error(error)
        }
    })

    //   const colorSelect = [
    //     { value: theme.colors.blue[7], label: 'Blue' },
    //     { value: 1, label: 'Dark' }
    //   ]

  return (
    <>
        <Title order={1}>Settings</Title>
        {isDebugMode && (
            <Alert variant='light' color='orange' title='Debugging Enabled' icon={<RocketIcon />} m={10}>
                Debugging is enabled. This may expose sensitive information to the console! Disable this feature when not needed. Additional settings are visible, proceed with caution.
            </Alert>
        )}
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>General Settings</Title>
            <Text size='md' fw={700} mt={5}>Display</Text>
            
            <Group>
                <Button variant='default' 
                    m={5} 
                    onClick={() => colorScheme.toggleColorScheme()} 
                    leftSection={isDark ? <SunIcon /> : <MoonIcon /> }>
                        {isDark ? "Change to Light Mode" : "Change to Dark Mode" }
                </Button>
                
            </Group>

            {/* TODO: Add Multiple Color Support */}
            {/* <Text size='md' fw={700} mt={5}>Color</Text>
            <Group>
                {colorSelect.map((color) => (
                    <ColorSwatch component='button' 
                        key={color.label} 
                        color={color.value.toString()}
                        onClick={() => theme.primaryColor({ primaryColor: color.value })}
                        >
                            {theme.primaryColor === color.value ? <CheckIcon /> : <></>}
                    </ColorSwatch>
                ))}
            </Group> */}
        </Paper>

        {isDebugMode && (
            <Paper shadow='lg' radius='md' p={20} m={10}>
                <Title order={2}>Debug Menu</Title>
                <Text size='md' fw={700} mt={5}>Notifications</Text>
                <Text size='sm' mt={5}>Testing operations for notification system</Text>
                <Group>
                    <Button variant='default' m={5} onClick={addTestNotification}>Add Test Notification</Button>
                    <Button variant='default' m={5} onClick={clearAllNotifications}>Clear All Notifications</Button>
                </Group>
                <Text size='md' fw={700} mt={5}>Modules</Text>
                <Text size='sm' mt={5}>Testing operations for agent module system</Text>
                <Button variant='default' m={5} onClick={() => getModules.mutate()} loading={getModules.isPending}>Get Modules</Button>
                {getModules.isError && <Text size='xs' c='red'>{getModules.error?.message}</Text>}
                <Button variant='default' m={5} onClick={() => runAllModules.mutate()} loading={runAllModules.isPending}>Run All Modules</Button>
            </Paper>
        )}
    </>
  )
}

export default SettingsPage