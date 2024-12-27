import { Badge, Box, Button, Card, Flex, Grid, GridCol, Group, Image, LoadingOverlay, RingProgress, Skeleton, Text } from '@mantine/core'
import { useModules } from '@renderer/contexts/ModuleContext'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const HomePage = () => {

  const [username, setUsername] = useState<string | null>(null)

  const appModules = useModules()

  const totalNotifications = appModules.results?.length ? appModules.results?.length : 0
  const failNotifications = appModules.results?.filter((result) => result.status === 'fail').length ? appModules.results?.filter((result) => result.status === 'fail').length : 0
  const warningNotifications = appModules.results?.filter((result) => result.status === 'warning').length ? appModules.results?.filter((result) => result.status === 'warning').length : 0
  const successNotifications = appModules.results?.filter((result) => result.status === 'success').length ? appModules.results?.filter((result) => result.status === 'success').length : 0

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
    console.log("RESULTS", appModules.results)
    console.log("TEST", appModules.results?.filter((result) => result.status === 'warning').length)
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
      <RingProgress
        size={200}
        thickness={30}
        
        label={
          <Text size="xs" ta="center" px="xs" style={{ pointerEvents: 'none' }}>
            Hover sections to see tooltips
          </Text>
        }
        sections={[
          { value: ((failNotifications/totalNotifications)*100), color: 'red', tooltip: `Failed - ${failNotifications}` },
          { value: ((warningNotifications/totalNotifications)*100), color: 'orange', tooltip: `Warning - ${warningNotifications}` },
          { value: ((successNotifications/totalNotifications)*100), color: 'green', tooltip: `Success - ${successNotifications}` },
        ]}
      />
    </>
  )
}

export default HomePage