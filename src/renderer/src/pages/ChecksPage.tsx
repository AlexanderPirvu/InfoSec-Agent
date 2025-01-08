import { Card, Paper, Text, Title } from '@mantine/core'
import { useModules } from '@renderer/contexts/ModuleContext'

const ChecksPage = () => {

    const appModules = useModules()

    const moduleDescriptions = appModules.modules?.map((module) => {
        return (
            <Card shadow='xs' radius='md' p={10} m={5}>
                <Title order={3}>{module.name}</Title>
                <Text size='sm' mt={5}>{module.config.desc}</Text>
                <Text size='xs' mt={5}>Authors: {module.config.authors?.join(', ')}</Text>
                <Text size='xs' mt={5}>Module Version: {module.config.version}</Text>
            </Card>
        )
    })

    return (
        <>
            <Title order={1} m={10}>Checks</Title>
            <Paper shadow='lg' radius='md' p={20} m={10}>
                {moduleDescriptions}
            </Paper>
        </>
    )
}

export default ChecksPage