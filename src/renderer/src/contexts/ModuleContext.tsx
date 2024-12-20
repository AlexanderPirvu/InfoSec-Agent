import { createContext, useContext, useState } from "react"

export type Module = {
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

export interface ModulesContextType {
    modules: string[]
    addModule: (module: string) => void
    removeModule: (module: string) => void
    removeAllModules: () => void
    getModules: () => string[]
    getModulesCount: () => number
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
    const [modules, setModules] = useState<string[]>([])

    const addModule = (module: string) => {
        setModules([...modules, module])
    }

    const removeModule = (module: string) => {
        setModules(modules.filter((mod) => mod !== module))
    }

    const removeAllModules = () => {
        setModules([])
    }

    const getModules = () => {
        return modules
    }

    const getModulesCount = () => {
        return modules.length
    }

    return (
        <ModulesContext.Provider value={{ modules, addModule, removeModule, removeAllModules, getModules, getModulesCount }}>
            {children}
        </ModulesContext.Provider>
    )
}