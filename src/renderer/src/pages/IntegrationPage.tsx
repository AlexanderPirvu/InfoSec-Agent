import { Paper, Text, Title } from '@mantine/core'

const IntegrationPage = () => {

  return (
    <>
        <Title order={1}>Integration</Title>
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Connect to the Lighthouse API</Title>
            <Text size='md' mt={5}>
                <strong>Coming Soon!</strong><br />
                This functionality is not yet available. <br />
                The InfoSec Agent will be able to connect to Guardian360's Lighthouse API in the near future.
            </Text>
        </Paper>
    </>
  )
}

export default IntegrationPage