import { Badge, Box, Button, Card, Flex, Grid, GridCol, Group, Image, LoadingOverlay, Skeleton, Text } from '@mantine/core'
import AllNotificationChart from '@renderer/components/AllNotificationChart/AllNotificationChart'
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

  return (
    <>
      <h1>Welcome{username ? `, ${username}` : ''}</h1>
      <Grid mt="xl">
        <GridCol span={6}>
          <Card shadow='lg'>
            <Card.Section>
              <Image src='https://via.placeholder.com/150' h={100} alt='placeholder' />
            </Card.Section>
            <Group justify='space-between' mt="md" mb="xs">
              <Text fw={900}>Hello Linux!</Text>
              <Badge color='yellow'>Linux</Badge>
            </Group>
            <Text size='sm'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nunc nec
              consectetur dictum, libero odio 
            </Text>
            <Button variant='light' size='sm' mt='md'>Read More</Button>
          </Card>
        </GridCol>
        <GridCol span={6}>
          <Box pos="relative">
            <LoadingOverlay visible />
            <Flex direction='row' align='center' justify="flex-start" wrap='wrap' gap='md'>
            <Card shadow='lg' w='45%'>
              <Skeleton height={100} animate={false} />
            </Card>
            <Card shadow='lg' w='45%'>
              <Skeleton height={100} animate={false} />
            </Card>
            <Card shadow='lg' w='45%'>
              <Skeleton height={100} animate={false} />
            </Card>
            <Card shadow='lg' w='45%'>
              <Skeleton height={100} animate={false} />
            </Card>
            </Flex>
          </Box>
        </GridCol>
      </Grid>
      <AllNotificationChart />
    </>
  )
}

export default HomePage