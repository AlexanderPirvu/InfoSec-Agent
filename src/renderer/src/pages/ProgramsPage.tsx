import { Paper, ScrollArea, Table, Text, TextInput, Title } from '@mantine/core'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

type Program = {
    name: string
    version: string
}

const ProgramsPage = () => {
    const [programs, setPrograms] = useState<Program[] | null>(null)
    const [search, setSearch] = useState('')
    const [filteredPrograms, setFilteredPrograms] = useState<Program[] | null>(null)

    const programsInfo = useMutation({
    mutationKey: ['programsInfo'],
    mutationFn: async () => {
        //@ts-ignore
        return await window.agent.getSystemPrograms()
    },
    onSuccess: (data) => {
        console.log(data)
        setPrograms(data)
        setFilteredPrograms(filterPrograms(data, search))
        },
    onError: (error) => {
        console.error(error)
        }
    })
  
    useEffect(() => {
        programsInfo.mutate()
    }, [])

    const programsList = filteredPrograms?.map((program, index) => (
        <Table.Tr key={index}>
            <Table.Td>{program.name}</Table.Td>
            <Table.Td>{program.version}</Table.Td>
        </Table.Tr>
    ))

    function filterPrograms(programs: Program[], filter: string): Program[] {
        const query = filter.toLowerCase().trim()
        return programs.filter((program) => program.name.toLowerCase().includes(query))
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value)
        setFilteredPrograms(filterPrograms(programs!, search))
    }
    
    return (
        <>
            <Title order={1} m={10}>Programs</Title>
            <Paper shadow='lg' radius='md' p={20} m={10}>
                <Title order={2}>Installed Programs</Title>
                <TextInput placeholder='Search Programs' leftSection={<MagnifyingGlassIcon />} value={search} onChange={handleSearch} m={10}/>
                <ScrollArea>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Td><Text size='md' fw={700}>Program</Text></Table.Td>
                            <Table.Td><Text size='md' fw={700}>Version</Text></Table.Td>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {programsList}
                    </Table.Tbody>
                </Table>
                </ScrollArea>
            </Paper>
        </>
    )
}

export default ProgramsPage