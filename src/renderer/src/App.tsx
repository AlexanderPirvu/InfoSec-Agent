import { Heading, Section } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import CommandForm from "./components/CommandForm/CommandForm"
import RunModulesButton from "./components/RunModulesButton/RunModulesButton"

const queryClient = new QueryClient()

function App(): JSX.Element {
  // const ipcHandle = (): void => window.Electron.ipcRenderer.send("ping");

  return (
    <>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Section p='6'>
        <Heading size='9' weight='light'>InfoSec Agent</Heading>
      </Section>
      <Section p='6'>
        <CommandForm />
        <RunModulesButton />
      </Section>
    </QueryClientProvider>
    </>
  );
}

export default App;
