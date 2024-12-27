import { Alert, Button, Card, Group, LoadingOverlay, Paper, Progress, SimpleGrid, Text, Title, useMantineColorScheme } from '@mantine/core'
import { MoonIcon, RocketIcon, SunIcon } from '@radix-ui/react-icons'
import ModuleCard from '@renderer/components/ModuleCard/ModuleCard'
import { ModulesContext, useModules } from '@renderer/contexts/ModuleContext'
import { NotificationContext } from '@renderer/contexts/NotificationContext'
import { useMutation } from '@tanstack/react-query'
import { app } from 'electron'
import { useContext } from 'react'

const SettingsPage = () => {
    const isDebugMode = process.env.INFOSEC_AGENT_DEBUG === 'true' || process.env.INFOSEC_AGENT_DEBUG === '1'

    const appNotify = useContext(NotificationContext)
    const appModules = useModules()

    // const theme = useMantineTheme()
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

    const loadedModules = appModules.modules?.map((module) => <ModuleCard module={module} />)
    const loadingModules = [...Array(4)].map(() => <ModuleCard />) 

    const clearAllNotifications = () => {
        appNotify?.notifications.forEach((notification) => appNotify.removeNotification(notification.id))
        console.log(appNotify)
    }

    const getModules = useMutation({
        mutationKey: ['agentModules.getModules'],
        mutationFn: async () => {
            //@ts-ignore
            return await appModules.initModules()
        },
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (error) => {
            console.error(error)
        }
      })

    const runAllModules = useMutation({
        mutationKey: ['agentModules.runAll'],
        mutationFn: async () => {
            //@ts-ignore
            const data = await appModules.runAllModules()

            return data
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
    console.log(appModules.ranModules)
    console.log(appModules.totalModules)
  return (
    <>
        <Title order={1}>Settings</Title>
        {isDebugMode && (
            <Alert variant='light' color='orange' title='Debugging Enabled' icon={<RocketIcon />} m={10}>
                Debugging is enabled. This may expose sensitive information to the console! Disable this feature when not needed. Additional settings are visible, proceed with caution.
            </Alert>
        )}

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
                <Button variant='default' m={5} onClick={() => appModules.initModules()} loading={appModules.fetching}>Get Modules 2</Button>
                <Button variant='default' m={5} onClick={() => runAllModules.mutate()} loading={runAllModules.isPending}>Run All Modules</Button>
                {runAllModules.isError && (<Alert variant='filled' color='red' title='Error Running Modules' icon={<RocketIcon />} m={10} />)}
                {(runAllModules.isPending || runAllModules.isSuccess) && (<Progress value={(appModules.ranModules / appModules.totalModules) * 100} animated />)}
            </Paper>
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

        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Modules</Title>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3, lg: 5}} spacing={10}>
                {loadedModules?.length === 0 && (<Text size='md' fw={700} mt={5}>No Modules Loaded</Text>)}
                {(!loadedModules || !appModules.fetching) ? loadedModules : loadingModules}
            </SimpleGrid>
        </Paper>

        

        
    </>
  )
}

export default SettingsPage