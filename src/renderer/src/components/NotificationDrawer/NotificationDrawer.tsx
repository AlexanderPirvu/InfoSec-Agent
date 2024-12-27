import { Badge, Indicator, Menu, useMantineTheme } from "@mantine/core";
import { useNotification } from "@renderer/contexts/NotificationContext";
import { useEffect, useState } from "react";

const NotificationDrawer = () => {

    const appNotify = useNotification()
    const theme = useMantineTheme()
    // const colorScheme = useMantineColorScheme()

    const [notificationCount, setNotificationCount] = useState(appNotify.getNotificationsCount());
    const [menuItems, setMenuItems] = useState<JSX.Element[]>([]);
    // const [newNotifications, setNewNotifications] = useState(false);

    useEffect(() => {
        setNotificationCount(appNotify.getNotificationsCount());
        
        const menuItems = appNotify.notifications.map((notification) => (
            <Menu.Item key={notification.id} leftSection={!notification.read && <Indicator size={5} processing />} onClick={() => appNotify.readNotification(notification.id)}>
                {notification.title}
            </Menu.Item>
        ))

        appNotify.notifications?.forEach(notification => {
            if (!notification.read) {
                // setNewNotifications(true)
            }
        });

        setMenuItems(menuItems)
    }, [appNotify.notifications.length])

  return (
    <>
      <Menu shadow="md" width={200}>
      <Menu.Target>        
        <Badge variant="default" color={appNotify.newNotification ? theme.primaryColor : theme.primaryColor} p={16}>{notificationCount}</Badge>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Notifications</Menu.Label>
        {menuItems}

        <Menu.Divider />
        <Menu.Item
          color="red"
          onClick={() => {appNotify.removeAllNotifications()}}
        >
          Clear All Notifications
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
    </>
  );
};

export default NotificationDrawer;
