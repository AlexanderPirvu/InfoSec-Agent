import { Card, Skeleton, Text, Title } from '@mantine/core'
import { Module } from '@renderer/contexts/ModuleContext'

type Props = {
    module?: Module
}

const ModuleCard = (props: Props) => {
    if (props.module) {
        return (
            <Card shadow='xs' radius='md' p={10} m={5}>
                <Title order={3}>{props.module.name}</Title>
                <Text size='sm' mt={5}>{props.module.config.desc}</Text>
                <Text size='xs' mt={5}>Authors: {props.module.config.authors?.join(', ')}</Text>
                <Text size='xs' mt={5}>Module Version: {props.module.config.version}</Text>
                <Text size='xs' mt={5}>Executing Command: {props.module.config.exec}</Text>
                <Text size='xs' mt={5}>Requires Elevation: {props.module.config.isSudo ? 'Yes' : 'No'}</Text>
                <Text size='xs' mt={5}>Additional Arguments: {props.module.config.args?.join(', ')}</Text>
            </Card>
        )
    } else {
        return (
            <Card shadow='xs' radius='md' p={10} m={5}>
                <Skeleton w="75%"><Title order={3}>Module Name</Title></Skeleton>
                <Skeleton h={10} mt={5}><Text size='sm' mt={5}>Module Description</Text></Skeleton>
                <Skeleton h={10} mt={5}><Text size='xs' mt={5}>Authors: </Text></Skeleton>
                <Skeleton h={10} mt={5}><Text size='xs' mt={5}>Module Version: </Text></Skeleton>
                <Skeleton h={10} mt={5}><Text size='xs' mt={5}>Executing Command: </Text></Skeleton>
                <Skeleton h={10} mt={5}><Text size='xs' mt={5}>Requires Elevation: </Text></Skeleton>
                <Skeleton h={10} mt={5} w="25%"><Text size='xs' mt={5}>Additional Arguments: </Text></Skeleton>
            </Card>
        )
    }
}

export default ModuleCard