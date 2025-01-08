import { Badge, Button, Card, Flex, Grid, GridCol, Group, Text, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const HomePage = () => {

    const [username, setUsername] = useState<string | null>(null)

    const userInfo = useMutation({
        mutationKey: ['userInfo'],
        mutationFn: async () => {
            //@ts-ignore
            return await window.api.userInfo()
        },
        onSuccess: (data) => {
            console.log(data)
            setUsername(data)
        },
        onError: (error) => {
            console.error(error)
        }
    })

    useEffect(() => {
        userInfo.mutate()
    }, [])

    const dashCards = [
        { title: 'Total Notifications', value: 0 },
        { title: 'Total Modules', value: 0 },
        { title: 'Total Programs', value: 0 },
        { title: 'Total Checks', value: 0 },
    ]

    const dashCardElements = dashCards.map((card, index) => (
        <Card shadow='lg' w='45%' key={index} m='md'>
            <Title order={4}>{card.title}</Title>
            <Text size='xl'>{card.value}</Text>
        </Card>
    ))

    return (
        <>
            <Title order={1} m={10}>Welcome{username ? `, ${username}` : ''}</Title>
            <Grid mt="xl">
                <GridCol span={{ base: 6, lg: 4}}>
                    <Card shadow='lg' m='md'>
                    <Group justify='space-between' mt="md" mb="xs">
                        <Text fw={900}>Hello Linux!</Text>
                        <Badge color='yellow'>Linux</Badge>
                    </Group>
                        <Text size='sm'>
                            This is the new InfoSec Agent for Linux! We're excited to have you on board.
                        </Text>
                        <Button variant='light' size='sm' mt='md'>Explore us on GitHub</Button>
                    </Card>
                </GridCol>
                <GridCol span={{ base: 6, lg: 8}}>
                    <Flex>
                        {dashCardElements}
                    </Flex>
                </GridCol>
            </Grid>
        </>
    )
}

export default HomePage