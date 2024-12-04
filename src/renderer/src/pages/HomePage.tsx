import { Card, SimpleGrid, Text } from '@mantine/core'
import { HomeIcon } from '@radix-ui/react-icons'
import RunModulesButton from '@renderer/components/RunModulesButton/RunModulesButton'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const HomePage = () => {

  const [username, setUsername] = useState<string | null>(null)
  const [moduleInfo, setModuleInfo] = useState<string[] | null >(null)

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

  const homepageFeatures = [ 
    {title: 'Test', description: '', icon: HomeIcon},
  ]

  const featuresCards = homepageFeatures.map((feature) => (
    <Card key={feature.title} shadow='lg'>
      <feature.icon />
      <Text>{feature.title}</Text>
    </Card>
  ))

  return (
    <>
      <h1>Welcome{username ? `, ${username}` : ''}</h1>
      <SimpleGrid cols={{ base: 1, md: 3}} spacing='lg' >
        {featuresCards}
      </SimpleGrid>
      <RunModulesButton setModuleInfo={setModuleInfo} />
      <h3>{moduleInfo ? (
        moduleInfo.map((module) => (
          Object.entries(JSON.parse(module)).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{ marginRight: '8px' }}>{key}</h4>
              <span> =&gt; </span>
              <p style={{ marginLeft: '8px' }}>{value as string}</p>
            </div>
          ))
        ))
      ) : 'fu'}</h3>
    </>
  )
}

export default HomePage