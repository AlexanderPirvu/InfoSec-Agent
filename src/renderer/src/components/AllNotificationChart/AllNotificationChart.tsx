import { DonutChart } from '@mantine/charts'
import { Card, rem, Skeleton } from '@mantine/core'
import { useModules } from '@renderer/contexts/ModuleContext'

type Props = {}

const AllNotificationChart = (_props: Props) => {

    const appModules = useModules()

    const data = [
        { value: appModules.resultsData.fail, color: 'red', name: `Failed Tests` },
        { value: appModules.resultsData.warning, color: 'yellow', name: `Warning Tests` },
        { value: appModules.resultsData.success, color: 'green', name: `Success Tests` }
    ]


  return (
    <>
        <Card shadow="lg" w={rem(220)} h={rem(220)}>
            <Skeleton visible={appModules.resultsData.total === 0}>
                <DonutChart size={190} paddingAngle={2} data={data} chartLabel="Module Results"></DonutChart>
            </Skeleton>
        </Card>
    </>
  )
}

export default AllNotificationChart