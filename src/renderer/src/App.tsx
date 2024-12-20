import { Section } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import InfoSecAgentLogo from "./assets/InfoSec-Agent-logo.png"

import '@mantine/core/styles.css'
import { AppShell, Box, Center, Grid, GridCol, Image, MantineColorsTuple, MantineProvider, NavLink, Title } from "@mantine/core"
import { CheckboxIcon, Crosshair2Icon, EyeOpenIcon, GearIcon, HomeIcon, InfoCircledIcon, Link2Icon, LockClosedIcon, MixIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import HomePage from "./pages/HomePage"
import SettingsPage from "./pages/SettingsPage"
import { NotificationProvider } from "./services/NotificationService"
import NotificationDrawer from "./components/NotificationDrawer/NotificationDrawer"

const queryClient = new QueryClient()

const themeColors: MantineColorsTuple = [
  "#f6eeff",
  "#e7d9f7",
  "#cab1ea",
  "#ad86dd",
  "#9462d2",
  "#854bcb",
  "#7d3fc9",
  "#6b31b2",
  "#5f2ba0",
  "#52238d"
]

const mantineTheme = { 
  black: '#000',
  colors: { themeColors },
  defaultRadius: 'lg',
}

function App(): JSX.Element {
  // const ipcHandle = (): void => window.Electron.ipcRenderer.send("ping");

  const [currentpage, setCurrentPage] = useState({label: 'Home', icon: HomeIcon, pageElement: HomePage})

  const pages = [
    { label: 'Home', icon: HomeIcon, pageElement: HomePage }, 
    { label: 'Security', icon: LockClosedIcon, pageElement: () => <div>Security Page</div> }, 
    { label: 'Privacy', icon: EyeOpenIcon, pageElement: () => <div>Privacy Page</div> }, 
    { label: 'Issues', icon: Crosshair2Icon, pageElement: () => <div>Issues Page</div> }, 
    { label: 'Programs', icon: MixIcon, pageElement: () => <div>Programs Page</div> }, 
    { label: 'Checks', icon: CheckboxIcon, pageElement: () => <div>Checks Page</div> }, 
    { label: 'Integration', icon: Link2Icon, pageElement: () => <div>Integration Page</div> }, 
    { label: 'About', icon: InfoCircledIcon, pageElement: () => <div>About Page</div> }, 
    { label: 'Settings', icon: GearIcon, pageElement: SettingsPage },
  ]

  const navBarLinks = pages.map((page) => (
    <NavLink key={page.label} label={page.label} leftSection={<page.icon/>} active={currentpage.label === page.label} onClick={() => setCurrentPage(page)}/>
  ))

  return (
    <>
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 200,
            breakpoint: 'sm',
          }}
          padding='md'
          
          >
            <AppShell.Header>
              <Grid columns={4}>
                <GridCol span={1}>
                  <Box m={10}>
                    <NotificationDrawer />
                  </Box>
                </GridCol>
                <GridCol span={2}>
                  <Center>
                    <Image src={InfoSecAgentLogo} alt="InfoSec Agent" width={40} height={40} m={4} />
                    <Title order={1} p={4}>InfoSec Agent</Title>
                  </Center>
                </GridCol>
                <GridCol span={1}>
                  
                </GridCol>
              </Grid>
            </AppShell.Header>
            <AppShell.Navbar>
              {navBarLinks}
            </AppShell.Navbar>
            <AppShell.Main>
              <Section p='1'>
                {<currentpage.pageElement />}
              </Section>
            </AppShell.Main>
        </AppShell>
      </QueryClientProvider>
      </NotificationProvider>
    </MantineProvider>
    </>
  );
}

export default App;
