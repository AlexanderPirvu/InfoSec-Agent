import { Center, CheckIcon, CloseIcon, Grid, Paper, SimpleGrid, Text, Title } from '@mantine/core'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { useModules } from '@renderer/contexts/ModuleContext'

const SecurityPage = () => {

    const appModules = useModules()
    const appModuleResults = appModules.results

    const results = appModuleResults?.map((result) => {

        return (
            <Paper shadow='xs' radius='md' p={10} m={5}>
                <Grid>
                    <Grid.Col span={1}>
                        <Center h='100%'>
                        {result.status === 'success' && (<CheckIcon color='green' size='20' />)}
                        {result.status === 'warning' && (<InfoCircledIcon color='yellow' />)}
                        {result.status === 'fail' && (<CloseIcon color='red' size='30' />)}
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={11}>
                        <Title order={3}>{result.moduleName}</Title>
                        <Text size='sm' mt={5}>{result.message}</Text>
                        <Text size='sm' mt={5}><strong>{result.fix ? 'Fix: ' : ''} </strong>{result.fix}</Text>
                    </Grid.Col>
                </Grid>
            </Paper>
        )
    })

    const stats = [
        {
            title: 'Critical',
            value: appModules.resultsData.fail,
            color: 'red'
        },
        {
            title: 'Warnings',
            value: appModules.resultsData.warning,
            color: 'yellow'
        },
        {
            title: 'Pass',
            value: appModules.resultsData.success,
            color: 'green'
        }
    ]

    const statCards = stats.map((stat) => {
        return (
            <Paper shadow='xs' radius='md' p={10} m={5} bg={stat.color}>
                <Title order={3}>{stat.title}</Title>
                <Text size='lg' mt={5}>{stat.value}</Text>
            </Paper>
        )
    })

    return (
        <>
            <Title order={1} m={10}>Security</Title>
            <SimpleGrid cols={3}>
                {statCards}
            </SimpleGrid>
            
            {results}
        </>
    )
}

export default SecurityPage