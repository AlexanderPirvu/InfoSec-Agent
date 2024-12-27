import React, { createContext, useContext, useState } from 'react';
import InfoSecAgentLogo from '@renderer/assets/InfoSec-Agent-logo.png';

interface Notification {
    id: number
    title: string
    desc?: string
    type: 'success' | 'error' | 'info' | 'warn'
    read: boolean
}

export interface NotificationContextType {
    notifications: Notification[]
    newNotification: boolean
    addNotification: (notification: Notification) => void
    removeNotification: (id: number) => void
    removeAllNotifications: () => void
    getNotifications: () => Notification[]
    getNotificationsCount: () => number
    readNotification: (id: number) => void
}



// export class NotificationService implements NotificationContextType {
//     public notifications: Notification[]

//     constructor(notifications: Notification[] = []) {
//         this.notifications = notifications
//     }
    
//     public addNotification(notification: Notification) {
//         this.notifications.push(notification)
//     }
    
//     public removeNotification(id: number) {
//         this.notifications = this.notifications.filter((notification) => notification.id !== id)
//     }
    
//     public getNotifications() {
//         return this.notifications
//     }
    
//     public getNotificationsCount() {
//         return this.notifications.length
//     }

//     public static constructDefaults() {
//         return {
//             notifications: []
//         }
//     }
// }

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}

interface NotificationProviderProps {
    children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [newNotificationState, setNewNotificationState] = useState<boolean>(false)

    const addNotification = (notification: Notification) => {
        notification.id = notifications.length + 1
        setNotifications([...notifications, notification])
        const newnot = new window.Notification(notification.title, { body: notification.desc, icon: InfoSecAgentLogo })
        newnot.onclick = () => {
            console.log('Notification clicked')
        }
        setNewNotificationState(true)
    }

    const removeNotification = (id: number) => {
        setNotifications(notifications.filter((notification) => notification.id !== id))
    }

    const removeAllNotifications = () => {
        setNotifications([])
    }

    const getNotifications = () => {
        return notifications
    }

    const getNotificationsCount = () => {
        return notifications.length
    }

    const readNotification = (id: number) => {
        const notification = notifications.find((notification) => notification.id === id)
        if (notification) {
            notification.read = true
        }
    }

    const setNewNotification = (value: boolean) => {
        setNewNotificationState(value)
    }

    const value = {
        notifications,
        newNotification: newNotificationState,
        addNotification,
        removeNotification,
        getNotifications,
        getNotificationsCount,
        removeAllNotifications,
        readNotification,
        setNewNotification
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}
