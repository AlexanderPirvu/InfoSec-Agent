import { createContext, useContext, useEffect, useState } from "react"

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
    status: "success" | "warning" | "fail"
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

export type ResultData = {
    fail: number
    warning: number
    success: number
    total: number
}

export interface ModulesContextType {
    modules: Module[] | undefined
    results: ModuleResult[] | undefined
    resultsData: ResultData
    fetching: boolean
    initialRun: boolean
    initModules: () => Promise<Module[] | void>
    runAllModules: () => Promise<ModuleResult[] | void>
    ranModules: number
    totalModules: number
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
    const [initialRun, setInitialRun] = useState<boolean>(false)
    const [fetchingModules, setFetchingModules] = useState<boolean>(false)
    const [modules, setModules] = useState<Module[]>([])
    const [moduleResults, setModuleResults] = useState<ModuleResult[]>([])
    const [ranModules, setRanModules] = useState<number>(0)
    const [totalModules, setTotalModules] = useState<number>(0)
    const [moduleResultData, setModuleResultData] = useState<ResultData>({ fail: 0, warning: 0, success: 0, total: 0 })
    
    useEffect(() => {
        setModuleResultData({
            fail: moduleResults.filter((result) => result.status === "fail").length,
            warning: moduleResults.filter((result) => result.status === "warning").length,
            success: moduleResults.filter((result) => result.status === "success").length,
            total: moduleResults.length
        })
    }, [moduleResults.length])

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
        setInitialRun(true)
        // @ts-expect-error (API Defined in Electron preload)
        window.agentModules.getRunAllModulesProgress((ranModules: number, totalModules: number) => { 
            console.log(`Ran ${ranModules} out of ${totalModules} modules`)

            setRanModules(ranModules)
            setTotalModules(totalModules)
        })
        // @ts-expect-error (API Defined in Electron preload)
        const agentModulesResults = await window.agentModules.runAllModules()
        setModuleResults(agentModulesResults)
        console.log("Agent Modules Results:", agentModulesResults)
        return agentModulesResults
    }

    return (
        <ModulesContext.Provider value={{ modules, results: moduleResults, resultsData: moduleResultData, fetching: fetchingModules, initialRun, initModules, runAllModules, ranModules, totalModules }}>
            {children}
        </ModulesContext.Provider>
    )
}