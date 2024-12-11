import { Alert, Button, Paper, Title } from '@mantine/core'
import { RocketIcon } from '@radix-ui/react-icons'
import { NotificationContext } from '@renderer/services/NotificationService'
import { useContext } from 'react'

const SettingsPage = () => {
    const isDebugMode = process.env.INFOSEC_AGENT_DEBUG === 'true' || process.env.INFOSEC_AGENT_DEBUG === '1'

    const appNotify = useContext(NotificationContext)

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

  return (
    <>
        <Title order={1}>Settings</Title>
        {isDebugMode && (
            <Alert variant='light' color='orange' title='Debugging Enabled' icon={<RocketIcon />} m={10}>
                Debugging is enabled. This may expose sensitive information to the console! Disable this feature when not needed. Additional settings are visible, proceed with caution.
            </Alert>
        )}

        {isDebugMode && (
            <Paper shadow='xs' radius='md' p={20} m={10}>
                <Title order={2}>Debug Menu</Title>
                <Button variant='default' m={5} onClick={addTestNotification}>Add Test Notification</Button>
                <Button variant='default' m={5} onClick={clearAllNotifications}>Clear All Notifications</Button>
                
            </Paper>
        )}
    </>
  )
}

export default SettingsPage