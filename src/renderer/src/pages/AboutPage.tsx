import { Paper, Text, Title } from '@mantine/core'

const AboutPage = () => {

  return (
    <>
        <Title order={1}>About</Title>
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Summary</Title>
            <Text size='md' mt={5}>
                The InfoSec Agent project aims to improve the security and privacy posture of computer users. 
                Currently, there are applications available that already achieve this, but they are mainly targeted at large companies. 
                The goal of this project is to make this accessible to everyone. 
                An application is being developed that collects information about the user's system to discover any security or privacy-related vulnerabilities. 
                The results will be presented to the user in a special dashboard, showing the current status of the system and recommended actions to improve it.
            </Text>
        </Paper>
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Affiliations</Title>
            <Text size='md' mt={5}>
                The InfoSec Agent project is a collaborative effort involving students from Fontys University of Applied Sciences in Eindhoven, The Netherlands in partnership with the Dutch IT company Guardian360.
                It serves as the cybersecurity project for the CyberSecurity Advanced Semester in the Bachelor's program at Fontys ICT.
            </Text>
        </Paper>
        <Paper shadow='lg' radius='md' p={20} m={10}>
            <Title order={2}>Contributing</Title>
            <Text size='md' mt={5}>
                The InfoSec Agent is an open-source project and contributions are welcome. 
                Feel free to report any issues or submit pull requests on the project's GitHub repository.
                Your feedback is valuable and will help improve the project. 
            </Text>
        </Paper>
    </>
  )
}

export default AboutPage