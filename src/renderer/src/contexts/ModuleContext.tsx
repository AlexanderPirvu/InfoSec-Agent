import { createContext, useContext, useState } from "react"


export type ModuleConfig = {
    name: string
    exec: string
    isSudo: boolean
    os: string[]
    authors?: string[]
    desc?: string
    version?: string
    args?: string[]
    out?: {} | null
}

export type ModuleResult = {
    status: "success" | "warn" | "fail"
    message: string
    fix?: string
    moduleName: string
}

export type Module = {
    name: string
    path: string
    config: ModuleConfig
    result: ModuleResult[] | undefined | any
}

export interface ModulesContextType {
    modules: Module[] | undefined
    results: JSON[] | undefined
    fetching: boolean
    // addModule: (module: string) => void
    initModules: () => Promise<Module[] | void>
    runAllModules: () => Promise<JSON[] | void>
    ranModules: number
    totalModules: number
    // removeModule: (module: string) => void
    // removeAllModules: () => void
    // getModules: () => string[]
    // getModulesCount: () => number
}

export const ModulesContext = createContext<ModulesContextType | undefined>(undefined)

export const useModules = () => {
    const context = useContext(ModulesContext)
    if (!context) {
        throw new Error('useModules must be used within a ModulesProvider')
    }
    return context
}

export const ModulesProvider = ({ children }: { children: React.ReactNode }) => {
    const [fetchingModules, setFetchingModules] = useState<boolean>(false)
    const [modules, setModules] = useState<Module[]>([])
    const [moduleResults, setModuleResults] = useState<JSON[]>([])
    const [ranModules, setRanModules] = useState<number>(0)
    const [totalModules, setTotalModules] = useState<number>(0)

    // const addModule = (module: string) => {
    //     setModules([...modules, module])
    // }

    
    const initModules = async () => {
        setFetchingModules(true)
        // @ts-expect-error (API Defined in Electron preload)
        const agentModules = await window.agentModules.getModules()
        setModules(agentModules)
        console.log("Agent Modules:", agentModules)
        setTotalModules(agentModules.length)
        setTimeout(() => {
            setFetchingModules(false)
        }, 1000)
    }
    
    const runAllModules = async () => {
        // @ts-expect-error (API Defined in Electron preload)
        window.agentModules.getRunAllModulesProgress((ranModules: number, totalModules: number) => { 
            console.log(`Ran ${ranModules} out of ${totalModules} modules`)

            setRanModules(ranModules)
            setTotalModules(totalModules)
        })
        // @ts-expect-error (API Defined in Electron preload)
        const agentModulesResults = await window.agentModules.runAllModules()
        setModuleResults(agentModulesResults)

        return agentModulesResults
    }

    // const removeModule = (module: string) => {
    //     setModules(modules.filter((mod) => mod !== module))
    // }

    // const removeAllModules = () => {
    //     setModules([])
    // }

    // const getModules = () => {
    //     return modules
    // }

    // const getModulesCount = () => {
    //     return modules.length
    // }

    return (
        <ModulesContext.Provider value={{ modules, results: moduleResults, fetching: fetchingModules, initModules, runAllModules, ranModules, totalModules }}>
            {children}
        </ModulesContext.Provider>
    )
}